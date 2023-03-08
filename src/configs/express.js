import express from "express";
import axios from "axios";
import { createClient } from "redis";
import cors from "cors";

let result = {};
let values = "";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const redisClient = createClient();
await redisClient.connect();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Everything is OK!" });
});

app.get("/photos", async (req, res) => {
  let { albumId } = req.query;

  const photos = albumId
    ? await returnData(`photos?albumId=${albumId}`, async (albumId) => {
        const { data } = await axios.get(
          `https://jsonplaceholder.typicode.com/photos`,
          {
            params: { albumId },
          }
        );
        return data;
      })
    : await returnData("photos", async () => {
        const { data } = await axios.get(
          `https://jsonplaceholder.typicode.com/photos`
        );
        return data;
      });

  res.status(200).json(photos);
});

app.get("/photos/:id", async (req, res) => {
  let { id } = req.params;
  values = await redisClient.get(`photos/${id}`);

  return values
    ? res.status(200).json(JSON.parse(values))
    : ((result = await axios.get(
        `https://jsonplaceholder.typicode.com/photos/${id}`
      )),
      await redisClient.setEx(`photos/${id}`, 180, JSON.stringify(result.data)),
      res.status(200).json(result.data));
});

const returnData = (key, cb) => {
  return new Promise(async (resolve, reject) => {
    values = await redisClient.get(key);
    values
      ? resolve(JSON.parse(values))
      : ((result = await cb()),
        await redisClient.setEx(key, 180, JSON.stringify(result)),
        resolve(result));
  });
};
export default app;

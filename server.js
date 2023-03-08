import app from "./src/configs/express.js";

const PORT = 3000;

app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Listening on port: ${PORT}`);
});

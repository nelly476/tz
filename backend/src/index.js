import express from "express";
import cors from "cors";
import path from "path"
import dotenv from "dotenv";

import { getItems, updateSelection, updateSorting } from "../controllers/session.controller.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();


const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


app.get('/api/items', getItems);
app.post('/api/select', updateSelection);
app.post('/api/sort', updateSorting);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);

});
import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
import cors from "cors";
import { getItems, updateSelection, updateSorting } from "../controllers/session.controller.js";
// import path from "path";

// import { connectDB } from "../lib/db.js";

// import authRoutes from "../routes/auth.route.js";
// import messageRoutes from "../routes/message.route.js";
// import { app, server } from "../lib/socket.js";

// dotenv.config();

const PORT = 5001
// const __dirname = path.resolve();
const app = express();
app.use(express.json());
// app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


app.get('/items', getItems);
app.post('/select', updateSelection);
app.post('/sort', updateSorting);


app.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);

});
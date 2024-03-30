import express from "express";
import cors from "cors";
import { config } from "dotenv";
import mongoose from "mongoose";
import router from "./router";

const app = express();
app.use(express.json());
app.use(cors());

config();

config();
mongoose
  .connect(
    `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBURL}`,
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use("/", router);

export default app;

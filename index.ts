import express from "express";
import routes from "./src/routes/routes";
import { configDotenv } from "dotenv";
const dotenv = configDotenv();
import Cors from 'cors'

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();

app.use(express.json());

app.options('*', Cors())

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

app.use(routes);
app.listen(process.env.PORT, () => {
  console.log(`Rodando na porta ${process.env.PORT} 🚀🔥`);
});
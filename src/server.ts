import 'reflect-metadata';
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import * as dotenv from "dotenv";
dotenv.config();

import DbInstance from "./database/db-init";

// import { API_PREFIX } from "./config";
// import { initializeDatabase } from "./database/db-init";
import rootRouter from "./routes";

const app: Application = express();
const API_PREFIX = "/api/v1";

// Express Middlewares
app.use(helmet());
app.use(cors());

// Conditionally use morgan logging based on NODE_ENV
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Detailed logging in development
} else {
  app.use(morgan("combined")); // Or another logging format for production
}

// Body parsers
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log("Request Body:", req.body);
  next();
});

// Root Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "<h1>{TS-NODE-EXPRESS}</h1>" });
});

// Server Health Check
app.get("/health-check", (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is up and running!" });
});

// Use the central router
app.use(API_PREFIX, rootRouter);

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({ msg: "Not Found" });
});

// app.use(errorHandlerMiddleware);

// Start the server and connect to the database
const startServer = async () => {
  // First, connect to the database
  await DbInstance();

  // Then, start the express server
  const port = process.env.PORT || 5500;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
};

startServer();


// import app from './app';
// import { APP_PORT } from "./utilities/secrets";
// import logger from "./utilities/logger";

// app
//   .listen(APP_PORT, () => {
//     logger.info(`server running on port : ${APP_PORT}`);
//     console.log(`server running on port : ${APP_PORT}`);
//   })
//   .on('error', (e) => logger.error(e));
// app.use(errorHandlerMiddleware);

import { Route } from "@core/interfaces";
import mongoose from "mongoose";
import express from "express";
import hpp from "hpp";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { Logger } from "@core/utils";
import { errorMiddleware } from "@core/middlewares";
class App {
  public app: express.Application;
  public port: string | number;
  public production: boolean;
  constructor(routes: Route[]) {
    this.app = express();
    this.port = process.env.PORT || 5000;
    this.production = process.env.NODE_ENV == "production" ? true : false;

    this.connectToDatabase(); 
    this.initializeMiddleware();
    this.initializeRoutes(routes);
    this.initializeErrorMiddleware();
  }

  private initializeRoutes(routes: Route[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Server is listening on port ${this.port}`);
    });
  }

  private initializeMiddleware() {
    if (this.production) {
      this.app.use(hpp());
      this.app.use(helmet());
      this.app.use(morgan("combined"));
      this.app.use(cors({ origin: "your-domain.com", credentials: true }));
    } else {
      this.app.use(morgan("dev"));
      this.app.use(cors({ origin: true, credentials: true }));
    }

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeErrorMiddleware() {
    this.app.use(errorMiddleware);
  }

  private async connectToDatabase() {
    try {
      const connectionString = process.env.MONGODB_URL;
      if (!connectionString) {
        Logger.error("connectionString is undefined");
        return;
      }
      mongoose.connect(connectionString);
      Logger.info("Database connected ");
    } catch (error) {
      Logger.error("Connect error: " + error);
    }
  }
}

export default App;

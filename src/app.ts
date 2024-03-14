import { Route } from "@core/interfaces";
import mongoose from "mongoose";
import express from "express";
import hpp from "hpp";
import http from "http";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import socketIo from "socket.io";
import { Logger } from "@core/utils";
import { errorMiddleware } from "@core/middlewares";

const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const YAML = require("yaml");
class App {
  public app: express.Application;
  public port: string | number;
  public production: boolean;
  public server: http.Server;
  public io: socketIo.Server;
  constructor(routes: Route[]) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new socketIo.Server(this.server);
    this.port = process.env.PORT || 5000;
    this.production = process.env.NODE_ENV == "production" ? true : false;

    this.connectToDatabase();
    this.initializeMiddleware();
    this.initializeRoutes(routes);
    this.initializeErrorMiddleware();
    this.initializeSwagger();
    this.initSocketIo();
  }

  private initializeRoutes(routes: Route[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }
  private initSocketIo() {
    this.server = http.createServer(this.app);
    this.io = new socketIo.Server(this.server, {
      cors: {
        origin: "*",
      },
    });
    this.app.set("socketio", this.io);

    const users: any = {};
    this.io.on("connection", (socket: socketIo.Socket) => {
      Logger.warn("a user connected : " + socket.id);
      socket.emit("message", "Hello " + socket.id);

      socket.on("login", function (data) {
        Logger.warn("a user " + data.userId + " connected");
        // saving userId to object with socket ID
        users[socket.id] = data.userId;
      });

      socket.on("disconnect", function () {
        Logger.warn("user " + users[socket.id] + " disconnected");
        // remove saved socket from users object
        delete users[socket.id];
        Logger.warn("socket disconnected : " + socket.id);
      });
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

  //Swagger api
  private initializeSwagger() {
    const file = fs.readFileSync("./src/swagger.yaml", "utf8");
    const swaggerDocument = YAML.parse(file);

    this.app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
}

export default App;

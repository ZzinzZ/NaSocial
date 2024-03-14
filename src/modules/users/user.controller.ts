import { NextFunction, Request, Response } from "express";
import RegisterDto from "./dtos/register.dto";
import UserService from "./user.service";
import { TokenData } from "@modules/auth";

export default class UserController {
  private userService = new UserService();

  //Register User Controller
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model: RegisterDto = req.body;
      const tokenData: TokenData = await this.userService.createUser(model);
      const io = req.app.get("socketio");
      io.emit("user_created", `${model.email} has been registered`);
      res.status(201).json(tokenData);
    } catch (err) {
      next(err);
    }
  };

  //Get user by ID Controller
  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId: string = req.params.id;
      const user = await this.userService.getUserById(userId);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  //Update user by ID Controller
  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId: string = req.params.id;
      const model: RegisterDto = req.body;
      const user = await this.userService.updateUser(userId, model);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  public getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const users = await this.userService.getAllUser();
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  };

  public getAllPaging = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page: number = Number(req.params.page);
      const keyword = req.query.keyword || "";
      const paginationResult = await this.userService.getAllPaging(
        keyword.toString(),
        page
      );
      res.status(200).json(paginationResult);
    } catch (err) {
      next(err);
    }
  };

  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.userService.deleteUser(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next();
    }
  }
}

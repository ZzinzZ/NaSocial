import UserController from "./user.controller";
import { Route } from "@core/interfaces";
import validationMiddleware from "@core/middlewares/validation.middleware";
import { Router } from "express";
import RegisterDto from "./dtos/register.dto";
import { authMiddleware } from "@core/middlewares";

export default class UserRoute implements Route {
  public path = "/api/users";
  public router = Router();

  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Register new users route
    this.router.post(
      this.path,
      validationMiddleware(RegisterDto, true),
      this.userController.register
    ); // POST http://localhost:5000/api/users

    //get users route
    this.router.get(this.path + "/:id", this.userController.getUserById); // GET http://localhost:5000/api/user/:id

    //update users route
    this.router.put(
      this.path + "/:id",
      validationMiddleware(RegisterDto, true),
      this.userController.updateUser
    ); // PUT http://localhost:5000/api/users/:id

    //get all users routes
    this.router.get(this.path, this.userController.getAllUsers); // GET http://localhost:5000/api/users

    //get users route
    this.router.get(
      this.path + "/paging/:page",
      this.userController.getAllPaging
    ); // GET http://localhost:5000/api/users/paging

    //delete users route
    this.router.delete(
      this.path + "/:id" ,
      authMiddleware,
      this.userController.deleteUser
    ); // GET http://localhost:5000/api/users/paging
  }
}

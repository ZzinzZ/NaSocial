import { NextFunction, Request, Response } from "express";
import LoginDto from "./auth.dto";
import AuthService from "./auth.service";
import { TokenData } from "@modules/auth";

export default class AuthController {
  private authService = new AuthService();
  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model: LoginDto = req.body;
      const tokenData: TokenData = await this.authService.login(model);
      res.status(200).json(tokenData);
    } catch (err) {
      next(err);
    }
  };

  public getCurrentLoginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await this.authService.getCurrentLoginUser(req.user.id);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };
}

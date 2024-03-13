import { UserSchema } from "@modules/users";
import LoginDto from "./auth.dto";
import { DataStoredInToken, TokenData } from "@modules/auth";
import { isEmptyObject } from "@core/utils";
import { HttpException } from "@core/exceptions";
import IUser from "@modules/users/user.interface";
import gravatar from "gravatar";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

class AuthService {
  public userSchema = UserSchema;
  public async login(model: LoginDto): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }
    const user: IUser | null = await this.userSchema.findOne({
      email: model.email,
    });

    if (!user) {
      throw new HttpException(409, `email ${model.email} is not exists`);
    }

    const isMatchPassword = await bcryptjs.compare(
      model.password,
      user.password
    );

    if (!isMatchPassword) {
      throw new HttpException(400, "Credential is not valid");
    } else {
      return this.createToken(user);
    }
  }

  public async getCurrentLoginUser(userId: string): Promise<IUser> {
    const user = await this.userSchema.findById(userId);

    if (!user) {
      throw new HttpException(404, `User is not exist`);
    }
    return user;
  }

  

  private createToken(user: IUser): TokenData {
    const dataInToken: DataStoredInToken = { id: user._id };
    const secret: string = process.env.JWT_TOKEN_SECRET!;
    const expireIn: number = 3600;
    return {
      token: jwt.sign(dataInToken, secret, { expiresIn: expireIn }),
    };
  }
}

export default AuthService;

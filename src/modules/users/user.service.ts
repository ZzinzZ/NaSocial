import UserSchema from "./user.model";
import RegisterDto from "./dtos/register.dto";
import { DataStoredInToken, TokenData } from "@modules/auth";
import { isEmptyObject } from "@core/utils";
import { HttpException } from "@core/exceptions";
import IUser from "./user.interface";
import { IPagination } from "@core/interfaces";
import gravatar from "gravatar";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

class UserService {
  public userSchema = UserSchema;

  // Create user
  public async createUser(model: RegisterDto): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }
    const user = await this.userSchema.findOne({ email: model.email });

    if (user) {
      throw new HttpException(409, `email ${model.email} already exists`);
    }

    const avatar = gravatar.url(model.email!, {
      size: "200",
      rating: "pg",
      default: "mm",
    });

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(model.password!, salt);

    const createdUser: IUser = await this.userSchema.create({
      ...model,
      password: hashedPassword,
      avatar: avatar,
      date: Date.now(),
    });
    return this.createToken(createdUser);
  }


  //Update user
  public async updateUser(userId: string, model: RegisterDto): Promise<IUser> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty");
    }
    const user = await this.userSchema.findById(userId).exec();

    if (!user) {
      throw new HttpException(404, `UserId is not found`);
    }
    let avatar = user.avatar;
    if (user.email === model.email) {
      throw new HttpException(400, "You need to enter another email");
    } 

    const checkEmailExisted = await this.userSchema.find({
      $and: [
        {email: {$eq: model.email} },
        {_id: {$ne: userId}}
      ]
    }).exec();

    if(checkEmailExisted.length !== 0) {
      throw new HttpException(400, 'This email has been used');
    }

    let updateUserById;
    if (model.password) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(model.password, salt);
      updateUserById = await this.userSchema
        .findByIdAndUpdate(userId, {
          ...model,
          avatar: avatar,
          password: hashedPassword,
        }, {new: true})
        .exec();
    } else {
      updateUserById = await this.userSchema
        .findByIdAndUpdate(
          userId,
          {
            ...model,
            avatar: avatar,
          },
          { new: true }
        )
        .exec();
    }

    if (!updateUserById) {
      throw new HttpException(409, "User not found!");
    }
    return updateUserById;
  }


  //Get user by Id
  public async getUserById(userId: string): Promise<IUser> {
    const user = await this.userSchema.findById(userId);

    if (!user) {
      throw new HttpException(404, `User is not exist`);
    }
    return user;
  }


  // Get all users
  public async getAllUser(): Promise<IUser[]> {
    const user = await this.userSchema.find().exec();
    return user;
  }


  //Get all user paging
  public async getAllPaging(
    keyword: string,
    page: number
  ): Promise<IPagination<IUser>> {
    const pageSize: number = Number(process.env.PAGE_SIZE) || 10;
    let query = {};
    
    if (keyword) {
      query = {
        $or: [
          { email: keyword },
          { first_name: keyword },
          { last_name: keyword },
        ],
      };
    }
    const users = await this.userSchema
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const rowCount = await this.userSchema.find(query).countDocuments(query).exec();
    return {
      total: rowCount,
      page: page,
      pageSize: pageSize,
      items: users,
    } as IPagination<IUser>;
  }

  //Delete a user
  public async deleteUser(userId: string): Promise<IUser> {
    const deleteUser = await this.userSchema.findByIdAndDelete(userId).exec();
    if(!deleteUser) {
      throw new HttpException(404, "User not found");
    }
    return deleteUser;
  }


  //Create a new token
  private createToken(user: IUser): TokenData {
    const dataInToken: DataStoredInToken = { id: user._id };
    const secret: string = process.env.JWT_TOKEN_SECRET!;
    const expireIn: number = 3600;
    return {
      token: jwt.sign(dataInToken, secret, { expiresIn: expireIn }),
    };
  }
}

export default UserService;

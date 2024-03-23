import UserSchema from "./user.model";
import RegisterDto from "./dtos/register.dto";
import { TokenData } from "@modules/auth";
import { RefreshTokenSchema } from '@modules/refresh_token';
import { isEmptyObject } from "@core/utils";
import { HttpException } from "@core/exceptions";
import IUser from "./user.interface";
import { IPagination } from "@core/interfaces";
import gravatar from "gravatar";
import bcryptjs from "bcryptjs";

import { generateJwtToken, randomTokenString } from '@core/utils/helper';
class UserService {
  public userSchema = UserSchema;

  // Create user
  public async createUser(model: RegisterDto): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, 'Model is empty');
    }

    const user = await this.userSchema.findOne({ email: model.email }).exec();
    if (user) {
      throw new HttpException(409, `Your email ${model.email} already exist.`);
    }

    const avatar = gravatar.url(model.email, {
      size: '200',
      rating: 'g',
      default: 'mm',
    });

    const salt = await bcryptjs.genSalt(10);

    const hashedPassword = await bcryptjs.hash(model.password, salt);
    const createdUser = await this.userSchema.create({
      ...model,
      password: hashedPassword,
      avatar: avatar,
      date: Date.now(),
    });
    const refreshToken = await this.generateRefreshToken(createdUser._id);
    await refreshToken.save();

    return generateJwtToken(createdUser._id, refreshToken.token);
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
    const avatar = user.avatar;
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
  private async generateRefreshToken(userId: string) {
    // create a refresh token that expires in 7 days
    return new RefreshTokenSchema({
      user: userId,
      token: randomTokenString(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }
}

export default UserService;

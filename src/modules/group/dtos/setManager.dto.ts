import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export default class setManagerDto {
  @IsNotEmpty()
  public userId: string | undefined;
  public role: string | undefined;
}

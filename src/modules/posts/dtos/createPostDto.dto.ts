import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export default class CreatePostDto {
  @IsNotEmpty()
  public text: string | undefined;
}

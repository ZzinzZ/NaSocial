import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export default class AddExperienceDto {
  //   constructor(
  //     title: string,
  //     company: string,
  //     location: string,
  //     from: Date,
  //     to: Date,
  //     current: boolean,
  //     description: string
  //   ) {}

  @IsNotEmpty()
  public title: string | undefined;
  public company: string | undefined;
  public location: string | undefined;
  public from: Date | undefined;
  public to: Date | undefined;
  public current: boolean | undefined;
  public description: string | undefined;
}

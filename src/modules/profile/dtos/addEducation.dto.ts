import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export default class AddEducationDto {
  @IsNotEmpty()
  school: string | undefined;
  degree: string | undefined;
  fieldOfStudy: string | undefined;
  from: Date | undefined;
  to: Date | undefined;
  current: boolean | undefined;
  description: string | undefined;
}

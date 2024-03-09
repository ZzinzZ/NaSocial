import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export default class SendMessageDto {
  public conversationId: string | undefined;
  @IsNotEmpty()
  public to: string | undefined;
  @IsNotEmpty()
  public text: string | undefined;
}
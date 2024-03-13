import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export default class CreateCommentDto {
    @IsNotEmpty()
    public text: string | undefined;
    public userId: string | undefined;
    public postId: string | undefined;
}
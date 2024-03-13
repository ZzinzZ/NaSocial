import { NextFunction, Request, Response } from "express";
import SendMessageDto from "./dtos/sendMessage.dto";
import ConversationService from "./conversation.service";
import { IConversation } from "./conversation.interface";

export default class ConversationController {
  private conversationService = new ConversationService();

  // Send message
  public sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const messageDto: SendMessageDto = req.body;
      const conversation: IConversation =
        await this.conversationService.sendMessage(userId, messageDto);
      res.status(200).send(conversation);
    } catch (error) {
      next(error);
    }
  };

  // get the conversation
  public getConversations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const conversation: IConversation[] =
        await this.conversationService.getConversations(userId);
      res.status(200).send(conversation);
    } catch (error) {
      next(error);
    }
  };
}

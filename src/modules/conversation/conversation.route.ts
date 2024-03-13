import { Route } from "@core/interfaces";
import { Router } from "express";
import ConversationController from "./conversation.controller";
import { authMiddleware } from "@core/middlewares";
import validationMiddleware from "@core/middlewares/validation.middleware";
import SendMessageDto from "./dtos/sendMessage.dto";


export default class ConversationRoute implements Route {
  public path = "/api/v1/conversations";
  public router = Router();

  public conversationController = new ConversationController ();
  
  constructor() {
    this.initializeRoute();
  }

  private initializeRoute() {
    //POST send message
    this.router.post(
      this.path,
      authMiddleware,
      validationMiddleware(SendMessageDto, true),
      this.conversationController.sendMessage
    );

    //GET get conversation
    this.router.get(
      this.path,
      authMiddleware,
      this.conversationController.getConversations
    );
  }
}
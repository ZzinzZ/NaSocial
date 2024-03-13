import { ConversationSchema } from ".";
import { UserSchema } from "@modules/users";
import { IConversation, IMessage } from "./conversation.interface";
import SendMessageDto from "./dtos/sendMessage.dto";
import { HttpException } from "@core/exceptions";

export default class ConversationService {
  public async sendMessage(
    userId: string,
    sendMessages: SendMessageDto
  ): Promise<IConversation> {
    const user = await UserSchema.findById(userId).select("-password").exec();
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const toUser = await UserSchema.findById(sendMessages.to)
      .select("-password")
      .exec();

    if (!toUser) {
      throw new HttpException(404, "No recipient was found");
    }

    if (!sendMessages.conversationId) {
      let newConversation = await ConversationSchema.findOne({
        $or: [
          { $and: [{ user1: userId }, { user2: sendMessages.to }] },
          { $and: [{ user1: sendMessages.to }, { user2: userId }] },
        ],
      }).exec();
      if (newConversation) {
        newConversation.messages.unshift({
          to: sendMessages.to,
          from: userId,
          text: sendMessages.text,
        } as IMessage);
      } else {
        newConversation = new ConversationSchema({
          user1: userId,
          user2: sendMessages.to,
          messages: [
            {
              from: userId,
              to: sendMessages.to,
              text: sendMessages.text,
            },
          ],
        });
      }
      await newConversation.save();
      return newConversation;
    } else {
      const conversation = await ConversationSchema.findById(
        sendMessages.conversationId
      ).exec();

      if (!conversation) {
        throw new HttpException(404, "No conversation was found");
      }

      if (
        conversation.user1 !== userId ||
        (conversation.user2 !== sendMessages.to &&
          conversation.user1 !== sendMessages.to) ||
        conversation.user2 !== userId
      ) {
        throw new HttpException(404, "No conversation was found");
      }

      conversation?.messages.unshift({
        to: sendMessages.to,
        text: sendMessages.text,
        from: userId,
      } as IMessage);
      await conversation.save();
      return conversation;
    }
  }

  //get all conversation messages
  public async getConversations(userId: string): Promise<IConversation[]> {
    const user = await UserSchema.findById(userId).select('-password').exec();
    if(!user) {
        throw new HttpException(404, 'User not found');
    }
    const conversations = await ConversationSchema.find({
        $or: [{user1: userId}, {user2: userId}]
    }).sort({recentDate: -1})
    return conversations;

  }
}

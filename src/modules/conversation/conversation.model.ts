import mongoose, {Document} from "mongoose";
import { IConversation } from "./conversation.interface";

const ConversationSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  messages: [
    {
      from: {
        type: String,
        required: true,
      },
      to: {
        type: String,
        required: true,
      },
      read: {
        type: Boolean,
        default: false,
      },
      text: {
        type: String,
        required: true,
      },
      showOnFrom: {
        type: Boolean,
      },
      showOnTo: {
        type: Boolean,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  recentDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IConversation & Document>("conversation", ConversationSchema);
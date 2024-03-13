import mongoose from "mongoose";
import IUser from "./user.interface";

const UserSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, index: true, unique: true, required: true },
  password: { type: String, required: true },
  avatar: { type: String },
  date: { type: Date, default: Date.now },
});

export default mongoose.model<IUser & mongoose.Document>('user', UserSchema);
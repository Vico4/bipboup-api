import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  derbyName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean },
  earnedPoints: { type: Number, required: true },
});

export const UserModel = mongoose.model("BetUser", userSchema);

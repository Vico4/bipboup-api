import mongoose from "mongoose";

const betSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  gameId: { type: String, required: true },
  winnerBet: { type: String },
  scoreBet: { type: Number },
});

export const BetModel = mongoose.model("bets", betSchema);

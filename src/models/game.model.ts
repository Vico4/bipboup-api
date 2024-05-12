import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  startTime: { type: Date, required: true },
  scoreTeam1: { type: Number, required: true },
  scoreTeam2: { type: Number, required: true },
  pointDifference: { type: Number, required: true },
});

export const GameModel = mongoose.model("Game", gameSchema);

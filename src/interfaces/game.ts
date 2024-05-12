import { Types } from "mongoose";

export interface Game {
  _id: Types.ObjectId;
  team1: string;
  team2: string;
  startTime: Date;
  scoreTeam1: number;
  scoreTeam2: number;
  pointDifference: number;
}

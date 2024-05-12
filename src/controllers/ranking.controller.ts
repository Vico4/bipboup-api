import { Request, Response } from "express";
import { AuthenticatedRequestParams } from "../interfaces/authenticatedRequestParams";
import { UserModel } from "../models/user.model";
import { GameModel } from "../models/game.model";

export const getRanking = async (
  _req: Request<AuthenticatedRequestParams>,
  res: Response,
) => {
  try {
    const isFinal = await isRankingFinal();
    const users = await UserModel.find()
      .select("derbyName earnedPoints")
      .sort({ earnedPoints: 1 });
    res.status(200).json({ isFinal, ranking: users });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const isRankingFinal = async (): Promise<boolean> => {
  const allGames = await GameModel.find();
  console.log(allGames);
  for (const game of allGames) {
    if (game.scoreTeam1 === null || game.scoreTeam2 === null) {
      return false;
    }
  }
  return true;
};

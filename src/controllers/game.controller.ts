import { Request, Response } from "express";
import { ZodError } from "zod";
import { gameCreationSchema } from "../validation/gameValidation.schema";
import { GameModel } from "../models/game.model";

export const createGame = async (req: Request, res: Response) => {
  try {
    gameCreationSchema.parse(req.body);
    const createdGame = await GameModel.create({
      team1: req.body.team1,
      team2: req.body.team1,
      startTime: req.body.startTime,
      scoreTeam1: 0,
      scoreTeam2: 0,
      pointDifference: 0,
    });

    res.status(201).json({
      id: createdGame._id,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error });
    }
    res.status(500).json({ error });
  }
};

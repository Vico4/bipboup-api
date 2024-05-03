import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  gameCreationSchema,
  gameUpdateSchema,
} from "../validation/gameValidation.schema";
import { GameModel } from "../models/game.model";

export const createGame = async (req: Request, res: Response) => {
  try {
    gameCreationSchema.parse(req.body);
    const createdGame = await GameModel.create({
      team1: req.body.team1,
      team2: req.body.team2,
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
      return res.status(400).json({ error });
    }
    return res.status(500).json({ error });
  }
};

export const updateGame = async (req: Request, res: Response) => {
  try {
    const updateBody = gameUpdateSchema.parse(req.body);
    let update;

    if (updateBody.scoreTeam1 && updateBody.scoreTeam2) {
      const pointDifference = Math.abs(
        updateBody.scoreTeam1 - updateBody.scoreTeam2,
      );
      update = {
        pointDifference,
        ...updateBody,
      };
    } else {
      update = updateBody;
    }

    const updatedGame = await GameModel.findByIdAndUpdate(
      req.params.gameId,
      update,
    );

    if (!updatedGame) {
      throw new Error("game not found");
    }

    res.status(201).json({
      id: updatedGame._id,
    });
    // to-do : trigger scores recalculations
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error });
    }
    res.status(500).json({ error });
  }
};

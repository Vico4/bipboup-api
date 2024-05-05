import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  gameCreationSchema,
  gameUpdateSchema,
} from "../validation/gameValidation.schema";
import { GameModel } from "../models/game.model";
import { AuthenticatedRequestParams } from "../interfaces/authenticatedRequestParams";
import { BetModel } from "../models/bet.model";
import { Game } from "../interfaces/game";
import { UserModel } from "../models/user.model";

export const createGame = async (req: Request, res: Response) => {
  try {
    gameCreationSchema.parse(req.body);
    const createdGame = await GameModel.create({
      team1: req.body.team1,
      team2: req.body.team2,
      startTime: req.body.startTime,
      scoreTeam1: null,
      scoreTeam2: null,
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

    // not sure if we do this here or in a separate route we call after updating final score
    // todo: either have rule to update scores only once per game or recompute everything on every update
    if (updatedGame.scoreTeam1 !== null && updatedGame.scoreTeam2 !== null) {
      recomputePoints(updatedGame);
    }

    res.status(201).json({
      id: updatedGame._id,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error });
    }
    return res.status(500).json({ error });
  }
};

export const getAllGames = async (
  req: Request<AuthenticatedRequestParams>,
  res: Response,
) => {
  try {
    const games = await GameModel.find();
    return res.status(200).json(games);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const getGame = async (
  req: Request<AuthenticatedRequestParams & { gameId: string }>,
  res: Response,
) => {
  try {
    const game = await GameModel.findById(req.params.gameId);
    return res.status(200).json(game);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const deleteGame = async (req: Request, res: Response) => {
  try {
    const game = await GameModel.findByIdAndDelete(req.params.gameId);
    return res.status(200).json(game);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const recomputePoints = async (updatedGame: Game) => {
  const gameBets = await BetModel.find({ gameId: updatedGame._id.toString() });
  const winner =
    updatedGame.scoreTeam1 > updatedGame.scoreTeam2
      ? updatedGame.team1
      : updatedGame.team2;

  for (const bet of gameBets) {
    if (bet.winnerBet === winner) {
      await UserModel.findByIdAndUpdate(bet.userId, {
        $inc: { earnedPoints: 2 },
      });
      if (
        bet.scoreBet &&
        bet.scoreBet >= updatedGame.pointDifference - 10 &&
        bet.scoreBet <= updatedGame.pointDifference + 10
      ) {
        await UserModel.findByIdAndUpdate(bet.userId, {
          $inc: { earnedPoints: 2 },
        });
      } else if (
        bet.scoreBet &&
        bet.scoreBet >= updatedGame.pointDifference - 20 &&
        bet.scoreBet <= updatedGame.pointDifference + 20
      ) {
        await UserModel.findByIdAndUpdate(bet.userId, {
          $inc: { earnedPoints: 1 },
        });
      }
    }
  }
};

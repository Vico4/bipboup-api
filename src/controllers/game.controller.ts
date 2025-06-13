import { Request, Response } from "express";
import { ZodError } from "zod";

import { AuthenticatedRequestParams } from "../interfaces/authenticatedRequestParams";
import { Game } from "../interfaces/game";
import { BetModel } from "../models/bet.model";
import { GameModel } from "../models/game.model";
import { UserModel } from "../models/user.model";
import {
  gameCreationSchema,
  gameUpdateSchema,
} from "../validation/gameValidation.schema";

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
      return res.status(400).json(error.issues[0].message);
    }
    if (error instanceof Error) {
      return res.status(500).json(error.message);
    }
    return res.status(500).json(error);
  }
};

export const updateGame = async (req: Request, res: Response) => {
  try {
    const updateBody = gameUpdateSchema.parse(req.body);
    let update;

    if (updateBody.scoreTeam1 && updateBody.scoreTeam2) {
      await checkScoresCanBeUpdated(req.params.gameId);
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
      { new: true },
    );

    if (!updatedGame) {
      throw new Error("game not found");
    }

    if (
      updatedGame.scoreTeam1 !== null &&
      updatedGame.scoreTeam2 !== null &&
      updatedGame.scoreTeam1 !== undefined &&
      updatedGame.scoreTeam2 !== undefined
    ) {
      await recomputePoints(updatedGame as Game);
    }

    res.status(201).json({
      id: updatedGame._id,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json(error.issues[0].message);
    }
    if (error instanceof Error) {
      return res.status(500).json(error.message);
    }
    return res.status(500).json(error);
  }
};

export const getAllGames = async (
  req: Request<AuthenticatedRequestParams>,
  res: Response,
) => {
  try {
    const games = await GameModel.find({isArchived: false});
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

const checkScoresCanBeUpdated = async (gameId: string) => {
  const game = await GameModel.findById(gameId);

  const d = new Date();
  const today = d.setTime(d.getTime() + 2 * 60 * 60 * 1000);
  if (!game) {
    throw new Error("Game not found error");
  }
  if (new Date(today) < new Date(game?.startTime)) {
    throw new Error("Game has not started");
  }
  if (game.scoreTeam1 !== null && game.scoreTeam2 !== null) {
    throw new Error("You already entered scores, they cannot be modified");
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

export const archiveGames = async (req: Request, res: Response) => {
  try {
    await GameModel.updateMany({startTime: {"$lt": req.body.date}}, {isArchived: true});
    await GameModel.updateMany({startTime: {"$gte": req.body.date}}, {isArchived: false});
    return res.status(200).json({ message: "Games archived" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const recomputeAllPoints = async (req: Request, res: Response) => {
  try {
    const games = await GameModel.find({isArchived: false});
    await UserModel.updateMany({}, { earnedPoints: 0 });
    for (const game of games) {
      if (
        game.scoreTeam1 !== null &&
        game.scoreTeam2 !== null &&
        game.scoreTeam1 !== undefined &&
        game.scoreTeam2 !== undefined
      ) {
        await recomputePoints(game as Game);
      }
    }
    return res.status(200).json({ message: "All points recomputed" });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

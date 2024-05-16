import { Request, Response } from "express";
import { AuthenticatedRequestParams } from "../interfaces/authenticatedRequestParams";
import { ForbiddenActionError } from "../errors";
import { BetModel } from "../models/bet.model";
import {
  betCreationSchema,
  betUpdateSchema,
} from "../validation/betValidation.schema";
import { GameModel } from "../models/game.model";
import { BetParams } from "../interfaces/bet";

export const getUserBets = async (
  req: Request<AuthenticatedRequestParams>,
  res: Response,
) => {
  try {
    const { connectedUser } = req.params;
    if (!connectedUser) {
      throw new ForbiddenActionError();
    }

    const userBets = await BetModel.find({ userId: connectedUser.userId });
    res.status(200).json(userBets);
  } catch (error) {
    if (error instanceof ForbiddenActionError) {
      return res.status(403).json(error.message);
    }
    res.status(500).send(error);
  }
};

export const createBet = async (
  req: Request<AuthenticatedRequestParams>,
  res: Response,
) => {
  try {
    const { connectedUser } = req.params;
    if (!connectedUser) {
      throw new ForbiddenActionError();
    }

    const bet = betCreationSchema.parse(req.body);

    await checkBetIsAllowed(bet);

    const newBet = new BetModel({
      userId: connectedUser.userId,
      gameId: bet.gameId,
      winnerBet: bet.winnerBet,
      scoreBet: bet.scoreBet,
    });

    const createdBet = await newBet.save();
    res.status(201).json(createdBet);
  } catch (error) {
    if (error instanceof ForbiddenActionError) {
      return res.status(403).json(error.message);
    }
    res.status(500).send(error);
  }
};

export const updateBet = async (
  req: Request<AuthenticatedRequestParams & { betId: string }>,
  res: Response,
) => {
  try {
    const { connectedUser, betId } = req.params;
    const oldBet = await BetModel.findById(betId);
    if (
      !connectedUser ||
      !oldBet ||
      oldBet.userId.toString() !== connectedUser.userId
    ) {
      throw new ForbiddenActionError();
    }

    const betUpdate = betUpdateSchema.parse(req.body);

    await checkBetIsAllowed({ gameId: oldBet.gameId, ...betUpdate });

    const updatedBet = await BetModel.findByIdAndUpdate(betId, betUpdate, {
      new: true,
    });

    res.status(201).json(updatedBet);
  } catch (error) {
    if (error instanceof ForbiddenActionError) {
      return res.status(403).json(error.message);
    }
    res.status(500).send(error);
  }
};

const checkBetIsAllowed = async (bet: BetParams): Promise<void> => {
  const game = await GameModel.findById(bet.gameId);
  if (!game) {
    throw new Error("game not found");
  }
  const today = new Date();
  const gameDate = new Date(game?.startTime);
  if (today >= gameDate) {
    throw new Error("You can't place a bet after the game has started");
  }
  if (bet.winnerBet && ![game.team1, game.team2].includes(bet.winnerBet)) {
    throw new Error("You are betting on a team who doesn't play this game !");
  }
};

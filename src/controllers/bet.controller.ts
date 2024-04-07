import { Request, Response } from "express";
import { AuthenticatedRequestParams } from "../interfaces/authenticatedRequestParams";
import { ForbiddenActionError } from "../errors";
import { BetModel } from "../models/bet.model";
import { betCreationSchema } from "../validation/betValidation.schema";

export const getUserBets = async (req: Request<AuthenticatedRequestParams>, res: Response) => {
    try {
        const { connectedUser } = req.params;
        if(!connectedUser) {
            throw new ForbiddenActionError();
        }

        const userBets = await BetModel.find({ userId : connectedUser.userId})
        res.status(200).json(userBets);
    }
    catch (error) {
        if (error instanceof ForbiddenActionError) {
            return res.status(403).json({ message: error.message });
          }
        res.status(500).send(error);
    }
}

export const createBet = async (req: Request<AuthenticatedRequestParams>, res: Response) => {
    try {
        const { connectedUser } = req.params;
        if(!connectedUser) {
            throw new ForbiddenActionError();
        }

        const bet = betCreationSchema.parse(req.body);

        const newBet = new BetModel({
            userId: connectedUser.userId,
            gameId: bet.gameId,
            winnerBet: bet.winnerBet,
            scoreBet: bet.scoreBet
        });

        const createdBet = await newBet.save();
        res.status(201).json(createdBet);
    }
    catch (error) {
        if (error instanceof ForbiddenActionError) {
            return res.status(403).json({ message: error.message });
          }
        res.status(500).send(error);
    }
}

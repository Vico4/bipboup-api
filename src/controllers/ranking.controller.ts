import { Request, Response } from "express";
import { AuthenticatedRequestParams } from "../interfaces/authenticatedRequestParams";
import { UserModel } from "../models/user.model";

export const getRanking = async (  _req: Request<AuthenticatedRequestParams>,
    res: Response) => {
    try {
        const users = await UserModel.find().select('derbyName earnedPoints').sort({ earnedPoints: 1 });
        res.status(200).json({ isFinal: true, ranking: users});
    } catch (error) {
        res.status(500).json({ error });
    }

}
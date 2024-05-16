import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { AuthenticatedRequestParams } from "../interfaces/authenticatedRequestParams";

export const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || "";
    const user = jwt.verify(
      token,
      process.env.JWTSECRET as Secret,
    ) as JwtPayload;
    if (!user.isAdmin) {
      throw new Error("you don't have admin rights");
    }
    next();
  } catch (error) {
    res.status(401).json(error);
  }
};

export const authenticateUser = (
  req: Request<AuthenticatedRequestParams>,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || "";
    const user = jwt.verify(
      token,
      process.env.JWTSECRET as Secret,
    ) as JwtPayload;
    req.params.connectedUser = user as { userId: string; isAdmin: boolean };
    next();
  } catch (error) {
    res.status(401).json(error);
  }
};

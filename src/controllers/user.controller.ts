import jwt, { Secret } from "jsonwebtoken";
import { UserModel } from "../models/user.model";
import bcrypt from "bcrypt";

import { Request, Response } from "express";

export const signup = async (req: Request, res: Response) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);

    const user = await UserModel.create({
      email: req.body.email,
      password: hash,
      derbyName: req.body.name,
      isAdmin: req.body.isAdmin,
      earnedPoints: 0,
    });

    res.status(201).json({
      email: user.email,
      derbyName: user.derbyName,
      isAdmin: user.isAdmin,
      earnedPoints: user.earnedPoints,
      token: jwt.sign(
        { userId: user._id, isAdmin: user.isAdmin },
        process.env.JWTSECRET as Secret,
        { expiresIn: "7d" },
      ),
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Paire login/mot de passe incorrecte" });
    }
    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) {
      return res
        .status(401)
        .json({ message: "Paire login/mot de passe incorrecte" });
    }
    res.status(200).json({
      email: user.email,
      derbyName: user.derbyName,
      isAdmin: user.isAdmin,
      earnedPoints: user.earnedPoints,
      token: jwt.sign(
        { userId: user._id, isAdmin: user.isAdmin },
        process.env.JWTSECRET as Secret,
        { expiresIn: "7d" },
      ),
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

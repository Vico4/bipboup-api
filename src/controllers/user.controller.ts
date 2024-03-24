import jwt, { Secret } from "jsonwebtoken";
import { UserModel } from "../models/user.model";
import bcrypt from "bcrypt";

import { Request, Response } from "express";

export const signup = (req: Request, res: Response) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new UserModel({
        email: req.body.email,
        password: hash,
        derbyName: req.body.name,
        isAdmin: req.body.isAdmin,
        earnedPoints: 0,
      });
      user
        .save()
        .then(() =>
          res.status(201).json({
            ...user,
            token: jwt.sign(
              { userId: user._id, isAdmin: user.isAdmin },
              process.env.JWTSECRET as Secret,
              { expiresIn: "7d" },
            ),
          }),
        )
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

export const login = (req: Request, res: Response) => {
  UserModel.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "Paire login/mot de passe incorrecte" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Paire login/mot de passe incorrecte" });
          }
          res.status(200).json({
            ...user,
            token: jwt.sign(
              { userId: user._id, isAdmin: user.isAdmin },
              process.env.JWTSECRET as Secret,
              { expiresIn: "7d" },
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

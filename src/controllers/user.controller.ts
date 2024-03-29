import jwt, { Secret } from "jsonwebtoken";
import { UserModel } from "../models/user.model";
import bcrypt from "bcrypt";

import { Request, Response } from "express";
import {
  manageAdminValidation,
  userCreationSchema,
  userEditionSchema,
} from "../validation/userValidation.schema";
import { ZodError } from "zod";

export const signup = async (req: Request, res: Response) => {
  try {
    userCreationSchema.parse(req.body);
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = await UserModel.create({
      email: req.body.email,
      password: hash,
      derbyName: req.body.name,
      isAdmin: false,
      earnedPoints: 0,
    });

    res.status(201).json({
      id: user._id,
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
    if (error instanceof ZodError) {
      res.status(400).json({ error });
    }
    res.status(500).json({ error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ message: "Incorrect login informations" });
    }
    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Incorrect login informations" });
    }
    res.status(200).json({
      id: user._id,
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

export const editProfile = async (
  req: Request<{
    userId: string;
    connectedUser: { userId: string; isAdmin: boolean };
  }>,
  res: Response,
) => {
  try {
    const { userId, connectedUser } = req.params;
    if (userId !== connectedUser.userId.toString()) {
      return res
        .status(401)
        .json({ message: "You can't update another player's profile !" });
    }

    const updates = userEditionSchema.parse(req.body);

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const manageAdminStatus = async (
  req: Request<{ userId: string }>,
  res: Response,
) => {
  try {
    const { userId } = req.params;

    const updates = manageAdminValidation.parse(req.body);

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const deleteUser = async (
  req: Request<{
    userId: string;
    connectedUser: { userId: string; isAdmin: boolean };
  }>,
  res: Response,
) => {
  try {
    const { userId, connectedUser } = req.params;
    if (userId !== connectedUser.userId.toString() && !connectedUser.isAdmin) {
      return res.status(401).json({
        message:
          "You can't delete another player's profile if you are not an admin !",
      });
    }

    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(500).json({ error });
  }
};

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
import {
  UserNotFoundError,
  ForbiddenActionError,
  BadLoginError,
} from "../errors";
import { AuthenticatedRequestParams } from "../interfaces/authenticatedRequestParams";

export const signup = async (req: Request, res: Response) => {
  try {
    userCreationSchema.parse(req.body);
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = await UserModel.create({
      email: req.body.email,
      password: hash,
      derbyName: req.body.derbyName,
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
      return res.status(400).json(error.issues[0].message);
    }
    return res.status(500).json({ error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      throw new BadLoginError();
    }
    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) {
      throw new BadLoginError();
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
    if (error instanceof BadLoginError) {
      return res.status(401).json(error.message);
    }
    return res.status(500).json({ error });
  }
};

export const editProfile = async (
  req: Request<AuthenticatedRequestParams>,
  res: Response,
) => {
  try {
    const { userId, connectedUser } = req.params;
    if (userId !== connectedUser?.userId.toString()) {
      throw new ForbiddenActionError();
    }

    const updates = userEditionSchema.parse(req.body);

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    if (!updatedUser) {
      throw new UserNotFoundError();
    }

    res
      .status(200)
      .json({ email: updatedUser.email, derbyName: updatedUser.derbyName });
  } catch (error) {
    if (error instanceof ForbiddenActionError) {
      return res.status(403).json(error.message);
    }
    if (error instanceof UserNotFoundError) {
      return res.status(404).json(error.message);
    }
    return res.status(500).json({ error });
  }
};

export const manageAdminStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const updates = manageAdminValidation.parse(req.body);

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    if (!updatedUser) {
      throw new UserNotFoundError();
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return res.status(404).json(error.message);
    }
    return res.status(500).json({ error });
  }
};

export const deleteUser = async (
  req: Request<AuthenticatedRequestParams>,
  res: Response,
) => {
  try {
    const { userId, connectedUser } = req.params;
    if (
      userId !== connectedUser?.userId.toString() &&
      !connectedUser?.isAdmin
    ) {
      throw new ForbiddenActionError();
    }

    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new UserNotFoundError();
    }

    res.status(200).json({ message: deletedUser.derbyName + " deleted" });
  } catch (error) {
    if (error instanceof ForbiddenActionError) {
      return res.status(403).json(error.message);
    }
    if (error instanceof UserNotFoundError) {
      return res.status(404).json(error.message);
    }
    return res.status(500).json({ error });
  }
};

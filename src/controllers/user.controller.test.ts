import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { deleteUser, editProfile, login, signup } from "./user.controller";
import { UserModel } from "../models/user.model";
import { AuthenticatedRequestParams } from "../interfaces/authenticatedRequestParams";

jest.mock("../models/user.model", () => ({
  UserModel: {
    create: jest.fn().mockResolvedValue({
      _id: "userId",
      email: "test@example.com",
      derbyName: "TestUser",
      isAdmin: false,
      earnedPoints: 0,
    }),
    findOne: jest.fn().mockResolvedValue({
      _id: "userId",
      email: "test@example.com",
      derbyName: "TestUser",
      isAdmin: false,
      earnedPoints: 0,
      password: "hashedPassword",
    }),
    findByIdAndUpdate: jest.fn().mockResolvedValue({
      _id: "existingUserId",
      email: "updated@example.com",
      derbyName: "UpdatedUser",
    }),
    findByIdAndDelete: jest.fn().mockResolvedValue({
      _id: "existingUserId",
      email: "updated@example.com",
      derbyName: "TestUser",
    }),
  },
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("fakeToken"),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedPaswword"),
  compare: jest.fn().mockResolvedValue(true),
}));

describe("user controller", () => {
  describe("signup function", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should signup user successfully", async () => {
      req = {
        body: {
          email: "test@example.com",
          password: "OkPassword60!",
          derbyName: "TestUser",
        },
      };

      await signup(req as Request, res as Response);

      expect(UserModel.create).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: "userId",
        email: "test@example.com",
        derbyName: "TestUser",
        isAdmin: false,
        earnedPoints: 0,
        token: "fakeToken",
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "userId", isAdmin: false },
        expect.any(String),
        { expiresIn: "7d" },
      );
    });

    it("should handle ZodError", async () => {
      req = {
        body: {
          email: "test@example.com",
          password: "badpwd",
          derbyName: "TestUser",
        },
      };

      await signup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("login function", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = {
        body: {
          email: "test@example.com",
          password: "password",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should login user successfully", async () => {
      await login(req as Request, res as Response);

      expect(UserModel.findOne).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: "userId",
        email: "test@example.com",
        derbyName: "TestUser",
        isAdmin: false,
        earnedPoints: 0,
        token: "fakeToken",
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "userId", isAdmin: false },
        expect.any(String),
        { expiresIn: "7d" },
      );
    });

    it("should handle bad login (user not found)", async () => {
      UserModel.findOne = jest.fn().mockResolvedValueOnce(null);

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Incorrect login informations",
      });
    });

    it("should handle bad login (invalid password)", async () => {
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Incorrect login informations",
      });
    });
  });

  describe("editProfile function", () => {
    let req: Partial<Request<AuthenticatedRequestParams>>;
    let res: Partial<Response>;

    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should edit profile successfully", async () => {
      req = {
        params: {
          userId: "existingUserId",
          connectedUser: { userId: "existingUserId", isAdmin: false },
        },
        body: {
          email: "updated@example.com",
          derbyName: "UpdatedUser",
        },
      };

      await editProfile(
        req as Request<AuthenticatedRequestParams>,
        res as Response,
      );

      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "existingUserId",
        {
          email: "updated@example.com",
          derbyName: "UpdatedUser",
        },
        { new: true },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        email: "updated@example.com",
        derbyName: "UpdatedUser",
      });
    });

    it("should handle forbidden action", async () => {
      req = {
        params: {
          userId: "existingUserId",
          connectedUser: { userId: "anotherUserId", isAdmin: false },
        },
        body: {
          email: "updated@example.com",
          derbyName: "UpdatedUser",
        },
      };
      await editProfile(
        req as Request<AuthenticatedRequestParams>,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "You do not have rights to perform this action",
      });
    });

    it("should handle user not found", async () => {
      UserModel.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(null);
      req = {
        params: {
          userId: "existingUserId",
          connectedUser: { userId: "existingUserId", isAdmin: false },
        },
        body: {
          email: "updated@example.com",
          derbyName: "UpdatedUser",
        },
      };
      await editProfile(
        req as Request<AuthenticatedRequestParams>,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  describe("deleteUser function", () => {
    let req: Partial<Request<AuthenticatedRequestParams>>;
    let res: Partial<Response>;

    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should delete profile successfully", async () => {
      req = {
        params: {
          userId: "existingUserId",
          connectedUser: { userId: "anotherUserId", isAdmin: true },
        },
      };

      await deleteUser(
        req as Request<AuthenticatedRequestParams>,
        res as Response,
      );

      expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith(
        "existingUserId",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "TestUser deleted",
      });
    });

    it("should handle forbidden action", async () => {
      req = {
        params: {
          userId: "existingUserId",
          connectedUser: { userId: "anotherUserId", isAdmin: false },
        },
        body: {
          email: "updated@example.com",
          derbyName: "TestUser",
        },
      };
      await editProfile(
        req as Request<AuthenticatedRequestParams>,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "You do not have rights to perform this action",
      });
    });

    it("should handle user not found", async () => {
      UserModel.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(null);
      req = {
        params: {
          userId: "existingUserId",
          connectedUser: { userId: "existingUserId", isAdmin: false },
        },
        body: {
          email: "updated@example.com",
          derbyName: "UpdatedUser",
        },
      };
      await editProfile(
        req as Request<AuthenticatedRequestParams>,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });
});

import { Request, Response } from "express";
import { AuthenticatedRequestParams } from "../interfaces/authenticatedRequestParams";
import { getRanking } from "./ranking.controller";

describe("RankingController", () => {
  describe("getRanking", () => {
    it("should return a ranking", async () => {
      // Arrange
      const users = [
        { derbyName: "user1", earnedPoints: 10 },
        { derbyName: "user2", earnedPoints: 20 },
        { derbyName: "user3", earnedPoints: 30 },
      ];

      const games = [
        {
          scoreTeam1: null,
          scoreTeam2: null,
        },
      ];
      const UserModel = {
        find: jest.fn().mockResolvedValue(users),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
      };

      const GameModel = {
        find: jest.fn().mockResolvedValue(games),
      };

      const req: Partial<Request<AuthenticatedRequestParams>> = {};
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Act
      await getRanking(
        req as Request<AuthenticatedRequestParams>,
        res as Response,
      );
      // Assert
      expect(UserModel.find).toHaveBeenCalled();
      expect(GameModel.find).toHaveBeenCalled();
      expect(UserModel.select).toHaveBeenCalledWith("derbyName earnedPoints");
      expect(UserModel.sort).toHaveBeenCalledWith({ earnedPoints: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ isFinal: false, ranking: users });
    });
  });
});

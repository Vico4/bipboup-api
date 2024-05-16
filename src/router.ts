import express from "express";

import {
  createBet,
  getUserBets,
  updateBet,
} from "./controllers/bet.controller";
import {
  createGame,
  deleteGame,
  getAllGames,
  getGame,
  recomputeAllPoints,
  updateGame,
} from "./controllers/game.controller";
import { getRanking } from "./controllers/ranking.controller";
import {
  deleteUser,
  editProfile,
  login,
  manageAdminStatus,
  signup,
} from "./controllers/user.controller";
import { authenticateAdmin, authenticateUser } from "./middlewares/auth";

const router = express.Router();

// user routes
router.post("/signup", signup);
router.post("/login", login);
router.patch("/user/:userId", authenticateUser, editProfile);
router.patch("/admin/:userId", authenticateAdmin, manageAdminStatus);
router.delete("/user/:userId", authenticateUser, deleteUser);

// bet routes
router.get("/bets", authenticateUser, getUserBets);
router.post("/bets", authenticateUser, createBet);
router.patch("/bets/:betId", authenticateUser, updateBet);

// ranking routes
router.get("/ranking", authenticateUser, getRanking);
// game routes
router.post("/game", authenticateAdmin, createGame);
router.patch("/game/:gameId", authenticateAdmin, updateGame);
router.get("/games", authenticateUser, getAllGames);
router.get("/game/:gameId", authenticateUser, getGame);
router.delete("/game/:gameId", authenticateAdmin, deleteGame);

router.post("recompute", authenticateAdmin, recomputeAllPoints)
export default router;

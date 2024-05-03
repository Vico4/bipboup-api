import express from "express";
import {
  deleteUser,
  editProfile,
  login,
  manageAdminStatus,
  signup,
} from "./controllers/user.controller";
import { authenticateAdmin, authenticateUser } from "./middlewares/auth";
import {
  createBet,
  getUserBets,
  updateBet,
} from "./controllers/bet.controller";
import { createGame, updateGame } from "./controllers/game.controller";

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

// game routes
router.post("/game", authenticateAdmin, createGame);
router.patch("/game/:gameId", authenticateAdmin, updateGame);

export default router;

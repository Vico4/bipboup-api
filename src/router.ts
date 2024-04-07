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
import { getRanking } from "./controllers/ranking.controller";

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

export default router;

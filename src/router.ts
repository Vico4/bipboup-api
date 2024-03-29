import express from "express";
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
router.patch("/:userId", authenticateUser, editProfile);
router.patch("/admin/:userId", authenticateAdmin, manageAdminStatus);
router.delete("/:userId", authenticateUser, deleteUser);

export default router;

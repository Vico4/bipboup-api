import express from "express";
import { editUser, login, signup } from "./controllers/user.controller";
import { authenticateUser } from "./middlewares/auth";

const router = express.Router();

// user routes
router.post("/signup", signup);
router.post("/login", login);
router.patch("/:userId", authenticateUser, editUser);

export default router;

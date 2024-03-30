import express from "express";
import { login, signup } from "./controllers/user.controller";

const router = express.Router();

// user routes
router.post("/signup", signup);
router.post("/login", login);

export default router;

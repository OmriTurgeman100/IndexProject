import express from "express";
import * as authController from "../controllers/authController";
import { validateUser } from "../schemas/userSchema"

const router = express.Router();

router
.route("/register")
.post(validateUser, authController.register_users);

router
.route("/login")
.post(authController.login_users);

router
.route("/refresh")
.post(authController.refresh_access_token);

router
.route("/logout")
.post(authController.logout_user);

export default router;


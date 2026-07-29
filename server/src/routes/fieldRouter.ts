import express from "express";
import * as fieldController from "../controllers/fieldController";
import * as authController from "../controllers/authController";

const router = express.Router();

router.use(authController.authenticate_jwt_token); 

router
  .route("/")
  .get(authController.restrictTo("admin", "editor", "viewer"), fieldController.systems_and_services_fields);

export default router;

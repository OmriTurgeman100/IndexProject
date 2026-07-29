import express from "express";
import * as userController from "../controllers/userController"
import * as authController from "../controllers/authController";

const router = express.Router();

router.use(authController.authenticate_jwt_token); 

router
  .route("/view-permissions")
  .get(authController.restrictTo("admin"), userController.display_user_permissions);

router
  .route("/me")
  .get(authController.restrictTo("admin", "editor", "viewer", "guest"), userController.display_me)

router
 .route("/me/scripts")
 .get(authController.restrictTo("admin", "editor", "viewer", "guest"), userController.display_me_scripts)

router
  .route("/set-permissions/:id")
  .patch(authController.restrictTo("admin"), userController.set_permissions);

router
  .route("/delete/:id")
  .delete(authController.restrictTo("admin"), userController.delete_user);

router
  .route("/delete/user_entity_access/:id")
  .delete(authController.restrictTo("admin"), userController.delete_user_entity_access);

router
 .route("/user_entity_access/:id")
 .post(authController.restrictTo("admin"), userController.attach_user_entity_access);

router
 .route("/set-access_scope/:id")
 .patch(authController.restrictTo("admin"), userController.set_access_scope); 

router
 .route("/attached_entities/:id")
 .get(authController.restrictTo("admin"), userController.get_attached_entities); 

router
 .route("/logs/:id")
 .get(authController.restrictTo("admin"), userController.display_user_logs);

router
 .route("/user_script_access/:id")
 .post(authController.restrictTo("admin"), userController.attach_user_script_access);

router
 .route("/set-script_scope/:id")
 .patch(authController.restrictTo("admin"), userController.set_script_scope);

 router
  .route("/delete/user_script_access/:id")
  .delete(authController.restrictTo("admin"), userController.delete_user_script_access);

router
 .route("/attached_scripts/:id")
 .get(authController.restrictTo("admin"), userController.get_attached_scripts);

router
 .route("/info/:id")
 .get(authController.restrictTo("admin"), userController.get_specific_user);

router
 .route("/set-user_is_script/:id")
 .patch(authController.restrictTo("admin"), userController.update_user_is_script);

export default router;
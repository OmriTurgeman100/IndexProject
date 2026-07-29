import express from "express";
import * as systemController from '../controllers/systemController'
import * as authController from "../controllers/authController";
import { upload } from "../utils/Buffer"

const router = express.Router();

router.use(authController.authenticate_jwt_token); 

router
 .route("/")
 .post(authController.restrictTo("admin", "editor"), systemController.insert_system)
 .get(authController.restrictTo("admin", "editor", "viewer"), systemController.systems);

router
.route("/menu")
.get(authController.restrictTo("admin", "editor", "viewer"), systemController.system_names_menu);

router
.route("/:id")
.patch(authController.restrictTo("admin", "editor"), systemController.update_system)
.get(authController.restrictTo("admin", "editor", "viewer"), authController.checkEntityAccess("system"), systemController.specific_system);

router
.route("/total/:id")
.patch(authController.restrictTo("admin", "editor"), systemController.update_system_total);

router
.route("/dependencies/:id")
.post(authController.restrictTo("admin", "editor"), systemController.insert_dependency)
.patch(authController.restrictTo("admin", "editor"), systemController.update_system_dependencies)
.get(authController.restrictTo("admin", "editor", "viewer"), systemController.system_dependencies);

router
.route("/authentication/:id")
.post(authController.restrictTo("admin", "editor"), systemController.insert_authentication_type)
.patch(authController.restrictTo("admin", "editor"), systemController.update_system_authentication)
.get(authController.restrictTo("admin", "editor","viewer"), systemController.system_authentication);

router
.route("/virtual_machines/:id")
.post(authController.restrictTo("admin", "editor"), systemController.insert_virtual_machine)
.patch(authController.restrictTo("admin", "editor"), systemController.update_system_virtual_machine)
.get(authController.restrictTo("admin", "editor","viewer"), systemController.system_virtual_machines);

router
.route("/dep/info/:id")
.post(authController.restrictTo("admin", "editor"), systemController.insert_system_dep_info)
.patch(authController.restrictTo("admin", "editor"), systemController.edit_system_dep_info)
.get(authController.restrictTo("admin", "editor", "viewer"), systemController.system_dep_info);

router
 .route("/dep/info/delete/:id")
 .delete(authController.restrictTo("admin", "editor"), systemController.delete_system_dep_info)

 router
 .route("/dep/delete/:id")
 .delete(authController.restrictTo("admin", "editor"), systemController.delete_system_dep)

 router
 .route("/vm/delete/:id")
 .delete(authController.restrictTo("admin", "editor"), systemController.delete_system_vm)

 router
 .route("/auth/delete/:id")
 .delete(authController.restrictTo("admin", "editor"), systemController.delete_system_auth)

router
 .route("/core/dependencies/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), systemController.services_related_to_system)
 .post(authController.restrictTo("admin", "editor"), systemController.link_service_to_system)

router
.route("/delete/core/dependency/:id")
.delete(authController.restrictTo("admin", "editor"), systemController.delete_service_to_system_relationship)

router
 .route("/links/:id")
 .get(authController.restrictTo("admin", "editor" ,"viewer"), systemController.get_system_links)
 .post(authController.restrictTo("admin", "editor"), systemController.create_system_link)
 .put(authController.restrictTo("admin", "editor"), systemController.update_system_link)
 .delete(authController.restrictTo("admin", "editor"), systemController.delete_system_link)

router
 .route("/docs/:id")
 .get(authController.restrictTo("admin", "editor" ,"viewer"), systemController.display_system_docs)
 .post(authController.restrictTo("admin", "editor"), systemController.create_system_doc)
 .put(authController.restrictTo("admin", "editor"), authController.checkEntityAccessDocsUpdate("system"), systemController.update_system_doc)

 router
 .route("/files/upload/:id")
 .post(authController.restrictTo("admin", "editor" ,"viewer"), upload.single("file"), systemController.upload_files)

router
 .route("/files/:id")
 .get(authController.restrictTo("admin", "editor" ,"viewer"), systemController.load_files)
 .delete(authController.restrictTo("admin"), systemController.delete_file)

router
 .route("/virtual_machines/upload/excel/:id")
 .post(authController.restrictTo("admin"),upload.single("file"), systemController.upload_vm_excel)

router
 .route("/sites/:id")
 .get(authController.restrictTo("admin", "editor" ,"viewer"), systemController.system_sites)

router
 .route("/scripts/execute/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), authController.checkScriptAccess("system"), systemController.execute_script)

router
 .route("/scripts/:id")
 .get(authController.restrictTo("admin"), systemController.display_scripts)
 .post(authController.restrictTo("admin"), systemController.create_script)
 .delete(authController.restrictTo("admin"), systemController.delete_script)
 .patch(authController.restrictTo("admin"), systemController.edit_script)

export default router;
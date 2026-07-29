import express from "express";
import * as serviceController from '../controllers/serviceController'
import * as authController from "../controllers/authController";
import { upload } from "../utils/Buffer"

const router = express.Router();

router.use(authController.authenticate_jwt_token); 

router
 .route("/")
 .post(authController.restrictTo("admin", "editor"), serviceController.insert_service)
 .get(authController.restrictTo("admin", "editor", "viewer"), serviceController.services);

router
 .route("/menu")
 .get(authController.restrictTo("admin", "editor", "viewer"), serviceController.services_menu);

router
.route("/:id")
.patch(authController.restrictTo("admin", "editor"), serviceController.update_service)
.get(authController.restrictTo("admin", "editor", "viewer"), authController.checkEntityAccess("service"), serviceController.specific_service);

router
.route("/total/:id")
.patch(authController.restrictTo("admin", "editor"), serviceController.update_service_total);

router
.route("/dependencies/:id")
.post(authController.restrictTo("admin", "editor"), serviceController.insert_service_dependencies)
.patch(authController.restrictTo("admin", "editor"), serviceController.update_service_dependencies)
.get(authController.restrictTo("admin", "editor", "viewer"), serviceController.service_dependencies);

router
.route("/virtual_machines/:id")
.post(authController.restrictTo("admin", "editor"), serviceController.insert_service_virtual_machines)
.patch(authController.restrictTo("admin", "editor"), serviceController.update_service_virtual_machine)
.get(authController.restrictTo("admin", "editor", "viewer"), serviceController.service_virtual_machines);

router
.route("/dep/info/:id")
.post(authController.restrictTo("admin", "editor"), serviceController.insert_service_dep_info)
.patch(authController.restrictTo("admin", "editor"), serviceController.edit_service_dep_info)
.get(authController.restrictTo("admin", "editor", "viewer"), serviceController.service_dep_info);

router
 .route("/dep/info/delete/:id")
 .delete(authController.restrictTo("admin", "editor"), serviceController.delete_service_dep_info)

 router
 .route("/dep/delete/:id")
 .delete(authController.restrictTo("admin", "editor"), serviceController.delete_service_dep)

 router
 .route("/vm/delete/:id")
 .delete(authController.restrictTo("admin", "editor"), serviceController.delete_service_vm)

router
 .route("/core/relationships/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), serviceController.systems_related_to_service)

router
 .route("/links/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), serviceController.get_service_links)
 .post(authController.restrictTo("admin", "editor"), serviceController.create_service_link)
 .put(authController.restrictTo("admin", "editor"), serviceController.update_service_link)
 .delete(authController.restrictTo("admin", "editor"), serviceController.delete_service_link)

router
 .route("/docs/:id")
 .get(authController.restrictTo("admin", "editor" ,"viewer"), serviceController.display_service_docs)
 .post(authController.restrictTo("admin", "editor"), serviceController.create_service_doc)
 .put(authController.restrictTo("admin", "editor"), authController.checkEntityAccessDocsUpdate("service"), serviceController.update_service_doc)

router
.route("/files/upload/:id")
.post(authController.restrictTo("admin", "editor" ,"viewer"), upload.single("file"), serviceController.upload_files)

router
.route("/files/:id")
.get(authController.restrictTo("admin", "editor" ,"viewer"), serviceController.load_files)
.delete(authController.restrictTo("admin"), serviceController.delete_file)

router
 .route("/virtual_machines/upload/excel/:id")
 .post(authController.restrictTo("admin"),upload.single("file"), serviceController.upload_vm_excel)

 router
 .route("/sites/:id")
 .get(authController.restrictTo("admin", "editor" ,"viewer"), serviceController.service_sites)

router
 .route("/scripts/execute/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), authController.checkScriptAccess("service"), serviceController.execute_script)

router
 .route("/scripts/:id")
 .get(authController.restrictTo("admin"), serviceController.display_scripts)
 .post(authController.restrictTo("admin"), serviceController.create_script)
 .delete(authController.restrictTo("admin"), serviceController.delete_script)
 .patch(authController.restrictTo("admin"), serviceController.edit_script)

export default router;
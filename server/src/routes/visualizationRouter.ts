import express from "express";
import * as visualizationController from '../controllers/visualizationController'
import * as authController from "../controllers/authController";

const router = express.Router();

router.use(authController.authenticate_jwt_token); 

router
 .route("/")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.total_services_and_systems);

router
 .route("/virtual_machines_usage")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.sytems_virtual_machine_usage);

router
 .route("/virtual_machines_usage/sites")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.virtual_machines_per_site);

router
 .route("/services_and_systems/menu")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.systems_and_services_menu);

router
.route("/services-systems/custom")
.get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.filtered_systems_and_services);

router
 .route("/system/virtual_machines_usage/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.system_virtual_machine_usage);

router
 .route("/service/virtual_machines_usage/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.service_virtual_machine_usage);

router
 .route("/system/authentication_types")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.system_authentication_types)

router
 .route("/certificate_infrastructure_types")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.certificate_infrastructure_types)

router
 .route("/network_types")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.core_network_types)

router
 .route("/system/infrastructure_types")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.system_infrastructure_type)

router
 .route("/tree/diagram/active_locations")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.tree_diagram_active_locations);
 
router
 .route("/tree/diagram/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), authController.checkEntityAccessByQuery, visualizationController.tree_diagram)

router
 .route("/tree/diagram/stats/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), authController.checkEntityAccessByQuery, visualizationController.tree_diagram_stats)

router
 .route("/tree/diagram/custom/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), authController.checkEntityAccessByQuery, visualizationController.tree_diagram_custom)

 router
 .route("/tree/diagram/advanced/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), authController.checkEntityAccessByQuery, visualizationController.tree_diagram_advanced);

router
 .route("/tree/diagram/stats/advanced/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), authController.checkEntityAccessByQuery, visualizationController.tree_diagram_stats_advanced);

router
 .route("/tree/diagram/custom/advanced/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), authController.checkEntityAccessByQuery, visualizationController.tree_diagram_custom_advanced);

router
 .route("/services-systems/advanced")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.filtered_systems_and_services_advanced);

router
 .route("/active/locations")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.active_systems_and_services_locations);

router
 .route("/network/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.systems_related_to_service_network);

router
  .route("/docs/search")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.search_docs);

router
  .route("/docs/:id")
  .get(authController.restrictTo("admin", "editor", "viewer"), authController.checkEntityAccessDocs, visualizationController.display_document);

router
 .route("/active/locations/aggregation")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.active_locations_aggregation);

router
 .route("/entities/locations/aggregation")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.entities_locations_aggregation);

router
 .route("/total/locations/aggregation")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.total_locations_aggregation);

router
 .route("/entities/locations/table")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.entities_locations_table);

router
 .route("/entities/data/impacts")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.entities_impacts);

router
 .route("/docs/auto/suggestions")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.docs_suggestions);

router
 .route("/entities/data/environments")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.entities_environments);

router
 .route("/entities/data/backup_types")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.entities_backup_types);

router
 .route("/entities/data/infrastructure_types")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.entities_infrastructure_types);

router
 .route("/scripts/menu")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.scripts_menu);

router
 .route("/scripts/server")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.list_server_scripts);

router
 .route("/scripts/menu/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.get_specific_script);

router
 .route("/active_location_history/:id")
 .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.active_location_history);

router
  .route("/fields/suggestions")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.fields_suggestions)

router
  .route("/fields/find/source")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.field_search_source)

router
  .route("/users/contributions")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.user_contributions)

router
  .route("/total/users/contributions")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.total_users_contributions_count)

router
 .route("/dependency/auto/suggestions")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.dependency_suggestions);

router
 .route("/authentication/auto/suggestions")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.authentication_type_suggestions);

router
 .route("/static/dev-api/docs/endpoint")
  .get(authController.restrictTo("admin", "editor", "viewer"), visualizationController.dev_docs_api_endpoint);

export default router;
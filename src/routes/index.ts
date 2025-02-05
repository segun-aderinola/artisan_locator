import { Router } from "express";
import CustomerRoute from "./customer.routes";
import ServiceProviderRoute from "./service-provider.routes";
import AdminRoute from "./admin.routes";

const router = Router();

// Mount all routes
router.use("/customer", CustomerRoute);
router.use("/service-provider", ServiceProviderRoute);
router.use("/admin", AdminRoute);

export default router;
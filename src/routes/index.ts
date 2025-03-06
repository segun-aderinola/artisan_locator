import { Router } from "express";
import CustomerRoute from "./customer.routes";
import ServiceProviderRoute from "./service-provider.routes";
import AdminRoute from "./admin.routes";
import CategoryRoutes from "./categories.routes";
import ServiceRoutes from "./services.routes";
import WalletRoutes from "./wallet.routes";
import RequestRoutes from "./requests.routes";
import { authenticateUser, UserAuthentication } from "../middleware/auth.middleware";

const router = Router();

router.use("/customer", CustomerRoute);
router.use("/service-provider", ServiceProviderRoute);
router.use("/admin", AdminRoute);
router.use("/services", UserAuthentication, ServiceRoutes);
router.use("/categories", CategoryRoutes);
router.use("/wallet", WalletRoutes);
router.use("/requests", RequestRoutes);

export default router;
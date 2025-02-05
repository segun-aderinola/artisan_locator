import { Router } from 'express';
import { container } from 'tsyringe';
const router = Router();

import { AdminController } from "../controllers/admin.controller";

const adminController = container.resolve(AdminController);


// 1. Get all customers
router.get("/customers", adminController.getAllCustomers);

// 2. Get single customer details
router.get("/customers/:id", adminController.getCustomerDetails);

// 3. Get all service providers
router.get("/service-providers", adminController.getAllServiceProviders);

// 4. Get single service provider details
router.get("/service-providers/:id", adminController.getServiceProviderDetails);

// 5. Flag a user (customer or service provider)
router.post("/flag-user", adminController.flagUser);

export default router;
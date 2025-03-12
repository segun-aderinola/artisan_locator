import { Router } from 'express';
import { container } from 'tsyringe';
const router = Router();

import { validate } from '../validators/auth-validator.schema';
import { ServiceController } from '../controllers/service.controller';
import { servicesSchema } from '../validators/service.validator.schema';
import { RatingController } from '../controllers/rating.controller';

const serviceController = container.resolve(ServiceController);
const ratingController = container.resolve(RatingController);


router.post("/", validate(servicesSchema), serviceController.createService);
router.get("/search", serviceController.searchService);
router.get("/:id", serviceController.fetchService);
router.get("/", serviceController.fetchAllServices);
router.get("/category/:category_id", serviceController.fetchAllServicesByCategory);
router.get("/provider/:id", serviceController.fetchAllServicesByProvider);
router.put("/:id", validate(servicesSchema), serviceController.updateService);
// router.get("/search", serviceController.searchService);

export default router;
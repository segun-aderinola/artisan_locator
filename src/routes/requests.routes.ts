import { Router } from 'express';
import { container } from 'tsyringe';
const router = Router();

import { validate } from '../validators/auth-validator.schema';
import { RequestController } from '../controllers/request.controller';
import { ratingSchema } from '../validators/rating.validator.schema';
import { RatingController } from '../controllers/rating.controller';
import { UserAuthentication } from '../middleware/auth.middleware';
import { requestSchema } from '../validators/request.validator.schema';

const requestController = container.resolve(RequestController);
const ratingController = container.resolve(RatingController);


router.post("/:id", UserAuthentication, validate(requestSchema), requestController.createRequest);
router.get("/completed", UserAuthentication, requestController.fetchCompletedRequest);
router.get("/ongoing", UserAuthentication, requestController.fetchOngoingRequest);
router.get("/:id", UserAuthentication, requestController.fetchRequestDetail);
router.post("/accept/:id", UserAuthentication, requestController.acceptRequest);
router.post("/decline/:id", UserAuthentication, requestController.declineRequest);
router.post("/rate/:id", [validate(ratingSchema), UserAuthentication], ratingController.rateServiceRequest);

export default router;
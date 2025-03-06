import { Router } from 'express';
import { container } from 'tsyringe';
const router = Router();

import { CategoryController } from '../controllers/category.controller';
import { validate } from '../validators/auth-validator.schema';
import { categorySchema } from '../validators/category.validator.schema';

const categoryController = container.resolve(CategoryController);


router.post("/", validate(categorySchema), categoryController.createCategory);
router.get("/", categoryController.fetchAllCategories);
router.get("/:id", categoryController.fetchCategory);
router.put("/:id", validate(categorySchema), categoryController.updateCategory);

export default router;
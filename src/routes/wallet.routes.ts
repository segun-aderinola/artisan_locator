import { Router } from 'express';
import { container } from 'tsyringe';
const router = Router();

import { WalletController } from '../controllers/wallet.controller';
import { UserAuthentication } from '../middleware/auth.middleware';

const walletController = container.resolve(WalletController);


router.get("/transactions", UserAuthentication, walletController.transactions);

export default router;
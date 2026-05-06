import { Router } from 'express';
import { makeAuthController } from '../modules/auth/factories/auth.factory';

const router = Router();
const authController = makeAuthController();

router.post('/', (req, res) => authController.login(req, res));

export default router;

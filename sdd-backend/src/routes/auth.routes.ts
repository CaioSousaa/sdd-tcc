import { Router } from 'express';
import { makeAuthController } from '../modules/auth/factories/auth.factory';
import { authenticate } from '../shared/http/authenticate';

const router = Router();
const authController = makeAuthController();

router.post('/', (req, res) => authController.login(req, res));
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));

export default router;

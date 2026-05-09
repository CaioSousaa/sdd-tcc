import { Router } from 'express';
import { makeUserController } from '../modules/user/factories/user.factory';
import { authenticate } from '../shared/http/authenticate';

const router = Router();
const userController = makeUserController();

router.post('/', (req, res) => userController.create(req, res));
router.put('/', authenticate, (req, res) => userController.update(req, res));

export default router;

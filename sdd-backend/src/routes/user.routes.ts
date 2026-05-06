import { Router } from 'express';
import { makeUserController } from '../modules/user/factories/user.factory';

const router = Router();
const userController = makeUserController();

router.post('/', (req, res) => userController.create(req, res));

export default router;

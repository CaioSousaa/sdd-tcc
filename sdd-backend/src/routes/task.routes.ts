import { Router } from 'express';
import { authenticate } from '../shared/http/authenticate';
import { makeTaskController } from '../modules/task/factories/task.factory';

const router = Router();

router.post('/', authenticate, (req, res) => makeTaskController().create(req, res));

export default router;

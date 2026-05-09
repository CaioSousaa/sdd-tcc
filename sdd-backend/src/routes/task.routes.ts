import { Router } from 'express';
import { authenticate } from '../shared/http/authenticate';
import { makeTaskController } from '../modules/task/factories/task.factory';

const router = Router();

router.post('/', authenticate, (req, res) => makeTaskController().create(req, res));
router.get('/', authenticate, (req, res) => makeTaskController().list(req, res));
router.patch('/:taskId', authenticate, (req, res) => makeTaskController().update(req, res));
router.delete('/:taskId', authenticate, (req, res) => makeTaskController().delete(req, res));

export default router;


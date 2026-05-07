import { Router } from 'express';
import { authenticate } from '../shared/http/authenticate';
import { makeTagController } from '../modules/tag/factories/tag.factory';

const router = Router();

router.post('/', authenticate, (req, res) => makeTagController().create(req, res));

export default router;

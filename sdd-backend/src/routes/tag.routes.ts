import { Router } from 'express';
import { authenticate } from '../shared/http/authenticate';
import { makeTagController } from '../modules/tag/factories/tag.factory';

const router = Router();

router.post('/', authenticate, (req, res) => makeTagController().create(req, res));
router.get('/', authenticate, (req, res) => makeTagController().list(req, res));
router.patch('/:tagId', authenticate, (req, res) => makeTagController().update(req, res));
router.delete('/:tagId', authenticate, (req, res) => makeTagController().delete(req, res));

export default router;

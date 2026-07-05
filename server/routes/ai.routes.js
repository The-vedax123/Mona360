import { Router } from 'express';
import { chat, report } from '../controllers/ai.controller.js';

const router = Router();

router.post('/chat', chat);
router.post('/report', report);

export default router;

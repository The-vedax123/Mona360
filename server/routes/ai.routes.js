import { Router } from 'express';
import { advisor, chat, report } from '../controllers/ai.controller.js';

const router = Router();

router.post('/advisor', advisor);
router.post('/chat', chat);
router.post('/report', report);

export default router;

import { Router } from 'express';
import { AiController } from './ai.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// GET - semua user
router.get('/risk-summary', AiController.getRiskSummary);
router.get('/explain/:assetId', AiController.explain);
router.get('/predictions/asset/:assetId', AiController.getByAsset);
router.get('/predictions', AiController.getAll);

// POST - admin only
router.post('/predict/:assetId', authorize('ADMIN'), AiController.predictSingle);
router.post('/predict-batch', authorize('ADMIN'), AiController.predictBatch);

export default router;
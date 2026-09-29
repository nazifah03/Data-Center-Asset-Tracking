import { Router } from 'express';
import { AssetController } from './asset.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/statistics', AssetController.getStatistics);
router.get('/', AssetController.getAll);
router.get('/:id', AssetController.getById);

router.post('/', authorize('ADMIN'), AssetController.create);
router.put('/:id', authorize('ADMIN'), AssetController.update);
router.delete('/:id', authorize('ADMIN'), AssetController.delete);

export default router;

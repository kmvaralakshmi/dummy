import { Router } from 'express';
import trackingController from '../controllers/trackingController';

const router = Router();

// Variant assignment and tracking
router.post('/assign', trackingController.assignVariant.bind(trackingController));
router.post('/track', trackingController.track.bind(trackingController));
router.post('/simulate', trackingController.simulate.bind(trackingController));
router.get('/:experimentKey/:userId', trackingController.getUserVariant.bind(trackingController));

export default router;

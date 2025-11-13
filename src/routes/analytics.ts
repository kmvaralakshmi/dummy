import { Router } from 'express';
import analyticsController from '../controllers/analyticsController';

const router = Router();

// Analytics and results
router.get('/:key/results', analyticsController.getResults.bind(analyticsController));
router.get('/:key/timeline', analyticsController.getEventTimeline.bind(analyticsController));
router.get('/:key/stats-by-date', analyticsController.getStatsByDate.bind(analyticsController));
router.get('/:key/participants', analyticsController.getParticipantCount.bind(analyticsController));

export default router;

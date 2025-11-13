import { Router } from 'express';
import experimentController from '../controllers/experimentController';

const router = Router();

// Experiment CRUD operations
router.post('/', experimentController.createExperiment.bind(experimentController));
router.get('/', experimentController.getExperiments.bind(experimentController));
router.get('/:key', experimentController.getExperiment.bind(experimentController));
router.put('/:key', experimentController.updateExperiment.bind(experimentController));
router.delete('/:key', experimentController.deleteExperiment.bind(experimentController));

// Experiment status management
router.post('/:key/start', experimentController.startExperiment.bind(experimentController));
router.post('/:key/pause', experimentController.pauseExperiment.bind(experimentController));
router.post('/:key/complete', experimentController.completeExperiment.bind(experimentController));

export default router;

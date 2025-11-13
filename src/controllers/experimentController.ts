import { Request, Response } from 'express';
import Experiment from '../models/Experiment';
import { Op } from 'sequelize';

export class ExperimentController {
  // Create a new experiment
  async createExperiment(req: Request, res: Response) {
    try {
      const { name, key, description, variants, targetingRules } = req.body;

      // Validate weights sum to 100
      const totalWeight = variants.reduce((sum: number, v: any) => sum + v.weight, 0);
      if (totalWeight !== 100) {
        return res.status(400).json({ 
          error: 'Variant weights must sum to 100' 
        });
      }

      const experiment = await Experiment.create({
        name,
        key,
        description,
        variants,
        targetingRules,
        status: 'draft'
      });

      res.status(201).json(experiment);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          error: 'Experiment with this key already exists' 
        });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Get all experiments
  async getExperiments(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const where = status ? { status: status as string } : {};
      
      const experiments = await Experiment.findAll({ 
        where: where as any,
        order: [['createdAt', 'DESC']]
      });
      res.json(experiments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get experiment by key
  async getExperiment(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const experiment = await Experiment.findOne({ where: { key } });
      
      if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
      }
      
      res.json(experiment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update experiment
  async updateExperiment(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const updates = req.body;

      // Don't allow updating key
      delete updates.key;

      // If updating variants, validate weights
      if (updates.variants) {
        const totalWeight = updates.variants.reduce((sum: number, v: any) => sum + v.weight, 0);
        if (totalWeight !== 100) {
          return res.status(400).json({ 
            error: 'Variant weights must sum to 100' 
          });
        }
      }

      const experiment = await Experiment.findOne({ where: { key } });

      if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
      }

      await experiment.update(updates);

      res.json(experiment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Start/Resume experiment
  async startExperiment(req: Request, res: Response) {
    try {
      const { key } = req.params;
      
      const experiment = await Experiment.findOne({ where: { key } });

      if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
      }

      await experiment.update({ 
        status: 'running',
        startDate: new Date()
      });

      res.json(experiment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Pause experiment
  async pauseExperiment(req: Request, res: Response) {
    try {
      const { key } = req.params;
      
      const experiment = await Experiment.findOne({ where: { key } });

      if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
      }

      await experiment.update({ status: 'paused' });

      res.json(experiment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Complete experiment
  async completeExperiment(req: Request, res: Response) {
    try {
      const { key } = req.params;
      
      const experiment = await Experiment.findOne({ where: { key } });

      if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
      }

      await experiment.update({ 
        status: 'completed',
        endDate: new Date()
      });

      res.json(experiment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete experiment
  async deleteExperiment(req: Request, res: Response) {
    try {
      const { key } = req.params;
      
      const experiment = await Experiment.findOne({ where: { key } });

      if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
      }

      await experiment.destroy();

      res.json({ message: 'Experiment deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ExperimentController();

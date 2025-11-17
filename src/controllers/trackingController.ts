import { Request, Response } from 'express';
import Experiment from '../models/Experiment';
import UserAssignment from '../models/UserAssignment';
import Event from '../models/Event';
import { IVariant } from '../models/Experiment';

export class TrackingController {
  // Assign a variant to a user
  async assignVariant(req: Request, res: Response) {
    try {
      const { experimentKey, userId } = req.body;

      // Find the experiment
      const experiment = await Experiment.findOne({ where: { key: experimentKey } });
      
      if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
      }

      if (experiment.status !== 'running') {
        return res.status(400).json({ 
          error: `Experiment is ${experiment.status}, not running` 
        });
      }

      // Check if user already has an assignment
      let assignment = await UserAssignment.findOne({ 
        where: { 
          experimentKey, 
          userId 
        }
      });

      if (assignment) {
        // Return existing assignment
        return res.json({ 
          variantKey: assignment.variantKey,
          experimentKey: assignment.experimentKey,
          isNewAssignment: false
        });
      }

      // Assign a new variant based on weights
      const variantKey = this.selectVariantByWeight(experiment.variants);
      
      assignment = await UserAssignment.create({
        experimentKey,
        userId,
        variantKey
      });

      // Track impression
      await this.trackEvent({
        experimentKey,
        variantKey,
        userId,
        eventType: 'impression'
      });

      res.json({ 
        variantKey,
        experimentKey,
        isNewAssignment: true
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Select variant based on weights
  private selectVariantByWeight(variants: IVariant[]): string {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        return variant.key;
      }
    }

    // Fallback to first variant
    return variants[0].key;
  }

  // Track an event
  async trackEvent(eventData: {
    experimentKey: string;
    variantKey: string;
    userId: string;
    eventType: 'impression' | 'click' | 'conversion' | 'custom';
    eventName?: string;
    metadata?: Record<string, any>;
  }) {
    const event = await Event.create(eventData);
    return event;
  }

  // Track event endpoint
  async track(req: Request, res: Response) {
    try {
      const { 
        experimentKey, 
        variantKey, 
        userId, 
        eventType,
        eventName,
        metadata 
      } = req.body;

      // Verify the experiment exists
      const experiment = await Experiment.findOne({ where: { key: experimentKey } });
      if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
      }

      // Verify the variant exists in the experiment
      const variantExists = experiment.variants.some((v: IVariant) => v.key === variantKey);
      if (!variantExists) {
        return res.status(400).json({ error: 'Invalid variant key' });
      }

      const event = await this.trackEvent({
        experimentKey,
        variantKey,
        userId,
        eventType,
        eventName,
        metadata
      });

      res.status(201).json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get user's current variant assignment
  async getUserVariant(req: Request, res: Response) {
    try {
      const { experimentKey, userId } = req.params;

      const assignment = await UserAssignment.findOne({ 
        where: { 
          experimentKey, 
          userId 
        }
      });

      if (!assignment) {
        return res.status(404).json({ 
          error: 'No assignment found for this user' 
        });
      }

      res.json({ 
        variantKey: assignment.variantKey,
        experimentKey: assignment.experimentKey,
        assignedAt: assignment.assignedAt
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Simulate N users for an experiment (bulk generation)
  async simulate(req: Request, res: Response) {
    try {
      const { experimentKey, count = 100, clickProb = 0.7, conversionProb = 0.2 } = req.body;

      const experiment = await Experiment.findOne({ where: { key: experimentKey } });
      if (!experiment) return res.status(404).json({ error: 'Experiment not found' });
      if (experiment.status !== 'running') return res.status(400).json({ error: `Experiment is ${experiment.status}, not running` });

      const summary: any = { assignments: 0, impressions: 0, clicks: 0, conversions: 0, perVariant: {} };

      for (let i = 0; i < count; i++) {
        const userId = `sim_${Date.now()}_${i}_${Math.random().toString(36).substr(2,5)}`;
        const variantKey = this.selectVariantByWeight(experiment.variants);

        // create assignment
        try {
          await UserAssignment.create({ experimentKey, userId, variantKey });
        } catch (err) {
          // skip duplicates or other errors for safety
          continue;
        }

        summary.assignments++;
        summary.perVariant[variantKey] = (summary.perVariant[variantKey] || 0) + 1;

        // impression
        await this.trackEvent({ experimentKey, variantKey, userId, eventType: 'impression' });
        summary.impressions++;

        // click
        if (Math.random() < clickProb) {
          await this.trackEvent({ experimentKey, variantKey, userId, eventType: 'click' });
          summary.clicks++;

          // conversion (only if clicked)
          if (Math.random() < conversionProb) {
            await this.trackEvent({ experimentKey, variantKey, userId, eventType: 'conversion' });
            summary.conversions++;
          }
        }
      }

      res.json({ message: `Simulated ${summary.assignments} users`, summary });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new TrackingController();

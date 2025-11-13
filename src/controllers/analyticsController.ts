import { Request, Response } from 'express';
import Event from '../models/Event';
import Experiment from '../models/Experiment';
import UserAssignment from '../models/UserAssignment';
import { Op, fn, col, literal } from 'sequelize';
import { IVariant } from '../models/Experiment';

interface VariantStats {
  variantKey: string;
  variantName: string;
  impressions: number;
  clicks: number;
  conversions: number;
  uniqueUsers: number;
  clickThroughRate: number;
  conversionRate: number;
}

interface ExperimentResults {
  experimentKey: string;
  experimentName: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  variantStats: VariantStats[];
  winner?: string;
  confidence?: number;
}

export class AnalyticsController {
  // Get experiment results and statistics
  async getResults(req: Request, res: Response) {
    try {
      const { key } = req.params;

      const experiment = await Experiment.findOne({ where: { key } });
      if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
      }

      const variantStats: VariantStats[] = [];

      for (const variant of experiment.variants) {
        const impressions = await Event.count({
          where: {
            experimentKey: key,
            variantKey: variant.key,
            eventType: 'impression'
          }
        });

        const clicks = await Event.count({
          where: {
            experimentKey: key,
            variantKey: variant.key,
            eventType: 'click'
          }
        });

        const conversions = await Event.count({
          where: {
            experimentKey: key,
            variantKey: variant.key,
            eventType: 'conversion'
          }
        });

        const uniqueUsersResult = await Event.findAll({
          where: {
            experimentKey: key,
            variantKey: variant.key
          },
          attributes: [[fn('COUNT', fn('DISTINCT', col('userId'))), 'count']],
          raw: true
        });

        const uniqueUsers = (uniqueUsersResult[0] as any).count || 0;

        const clickThroughRate = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const conversionRate = impressions > 0 ? (conversions / impressions) * 100 : 0;

        variantStats.push({
          variantKey: variant.key,
          variantName: variant.name,
          impressions,
          clicks,
          conversions,
          uniqueUsers,
          clickThroughRate: parseFloat(clickThroughRate.toFixed(2)),
          conversionRate: parseFloat(conversionRate.toFixed(2))
        });
      }

      // Calculate winner based on conversion rate and statistical significance
      const { winner, confidence } = this.calculateWinner(variantStats);

      const results: ExperimentResults = {
        experimentKey: experiment.key,
        experimentName: experiment.name,
        status: experiment.status,
        startDate: experiment.startDate,
        endDate: experiment.endDate,
        variantStats,
        winner,
        confidence
      };

      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Calculate winner using Z-test for proportions
  private calculateWinner(variantStats: VariantStats[]): { 
    winner?: string; 
    confidence?: number 
  } {
    if (variantStats.length < 2) {
      return {};
    }

    // Find variant with highest conversion rate
    const sorted = [...variantStats].sort((a, b) => 
      b.conversionRate - a.conversionRate
    );

    const best = sorted[0];
    const control = sorted[1]; // Compare best with second best

    // Need minimum sample size for statistical significance
    if (best.impressions < 100 || control.impressions < 100) {
      return { winner: undefined, confidence: 0 };
    }

    // Calculate Z-score for difference in proportions
    const p1 = best.conversions / best.impressions;
    const p2 = control.conversions / control.impressions;
    const n1 = best.impressions;
    const n2 = control.impressions;

    const pooledProportion = (best.conversions + control.conversions) / (n1 + n2);
    const standardError = Math.sqrt(
      pooledProportion * (1 - pooledProportion) * (1/n1 + 1/n2)
    );

    const zScore = Math.abs((p1 - p2) / standardError);

    // Convert Z-score to confidence level (two-tailed test)
    const confidence = this.zScoreToConfidence(zScore);

    // Consider winner if confidence >= 95%
    if (confidence >= 95) {
      return { 
        winner: best.variantKey, 
        confidence: parseFloat(confidence.toFixed(2)) 
      };
    }

    return { winner: undefined, confidence: parseFloat(confidence.toFixed(2)) };
  }

  // Convert Z-score to confidence percentage
  private zScoreToConfidence(zScore: number): number {
    // Simplified mapping of Z-score to confidence level
    // Z = 1.96 corresponds to 95% confidence (two-tailed)
    // Z = 2.58 corresponds to 99% confidence (two-tailed)
    
    if (zScore >= 2.58) return 99;
    if (zScore >= 1.96) return 95;
    if (zScore >= 1.645) return 90;
    if (zScore >= 1.28) return 80;
    
    // Approximate for lower values
    return Math.min(80, zScore * 50);
  }

  // Get event timeline for an experiment
  async getEventTimeline(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const { startDate, endDate, eventType } = req.query;

      const where: any = { experimentKey: key };

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp[Op.gte] = new Date(startDate as string);
        if (endDate) where.timestamp[Op.lte] = new Date(endDate as string);
      }

      if (eventType) {
        where.eventType = eventType;
      }

      const events = await Event.findAll({
        where,
        order: [['timestamp', 'ASC']],
        limit: 1000
      });

      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get aggregated stats by date
  async getStatsByDate(req: Request, res: Response) {
    try {
      const { key } = req.params;

      const stats = await Event.findAll({
        where: { experimentKey: key },
        attributes: [
          [fn('DATE', col('timestamp')), 'date'],
          'variantKey',
          'eventType',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['variantKey', 'eventType', fn('DATE', col('timestamp')) as any],
        order: [[fn('DATE', col('timestamp')), 'ASC']],
        raw: true
      });

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get total participant count
  async getParticipantCount(req: Request, res: Response) {
    try {
      const { key } = req.params;

      const totalUsers = await UserAssignment.count({ 
        where: { experimentKey: key }
      });

      const byVariantResults = await UserAssignment.findAll({
        where: { experimentKey: key },
        attributes: [
          'variantKey',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['variantKey'],
        raw: true
      });

      const byVariant = byVariantResults.map((v: any) => ({
        variantKey: v.variantKey,
        count: v.count
      }));

      res.json({
        total: totalUsers,
        byVariant
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new AnalyticsController();

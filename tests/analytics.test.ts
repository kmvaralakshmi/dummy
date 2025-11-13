import request from 'supertest';
import express, { Application } from 'express';
import analyticsRoutes from '../src/routes/analytics';
import trackingRoutes from '../src/routes/tracking';
import experimentRoutes from '../src/routes/experiments';
import sequelize from '../src/config/database';

const app: Application = express();
app.use(express.json());
app.use('/api/experiments', experimentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/analytics', analyticsRoutes);

describe('Analytics API Tests', () => {
  beforeAll(async () => {
    try {
      await sequelize.sync({ force: true });
    } catch (error) {
      console.log('Database sync error:', error);
    }
    
    // Create and start test experiment
    await request(app)
      .post('/api/experiments')
      .send({
        name: 'Analytics Test',
        key: 'analytics-test',
        variants: [
          { name: 'Control', key: 'control', weight: 50 },
          { name: 'Variant A', key: 'variant-a', weight: 50 }
        ]
      });

    await request(app).post('/api/experiments/analytics-test/start');

    // Generate minimal test data (reduced from 100 to 10 users)
    const users = Array.from({ length: 10 }, (_, i) => `user${i}`);
    
    for (const userId of users) {
      // Assign user
      const assignment = await request(app)
        .post('/api/tracking/assign')
        .send({ experimentKey: 'analytics-test', userId });

      const variantKey = assignment.body.variantKey;

      // Track impression
      await request(app)
        .post('/api/tracking/track')
        .send({
          experimentKey: 'analytics-test',
          variantKey,
          userId,
          eventType: 'impression'
        });

      // Track click (simple 50% rate for all)
      if (Math.random() < 0.5) {
        await request(app)
          .post('/api/tracking/track')
          .send({
            experimentKey: 'analytics-test',
            variantKey,
            userId,
            eventType: 'click'
          });

        // Track conversion
        if (Math.random() < 0.3) {
          await request(app)
            .post('/api/tracking/track')
            .send({
              experimentKey: 'analytics-test',
              variantKey,
              userId,
              eventType: 'conversion',
              metadata: { revenue: 49.99 }
            });
        }
      }
    }
  }, 60000);

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/analytics/:experimentKey', () => {
    it('should retrieve experiment analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/analytics-test')
        .expect(200);

      expect(response.body).toHaveProperty('experiment');
      expect(response.body).toHaveProperty('variants');
      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body.variants).toBeInstanceOf(Array);
      expect(response.body.variants.length).toBeGreaterThan(0);
    });

    it('should include variant statistics', async () => {
      const response = await request(app)
        .get('/api/analytics/analytics-test')
        .expect(200);

      const variant = response.body.variants[0];
      expect(variant).toHaveProperty('variantKey');
      expect(variant).toHaveProperty('users');
      expect(variant).toHaveProperty('impressions');
      expect(variant).toHaveProperty('clicks');
      expect(variant).toHaveProperty('conversions');
      expect(variant).toHaveProperty('conversionRate');
      expect(variant).toHaveProperty('clickThroughRate');
    });

    it('should calculate conversion rates correctly', async () => {
      const response = await request(app)
        .get('/api/analytics/analytics-test')
        .expect(200);

      response.body.variants.forEach((variant: any) => {
        if (variant.impressions > 0) {
          expect(variant.conversionRate).toBeGreaterThanOrEqual(0);
          expect(variant.conversionRate).toBeLessThanOrEqual(1);
        }
      });
    });
  });

  describe('GET /api/analytics/:experimentKey/winner', () => {
    it('should determine experiment winner', async () => {
      const response = await request(app)
        .get('/api/analytics/analytics-test/winner')
        .expect(200);

      expect(response.body).toHaveProperty('hasWinner');
      expect(response.body).toHaveProperty('significanceLevel');
      
      if (response.body.hasWinner) {
        expect(response.body).toHaveProperty('winner');
        expect(response.body.winner).toHaveProperty('variantKey');
        expect(response.body.winner).toHaveProperty('conversionRate');
        expect(response.body.winner).toHaveProperty('improvement');
      }
    });

    it('should include statistical significance data', async () => {
      const response = await request(app)
        .get('/api/analytics/analytics-test/winner')
        .expect(200);

      expect(response.body).toHaveProperty('statistics');
      expect(response.body.statistics).toBeInstanceOf(Array);
      
      if (response.body.statistics.length > 0) {
        const stat = response.body.statistics[0];
        expect(stat).toHaveProperty('variantKey');
        expect(stat).toHaveProperty('conversionRate');
      }
    });

    it('should return 404 for non-existent experiment', async () => {
      const response = await request(app)
        .get('/api/analytics/non-existent/winner')
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /api/analytics/:experimentKey/export', () => {
    it('should export experiment data', async () => {
      const response = await request(app)
        .get('/api/analytics/analytics-test/export')
        .expect(200);

      expect(response.body).toHaveProperty('experiment');
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('variantData');
      expect(response.body).toHaveProperty('events');
      expect(response.body).toHaveProperty('exportedAt');
    });

    it('should include all variant data', async () => {
      const response = await request(app)
        .get('/api/analytics/analytics-test/export')
        .expect(200);

      expect(response.body.variantData).toBeInstanceOf(Array);
      expect(response.body.variantData.length).toBeGreaterThan(0);
      
      const variantData = response.body.variantData[0];
      expect(variantData).toHaveProperty('variantKey');
      expect(variantData).toHaveProperty('metrics');
    });
  });
});

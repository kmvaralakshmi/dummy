import request from 'supertest';
import express, { Application } from 'express';
import trackingRoutes from '../src/routes/tracking';
import experimentRoutes from '../src/routes/experiments';
import sequelize from '../src/config/database';

const app: Application = express();
app.use(express.json());
app.use('/api/experiments', experimentRoutes);
app.use('/api/tracking', trackingRoutes);

describe('Tracking API Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create a test experiment
    await request(app)
      .post('/api/experiments')
      .send({
        name: 'Tracking Test Experiment',
        key: 'tracking-test',
        variants: [
          { name: 'Control', key: 'control', weight: 50 },
          { name: 'Variant A', key: 'variant-a', weight: 50 }
        ]
      });

    // Start the experiment
    await request(app)
      .post('/api/experiments/tracking-test/start');
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/tracking/assign', () => {
    it('should assign a user to a variant', async () => {
      const response = await request(app)
        .post('/api/tracking/assign')
        .send({
          experimentKey: 'tracking-test',
          userId: 'user123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('variantKey');
      expect(response.body).toHaveProperty('experimentKey');
      expect(response.body.isNewAssignment).toBe(true);
      expect(['control', 'variant-a']).toContain(response.body.variantKey);
    });

    it('should return consistent assignment for same user', async () => {
      const response1 = await request(app)
        .post('/api/tracking/assign')
        .send({
          experimentKey: 'tracking-test',
          userId: 'user456'
        });

      const response2 = await request(app)
        .post('/api/tracking/assign')
        .send({
          experimentKey: 'tracking-test',
          userId: 'user456'
        });

      expect(response1.body.variantKey).toBe(response2.body.variantKey);
      expect(response1.body.isNewAssignment).toBe(true);
      expect(response2.body.isNewAssignment).toBe(false);
    });

    it('should reject assignment for non-running experiment', async () => {
      await request(app)
        .post('/api/experiments')
        .send({
          name: 'Paused Experiment',
          key: 'paused-exp',
          variants: [
            { name: 'Control', key: 'control', weight: 50 },
            { name: 'Variant A', key: 'variant-a', weight: 50 }
          ]
        });

      const response = await request(app)
        .post('/api/tracking/assign')
        .send({
          experimentKey: 'paused-exp',
          userId: 'user789'
        })
        .expect(400);

      expect(response.body.error).toContain('not running');
    });
  });

  describe('POST /api/tracking/track', () => {
    it('should track an event', async () => {
      const response = await request(app)
        .post('/api/tracking/track')
        .send({
          experimentKey: 'tracking-test',
          variantKey: 'control',
          userId: 'user123',
          eventType: 'click'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.eventType).toBe('click');
    });

    it('should track conversion with metadata', async () => {
      const response = await request(app)
        .post('/api/tracking/track')
        .send({
          experimentKey: 'tracking-test',
          variantKey: 'control',
          userId: 'user123',
          eventType: 'conversion',
          metadata: { revenue: 99.99 }
        })
        .expect(201);

      expect(response.body.eventType).toBe('conversion');
      expect(response.body.metadata).toEqual({ revenue: 99.99 });
    });
  });

  describe('GET /api/tracking/:experimentKey/:userId', () => {
    it('should get user variant assignment', async () => {
      await request(app)
        .post('/api/tracking/assign')
        .send({
          experimentKey: 'tracking-test',
          userId: 'assigned-user'
        });

      const response = await request(app)
        .get('/api/tracking/tracking-test/assigned-user')
        .expect(200);

      expect(response.body).toHaveProperty('variantKey');
      expect(response.body).toHaveProperty('assignedAt');
    });

    it('should return 404 for unassigned user', async () => {
      const response = await request(app)
        .get('/api/tracking/tracking-test/unassigned-user')
        .expect(404);

      expect(response.body.error).toContain('No assignment found');
    });
  });
});

import request from 'supertest';
import express, { Application } from 'express';
import experimentRoutes from '../src/routes/experiments';
import sequelize from '../src/config/database';

const app: Application = express();
app.use(express.json());
app.use('/api/experiments', experimentRoutes);

describe('Experiment API Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/experiments', () => {
    it('should create a new experiment', async () => {
      const newExperiment = {
        name: 'Test Experiment',
        key: 'test-exp-1',
        description: 'This is a test experiment',
        variants: [
          { name: 'Control', key: 'control', weight: 50 },
          { name: 'Variant A', key: 'variant-a', weight: 50 }
        ]
      };

      const response = await request(app)
        .post('/api/experiments')
        .send(newExperiment)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newExperiment.name);
      expect(response.body.key).toBe(newExperiment.key);
      expect(response.body.status).toBe('draft');
    });

    it('should reject experiment with invalid weight sum', async () => {
      const invalidExperiment = {
        name: 'Invalid Experiment',
        key: 'invalid-exp',
        variants: [
          { name: 'Control', key: 'control', weight: 40 },
          { name: 'Variant A', key: 'variant-a', weight: 40 }
        ]
      };

      const response = await request(app)
        .post('/api/experiments')
        .send(invalidExperiment)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('100');
    });

    it('should reject duplicate experiment key', async () => {
      const experiment = {
        name: 'Duplicate Test',
        key: 'duplicate-key',
        variants: [
          { name: 'Control', key: 'control', weight: 50 },
          { name: 'Variant A', key: 'variant-a', weight: 50 }
        ]
      };

      await request(app).post('/api/experiments').send(experiment);
      
      const response = await request(app)
        .post('/api/experiments')
        .send(experiment)
        .expect(400);

      expect(response.body.error).toContain('already exists');
    });
  });

  describe('GET /api/experiments', () => {
    it('should retrieve all experiments', async () => {
      const response = await request(app)
        .get('/api/experiments')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter experiments by status', async () => {
      const response = await request(app)
        .get('/api/experiments?status=draft')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((exp: any) => {
        expect(exp.status).toBe('draft');
      });
    });
  });

  describe('GET /api/experiments/:key', () => {
    it('should retrieve a specific experiment', async () => {
      const newExp = {
        name: 'Specific Test',
        key: 'specific-test',
        variants: [
          { name: 'Control', key: 'control', weight: 50 },
          { name: 'Variant A', key: 'variant-a', weight: 50 }
        ]
      };

      await request(app).post('/api/experiments').send(newExp);

      const response = await request(app)
        .get('/api/experiments/specific-test')
        .expect(200);

      expect(response.body.key).toBe('specific-test');
      expect(response.body.name).toBe(newExp.name);
    });

    it('should return 404 for non-existent experiment', async () => {
      const response = await request(app)
        .get('/api/experiments/non-existent')
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /api/experiments/:key/start', () => {
    it('should start an experiment', async () => {
      const newExp = {
        name: 'Start Test',
        key: 'start-test',
        variants: [
          { name: 'Control', key: 'control', weight: 50 },
          { name: 'Variant A', key: 'variant-a', weight: 50 }
        ]
      };

      await request(app).post('/api/experiments').send(newExp);

      const response = await request(app)
        .post('/api/experiments/start-test/start')
        .expect(200);

      expect(response.body.status).toBe('running');
      expect(response.body.startDate).toBeDefined();
    });
  });

  describe('DELETE /api/experiments/:key', () => {
    it('should delete an experiment', async () => {
      const newExp = {
        name: 'Delete Test',
        key: 'delete-test',
        variants: [
          { name: 'Control', key: 'control', weight: 50 },
          { name: 'Variant A', key: 'variant-a', weight: 50 }
        ]
      };

      await request(app).post('/api/experiments').send(newExp);

      const response = await request(app)
        .delete('/api/experiments/delete-test')
        .expect(200);

      expect(response.body.message).toContain('deleted');

      await request(app)
        .get('/api/experiments/delete-test')
        .expect(404);
    });
  });
});

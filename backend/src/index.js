import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/index.js';
import {
    authRoutes,
    surveyRoutes,
    industryRoutes,
    analyticsRoutes
} from './routes/index.js';

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'B2B Survey API is running',
        timestamp: new Date().toISOString(),
        environment: config.environment
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/industries', industryRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`
  🚀 B2B Survey Platform API
  ──────────────────────────
  Environment: ${config.environment}
  Port: ${PORT}
  Health: http://localhost:${PORT}/api/health
  ──────────────────────────
  `);
});

export default app;

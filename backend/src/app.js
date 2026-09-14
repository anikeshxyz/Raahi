import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import apiV1Routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/v1', apiV1Routes);

// Root fallback
app.get('/', (req, res) => {
  res.json({
    name: 'Raahi Café Management System API',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;

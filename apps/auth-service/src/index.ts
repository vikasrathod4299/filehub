import { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { errorHandler } from '@repo/shared'; 

errorHandler
// Import routes

// Load environment vars
const PORT: number = parseInt(process.env.PORT || '3001', 10);

const app = express();
// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Routes

app.get('/api/auth', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Auth Service is running' });
});

// Server Boot
const server = http.createServer(app);

// Error handling middleware should be added after all routes
app.use(errorHandler);

server.listen(PORT, () => {
  console.info(`🚀 Auth Service running on PORT: ${PORT}`);
});

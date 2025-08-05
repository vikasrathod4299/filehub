import express from 'express';
import 'dotenv/config'; 
import cors from 'cors';
import helmet from 'helmet';
import { rateLimiter } from './middlwares/rateLimiter';
import { errorHandler } from '@repo/shared';

import authRoutes from './routes/auth.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(rateLimiter);

// Routes
app.use('/auth', authRoutes);

// Default
app.use('*', (_, res) => res.status(404).json({ message: "Not Found" }));

// Error handler
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`API Gateway running on port ${process.env.PORT}`);
});



import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { goalsRouter } from './routes/goals.js';
import { managerRouter } from './routes/manager.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requireAuth, requireRole } from './middleware/auth.js';
import { startSchedulers } from './services/scheduler.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: ['http://localhost:5173', 'https://chronicle-atomquest.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', title: 'Chronicle API' });
});

app.use('/api/auth', authRouter);
app.use('/api/goals', requireAuth, requireRole('EMPLOYEE', 'MANAGER', 'ADMIN'), goalsRouter);
app.use('/api/manager', requireAuth, requireRole('MANAGER', 'ADMIN'), managerRouter);
app.use('/api/admin', requireAuth, requireRole('ADMIN'), adminRouter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Chronicle API listening on http://localhost:${port}`);
  startSchedulers();
});

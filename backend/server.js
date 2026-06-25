import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './src/config/db.js';
import errorHandler from './src/middleware/errorHandler.js';
import initSocket from './src/services/socketService.js';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import discoverRoutes from './src/routes/discoverRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import marketRoutes from './src/routes/marketRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Connect Database ─────────────────────────────────────────────────────────
await connectDB();

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io ───────────────────────────────────────────────────────────────
initSocket(httpServer);

// ─── Security & Logging ───────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow image serving
  })
);

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim().replace(/\/$/, ''))
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const cleanOrigin = origin.trim().replace(/\/$/, '');
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === '*') return true;
        if (cleanOrigin === allowed) return true;
        const domainOnly = allowed.replace(/^https?:\/\//, '');
        return cleanOrigin.endsWith('.' + domainOnly);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin "${origin}" is not in the allowed list:`, allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts, please try again in 15 minutes.' },
});

app.use(globalLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ─── Static Files (uploaded media) ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Meetory API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/market', marketRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Meetory API running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 Socket.io enabled\n`);
});

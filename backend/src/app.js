const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const webhookRoutes = require('./routes/webhooks.routes');
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');
const vaultRoutes = require('./routes/vault.routes');
const directoryRoutes = require('./routes/directory.routes');
const appointmentRoutes = require('./routes/appointments.routes');
const medicationRoutes = require('./routes/medications.routes');
const notificationRoutes = require('./routes/notifications.routes');
const activityRoutes = require('./routes/activities.routes');
const providerRoutes = require('./routes/provider.routes');
const adminRoutes = require('./routes/admin.routes');
const subscriptionsRoutes = require('./routes/subscriptions.routes');
const connectionsRoutes = require('./routes/connections.routes');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header (native mobile apps, curl, server-to-server) - allow.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Webhook routes need the raw body for signature verification, so they're
// mounted before the global JSON body parser.
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/api/plans', async (req, res, next) => {
  try {
    const type = ['Individual', 'Partner'].includes(req.query.type) ? req.query.type : undefined;
    const plans = await require('./models/plan.model').findActive(type);
    res.json({ plans });
  } catch (e) {
    next(e);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/connections', connectionsRoutes);

const path = require('path');
const fs = require('fs');
const adminDistPath = path.join(__dirname, '../../admin/dist');
const adminIndexPath = path.join(adminDistPath, 'index.html');

// admin/dist is a separate Vite build output and is git-ignored, so it only
// exists here if something built it into this exact filesystem (Railway
// doesn't build it from source) - guard against it being absent instead of
// unconditionally trying to serve it, which would 500 on every request.
if (process.env.NODE_ENV === 'production' && fs.existsSync(adminIndexPath)) {
  app.use(express.static(adminDistPath));
  // Express 5 requires a named wildcard - a bare '*' throws at startup.
  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(adminIndexPath);
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

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

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Webhook routes need the raw body for signature verification, so they're
// mounted before the global JSON body parser.
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

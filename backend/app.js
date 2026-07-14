const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const path = require('path');
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const coachRoutes = require('./routes/coaches');
const activityRoutes = require('./routes/activities');
const courseRoutes = require('./routes/courses');
const reservationRoutes = require('./routes/reservations');
const paymentRoutes = require('./routes/payments');
const subscriptionRoutes = require('./routes/subscriptions');
const galleryRoutes = require('./routes/gallery');
const newsRoutes = require('./routes/news');
const testimonialRoutes = require('./routes/testimonials');
const contactRoutes = require('./routes/contacts');
const statsRoutes = require('./routes/stats');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(xss());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);
app.get('/', (req, res) => {
  res.json({
    message: 'SmartGym API is running',
    version: '1.0.0'
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

module.exports = app;

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const dashboardRoutes = require('./routes/dashboardsRoutes');
const cookieParser = require('cookie-parser');
const questionRoutes = require('./routes/questionRoutes');

dotenv.config();
connectDB();

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/dashboard',dashboardRoutes);
app.use('/questions',questionRoutes);
app.get('/', (req, res) => res.redirect('/api/auth/login'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

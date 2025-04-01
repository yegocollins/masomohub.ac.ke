const path = require('path');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routers/routes');
const express = require('express');

const checkRole = require('./middleware/authorize');

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite's default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT','PATCH','DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(express.json());
app.use(cors(corsOptions));
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(port, (error) => {
  if(!error)
    console.log(`Server Started http://localhost:${port}`);
  else 
    console.log("Error occurred, server can't start", error);
});

mongoose.connect(process.env.DATABASE_URL)
.then(() => console.log('Database Connected!'))
.catch(error => console.error(error));

import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './Config/dbConnection.js';
import users from './routes/users.js';
import materials from './routes/materials.js';
import transactions from './routes/transactions.js';
import parties from './routes/parties.js';
import { authenticate } from './middleware/authMiddleware.js';

dotenv.config();
const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: ['https://agha-fans.vercel.app'],
  credentials: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use('/users', users);
app.use('/api/materials', authenticate, materials);
app.use('/api/transactions', authenticate, transactions);
app.use('/api/parties', authenticate, parties);

// Welcome route (must be after specific routes)
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send the error response
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});
connectDB();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

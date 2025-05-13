import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB, fetchQueue, MS_PER_MINUTE } from './config';
import { errorHandler, notFound } from './middlewares';
import { adapterRouters, devRouters, userRoutes, watchRoutes } from './routes';
import { Watch } from './models';

dotenv.config();

const port = process.env.PORT || 5002;

connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: 'API is running ....' });
});

app.use('/api/users', userRoutes);
app.use('/api/watches', watchRoutes);
app.use('/api/adaptes', adapterRouters);
app.use('/api/dev', devRouters);

// error handling
app.use(notFound);
app.use(errorHandler);

(async () => {
  const existing = await Watch.find({ active: true, archived: false });
  for (const w of existing) {
    await fetchQueue.add(
      'fetchPrice',
      { watchId: w._id },
      {
        delay: w.intervalMinutes * MS_PER_MINUTE,
        jobId: String(w._id),
      }
    );
  }
  console.log(`🔄  Seeded ${existing.length} repeatable jobs`);
})();

app.listen(port, () => {
  console.log(`Server running on port ${port} 🚀`);
});

export default app;

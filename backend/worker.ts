import 'dotenv/config';
import { Worker } from 'bullmq';
import { fetchQueue, redisConnection } from './config/redis';
import { Watch, PriceLog } from './models';
import adapterLoader from './utils/adapterLoader';
import { handlePriceNotification } from './services/notification.service';
import { connectDB, MS_PER_MINUTE } from './config';

async function bootstrap() {
  await connectDB();

  await fetchQueue.clean(1 * 60 * 60 * 1000, 1000, 'completed');
  await fetchQueue.clean(24 * 60 * 60 * 1000, 500, 'failed');
  console.log('🧹 Initial queue cleanup done');

  const worker = new Worker(
    'fetchPrice',
    async (job) => {
      const { watchId } = job.data;
      console.log(`▶️  Starting job ${job.id} (watchId=${watchId})`);

      const watch = await Watch.findById(watchId);
      if (!watch || !watch.active || watch.archived) {
        return;
      }

      const scraper = await adapterLoader(watch.adapter.toString());

      const { price, imageUrl } = await scraper.extractData(watch.url);

      await PriceLog.create({ watch: watch._id, price });
      await handlePriceNotification(watch, price);

      watch.imageUrl = imageUrl;
      watch.nextRunAt = new Date(
        Date.now() + watch.intervalMinutes * MS_PER_MINUTE
      );
      await watch.save();

      console.log(`✅  Fetched ${watch.url} @ ${price}, updated imageUrl`);

      await fetchQueue.add(
        'fetchPrice',
        { watchId: watch._id },
        {
          delay: watch.intervalMinutes * MS_PER_MINUTE,
          jobId: String(watch._id),
        }
      );
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => {
    console.log(`✅  Job ${job.id} completed`);
  });
  worker.on('failed', (job, err) => {
    console.error(`❌  Job ${job?.id} failed:`, err);
  });

  // periodic sweep every hour:
  setInterval(async () => {
    await fetchQueue.clean(1 * 60 * 60 * 1000, 1000, 'completed');
    await fetchQueue.clean(24 * 60 * 60 * 1000, 500, 'failed');
    console.log('🧹 Periodic queue cleanup done');
  }, 60 * 60 * 1000);

  console.log('🐂  BullMQ worker listening for fetchPrice jobs');
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

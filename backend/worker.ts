import 'dotenv/config';
import { Worker } from 'bullmq';
import { fetchQueue, redisConnection } from './config/redis';
import { Watch, PriceLog } from './models';
import adapterLoader from './utils/adapterLoader';
import { handlePriceNotification } from './services/notification.service';
import { connectDB, MS_PER_MINUTE } from './config';

async function bootstrap() {
  await connectDB();

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
      const fetchedAt = new Date();

      // 1. Save to PriceLog
      await PriceLog.create({ watch: watch._id, price, fetchedAt });

      // 2. Update Watch with latest price, fetchedAt, imageUrl, nextRunAt
      watch.latestPrice = price;
      watch.latestFetchedAt = fetchedAt;
      watch.imageUrl = imageUrl;
      watch.nextRunAt = new Date(
        Date.now() + watch.intervalMinutes * MS_PER_MINUTE
      );
      await watch.save();

      // 3. Handle notifications
      await handlePriceNotification(watch, price);

      console.log(`✅  Fetched ${watch.url} @ ${price}, updated Watch`);

      // 4. Re-schedule next fetch
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

  console.log('🐂  BullMQ worker listening for fetchPrice jobs');
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

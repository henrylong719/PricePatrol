import 'dotenv/config';
import { Worker } from 'bullmq';
import { fetchQueue, redisConnection } from './config/redis';
import { Watch } from './models';
import { PriceLog } from './models';
import adapterLoader from './utils/adapterLoader';
import { handlePriceNotification } from './services/notification.service';
import { connectDB, MS_PER_MINUTE } from './config';

async function bootstrap() {
  connectDB();

  const worker = new Worker(
    'priceFetch',
    async (job) => {
      console.log(`▶️  Starting job ${job.id} (watchId=${job.data.watchId})`);

      const { watchId } = job.data;
      const watch = await Watch.findById(watchId);

      if (!watch || !watch.active || watch.archived) return;

      const adapter = await adapterLoader(String(watch.adapter));
      const price = await adapter.extractPrice(watch.url);

      await PriceLog.create({ watch: watch._id, price });
      await handlePriceNotification(watch, price);

      watch.nextRunAt = new Date(
        Date.now() + watch.intervalMinutes * MS_PER_MINUTE
      );
      await watch.save();
      console.log(`✅  Fetched ${watch.url} @ ${price}`);

      const nextDelay = watch.intervalMinutes * MS_PER_MINUTE;
      await fetchQueue.add(
        'fetchPrice',
        { watchId: watch._id },
        {
          delay: nextDelay,
          jobId: String(watch._id),
        }
      );

      return;
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => {
    console.log(`✅  Job ${job.id} completed`);
  });
  worker.on('failed', (job, err) => {
    console.error(`❌  Job ${job?.id} failed:`, err);
  });

  console.log('🐂  BullMQ worker listening for priceFetch jobs');
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

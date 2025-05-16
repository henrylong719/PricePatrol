import dotenv from 'dotenv';
import colors from 'colors';
import { connectDB } from './config';
import { Adapter, PriceLog, User, Watch } from './models';
import { adapters, user } from './data';
import { mockPriceLogs, mockWatches } from './data/watch';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Promise.all([
      User.deleteMany(),
      Adapter.deleteMany(),
      PriceLog.deleteMany(),
      Watch.deleteMany(),
    ]);

    const [userObj, adapterArr] = await Promise.all([
      User.insertOne(user),
      Adapter.insertMany(adapters),
    ]);

    mockWatches.forEach((watch) => {
      watch.user = userObj.id;
      watch.adapter = adapterArr[0].id;
    });

    const watches = await Watch.insertMany(mockWatches);

    mockPriceLogs.forEach((log) => {
      log.watch = watches[0].id;
    });

    await PriceLog.insertMany(mockPriceLogs);

    console.log(colors.green.inverse('Data Imported!'));

    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Promise.all([
      User.deleteMany(),
      Adapter.deleteMany(),
      PriceLog.deleteMany(),
      Watch.deleteMany(),
    ]);

    console.log(colors.red.inverse('Data Destroyed!'));

    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

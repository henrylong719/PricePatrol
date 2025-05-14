import dotenv from 'dotenv';
import colors from 'colors';
import { connectDB } from './config';
import { Adapter, PriceLog, User, Watch } from './models';
import { adapters, user } from './data';

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

    await Promise.all([User.insertOne(user), Adapter.insertMany(adapters)]);

    console.log(colors.green.inverse('Data Imported!'));

    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Adapter.deleteMany();

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

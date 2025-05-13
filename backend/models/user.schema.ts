import mongoose, { Model } from 'mongoose';
import { IUser } from '../interfaces';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i.test(v); // Case-insensitive email validation
        },
        message: (props: { value: any }) =>
          `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.facebookId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents without this field to coexist
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents without this field to coexist
    },
    phone: {
      type: String,
    },
    roles: {
      type: [String],
      default: ['user'],
    },
    profileImage: {
      type: String, // URL or path to the profile image
      required: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to match user-entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) {
    throw new Error('Password is not set for this user');
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;

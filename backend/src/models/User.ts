import mongoose, { Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface UserSchema extends Document {
  name: string;
  email: string;
  password: string;
}

interface UserMethods {
  isCorrectPassword: (password: string) => Promise<boolean>;
}

type UserModel = Model<UserSchema, {}, UserMethods>;

const userSchema = new mongoose.Schema<UserSchema, UserModel, UserMethods>(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 64,
      required: [true, 'Name is required for user'],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'Email is required'],
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'Password can not be left blank'],
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const SALT = process.env.SALT;

  const salt = await bcrypt.genSalt(parseInt(SALT!));
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isCorrectPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model<UserSchema, UserModel>('User', userSchema);

export default User;

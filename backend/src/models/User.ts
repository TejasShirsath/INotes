import mongoose, { Model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface UserSchema extends Document {
  name: string;
  email: string;
  password?: string; // Optional for Auth0 users
  auth0Id?: string; // Auth0 user ID
  picture?: string; // Profile picture URL
  provider: 'local' | 'auth0'; // Authentication provider
  createdAt: Date;
  updatedAt: Date;
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
      required: function(this: UserSchema) {
        return this.provider === 'local';
      },
    },
    auth0Id: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but ensure uniqueness when present
    },
    picture: {
      type: String,
      trim: true,
    },
    provider: {
      type: String,
      enum: ['local', 'auth0'],
      default: 'local',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const SALT = process.env.SALT || '10';

  const salt = await bcrypt.genSalt(parseInt(SALT));
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isCorrectPassword = async function (password: string) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model<UserSchema, UserModel>('User', userSchema);

export default User;

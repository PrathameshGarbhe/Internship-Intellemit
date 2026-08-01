import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

// TypeScript interface for the User document
export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'admin' | 'host' | 'member' | 'viewer'
  avatar?: string
  refreshToken?: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'host', 'member', 'viewer'],
      default: 'member',
    },
    avatar: {
      type: String,
      default: '',
    },
    refreshToken: {
      type: String,
      select: false, // Never return refresh token in queries
    },
  },
  {
    timestamps: true, // Auto adds createdAt and updatedAt
  }
)

// Hash password before saving to database
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)
import mongoose, { Document, Schema } from 'mongoose'

export interface IMeeting extends Document {
  title: string
  host: mongoose.Types.ObjectId
  participants: mongoose.Types.ObjectId[]
  scheduledAt: Date
  status: 'scheduled' | 'active' | 'ended'
  meetingCode: string
  createdAt: Date
  updatedAt: Date
}

const meetingSchema = new Schema<IMeeting>(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host is required'],
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled time is required'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'ended'],
      default: 'scheduled',
    },
    meetingCode: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
)

meetingSchema.pre('save', function () {
  if (!this.meetingCode) {
    this.meetingCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  }
})

export const Meeting = mongoose.model<IMeeting>('Meeting', meetingSchema)
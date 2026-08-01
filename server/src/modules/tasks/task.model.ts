import mongoose, { Document, Schema } from 'mongoose'

export interface ITask extends Document {
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignedTo: string
  meetingId?: string
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignedTo: { type: String, required: true },
    meetingId: { type: String, default: null },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
)

export const Task = mongoose.model<ITask>('Task', taskSchema)
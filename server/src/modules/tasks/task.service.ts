import { Task } from './task.model'
import { ApiError } from '../../utils/ApiError'

export const getAllTasks = async () => {
  return await Task.find().sort({ createdAt: -1 })
}

export const createTask = async (data: {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  assignedTo: string
  dueDate?: string
  meetingId?: string
}) => {
  return await Task.create(data)
}

export const updateTaskStatus = async (
  taskId: string,
  status: 'todo' | 'in-progress' | 'done'
) => {
  const task = await Task.findByIdAndUpdate(
    taskId,
    { status },
    { new: true, runValidators: true }
  )
  if (!task) throw new ApiError(404, 'Task not found')
  return task
}

export const deleteTask = async (taskId: string) => {
  const task = await Task.findByIdAndDelete(taskId)
  if (!task) throw new ApiError(404, 'Task not found')
  return task
}

export const getTasksByMeeting = async (meetingId: string) => {
  return await Task.find({ meetingId }).sort({ createdAt: -1 })
}
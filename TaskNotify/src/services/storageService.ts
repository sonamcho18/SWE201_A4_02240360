import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types';

const TASKS_KEY = '@tasknotify_tasks';

export const StorageService = {
  async getTasks(): Promise<Task[]> {
    try {
      const raw = await AsyncStorage.getItem(TASKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  async addTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    tasks.push(task);
    await this.saveTasks(tasks);
  },

  async updateTask(updated: Task): Promise<void> {
    const tasks = await this.getTasks();
    const idx = tasks.findIndex((t) => t.id === updated.id);
    if (idx !== -1) {
      tasks[idx] = updated;
      await this.saveTasks(tasks);
    }
  },

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    await this.saveTasks(tasks.filter((t) => t.id !== id));
  },

  async getTaskById(id: string): Promise<Task | undefined> {
    const tasks = await this.getTasks();
    return tasks.find((t) => t.id === id);
  },
};

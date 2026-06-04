export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  reminderDate: string;
  notificationEnabled: boolean;
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
}

export type RootStackParamList = {
  Main: undefined;
  TaskDetail: { taskId: string };
  AddTask: undefined;
  EditTask: { taskId: string };
  About: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Settings: undefined;
};

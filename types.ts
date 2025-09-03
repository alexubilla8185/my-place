
export enum Page {
  Dashboard = 'Dashboard',
  Notes = 'Notes',
  VoiceRecorder = 'Voice Recorder',
  Kanban = 'Kanban Board',
  Documentation = 'Documentation',
  Calendar = 'Calendar',
  Upgrade = 'Upgrade to Plus',
  Settings = 'Settings',
  Personalization = 'Personalization',
}

export enum Theme {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

export enum AccentColor {
    Default = 'Default',
    Blue = 'Blue',
    Green = 'Green',
    Yellow = 'Yellow',
    Pink = 'Pink',
    Orange = 'Orange',
}

export enum KanbanStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
}

export interface Note {
  id: string;
  title: string;
  content: string;
  dueDate?: string;
  createdAt: number;
}

export interface Task {
  id: string;
  content: string;
  status: KanbanStatus;
}

export interface Recording {
  id: string;
  name: string;
  audioUrl: string;
  transcript?: string;
  createdAt: number;
}
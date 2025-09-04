import { Note, Task, Recording, Project, KanbanStatus } from '../types';

const now = Date.now();

export const demoNotes: Note[] = [
  {
    id: 'demo-note-1',
    title: 'Project Phoenix Kick-off',
    content: 'Initial meeting notes for Project Phoenix. Key discussion points:\n- Define Q3 goals.\n- Finalize budget allocation.\n- Assign team leads for frontend and backend.',
    dueDate: new Date(now + 3 * 24 * 3600 * 1000).toISOString(),
    createdAt: now - 2 * 24 * 3600 * 1000,
  },
  {
    id: 'demo-note-2',
    title: 'Marketing Slogans Brainstorm',
    content: '- My Place: Your Second Brain.\n- All your work, in one place.\n- Productivity, Simplified.',
    createdAt: now - 5 * 24 * 3600 * 1000,
  },
  {
    id: 'demo-note-3',
    title: 'Weekly Sync Summary',
    content: 'Team sync highlights: UI components are 80% complete. API integration is next on the list. Blocked by design approval for the new dashboard layout.',
    createdAt: now - 1 * 24 * 3600 * 1000,
  }
];

export const demoTasks: Task[] = [
  { id: 'demo-task-1', content: 'Design the new dashboard layout', status: KanbanStatus.Done },
  { id: 'demo-task-2', content: 'Develop authentication flow', status: KanbanStatus.Done },
  { id: 'demo-task-3', content: 'Build the note-taking component', status: KanbanStatus.InProgress },
  { id: 'demo-task-4', content: 'Integrate Gemini API for summarization', status: KanbanStatus.InProgress },
  { id: 'demo-task-5', content: 'Set up CI/CD pipeline', status: KanbanStatus.ToDo },
  { id: 'demo-task-6', content: 'Write end-to-end tests for the Kanban board', status: KanbanStatus.ToDo },
];

export const demoRecordings: Recording[] = [
  {
    id: 'demo-rec-1',
    name: 'Voice Memo on New Feature Idea',
    // A short, silent WAV file to make the play button functional in the demo.
    audioUrl: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
    transcript: 'Okay, here is a quick thought for the next sprint: what if we add a project management layer on top of everything? We could link notes, tasks, and even these recordings to a specific project. This would be a game-changer for organization.',
    createdAt: now - 4 * 24 * 3600 * 1000,
  }
];

export const demoProjects: Project[] = [
  {
    id: 'demo-proj-1',
    name: 'Q3 Product Launch',
    description: 'All activities related to the main product launch in Q3. This includes development, marketing, and final testing.',
    noteIds: ['demo-note-1', 'demo-note-2', 'demo-note-3'],
    taskIds: ['demo-task-1', 'demo-task-2', 'demo-task-3', 'demo-task-4', 'demo-task-5', 'demo-task-6'],
    recordingIds: ['demo-rec-1'],
    createdAt: now - 10 * 24 * 3600 * 1000,
  }
];
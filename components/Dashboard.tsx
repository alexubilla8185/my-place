import React, { useState, useMemo } from 'react';
import { Page, Note, Task, KanbanStatus } from '../types';
import { scheduleTaskWithAI } from '../services/geminiService';
import { NotesIcon, CheckSquareIcon, PartyPopperIcon, PlusFeatureIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  notes: Note[];
  tasks: Task[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setActivePage: (page: Page) => void;
  setIsUpgradePromptVisible: (isVisible: boolean) => void;
}

const StatCard: React.FC<{ title: string; value: number | string, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-surface-container border border-outline-variant p-6 rounded-xl flex items-center space-x-4 h-full">
        <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center bg-primary-container text-on-primary-container">
            {icon}
        </div>
        <div>
            <p className="text-sm text-on-surface-variant">{title}</p>
            <p className="text-2xl font-bold text-on-surface">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ notes, tasks, setTasks, setActivePage, setIsUpgradePromptVisible }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const { user } = useAuth();

  const completedTasks = useMemo(() => tasks.filter(t => t.status === KanbanStatus.Done).length, [tasks]);

  const upcomingNotes = useMemo(() => {
    const now = new Date();
    return notes
      .filter(n => n.dueDate && new Date(n.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [notes]);

  const recentNotes = useMemo(() => {
      return [...notes]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);
  }, [notes]);
  
  const handleSchedule = async () => {
      if (user?.isGuest) {
        setIsUpgradePromptVisible(true);
        return;
      }
      if (!aiPrompt.trim()) return;
      setIsScheduling(true);
      const result = await scheduleTaskWithAI(aiPrompt);
      if (result) {
          const newTask: Task = {
              id: `task-${Date.now()}`,
              content: result.task,
              status: KanbanStatus.ToDo
          };
          setTasks(prev => [...prev, newTask]);
          setAiPrompt('');
          alert(`Task "${result.task}" scheduled!`);
      } else {
          alert('Could not schedule task. The AI might have had trouble understanding.');
      }
      setIsScheduling(false);
  };

  return (
    <div className="space-y-8">
      <h1 className="hidden lg:block text-3xl font-bold text-on-surface">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button onClick={() => setActivePage(Page.Notes)} className="w-full text-left transition-transform transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl">
            <StatCard title="Total Notes" value={notes.length} icon={<NotesIcon className="w-6 h-6"/>} />
        </button>
         <button onClick={() => setActivePage(Page.Kanban)} className="w-full text-left transition-transform transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl">
            <StatCard title="Total Tasks" value={tasks.length} icon={<CheckSquareIcon className="w-6 h-6"/>} />
        </button>
        <div className="transition-transform transform hover:-translate-y-1">
          <StatCard title="Completed Tasks" value={completedTasks} icon={<PartyPopperIcon className="w-6 h-6"/>} />
        </div>
      </div>

      <div className="bg-surface-container border border-outline-variant p-6 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-on-surface">AI Scheduler</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., Remind me to call John tomorrow at 2 pm"
            className="flex-grow p-3 px-4 bg-surface-container-highest text-on-surface border-b-2 border-outline focus:outline-none focus:border-primary rounded-t-lg transition-colors"
            disabled={user?.isGuest}
          />
          <button onClick={handleSchedule} disabled={isScheduling} className="px-8 py-3 bg-primary text-on-primary font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {user?.isGuest && <PlusFeatureIcon className="w-5 h-5" />}
            {isScheduling ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-container border border-outline-variant p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-on-surface">Upcoming Agenda</h2>
          <div className="space-y-3">
            {upcomingNotes.length > 0 ? upcomingNotes.map(note => (
              <div key={note.id} className="p-4 bg-surface-container-high rounded-lg">
                <p className="font-medium text-on-surface-variant">{note.title}</p>
                <p className="text-sm text-tertiary">Due: {new Date(note.dueDate!).toLocaleString()}</p>
              </div>
            )) : <p className="text-on-surface-variant pt-4 text-center">No upcoming due dates.</p>}
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-on-surface">Recent Notes</h2>
          <div className="space-y-3">
            {recentNotes.length > 0 ? recentNotes.map(note => (
              <div key={note.id} className="p-4 bg-surface-container-high rounded-lg">
                <p className="font-medium text-on-surface-variant">{note.title}</p>
                 <p className="text-sm text-on-surface-variant truncate">{note.content}</p>
              </div>
            )) : <p className="text-on-surface-variant pt-4 text-center">No recent notes.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
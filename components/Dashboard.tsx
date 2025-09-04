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

const StatCard: React.FC<{ title: string; value: number | string, icon: React.ReactNode, iconBgColor: string }> = ({ title, value, icon, iconBgColor }) => (
    <div className="bg-card border border-border p-5 rounded-lg shadow-sm flex items-center space-x-4 h-full">
        <div className={`w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center ${iconBgColor}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
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
      <h1 className="hidden lg:block text-3xl font-bold text-foreground">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button onClick={() => setActivePage(Page.Notes)} className="w-full text-left transition-transform transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-lg">
            <StatCard title="Total Notes" value={notes.length} icon={<NotesIcon className="w-6 h-6 text-orange-900"/>} iconBgColor="bg-orange-200" />
        </button>
         <button onClick={() => setActivePage(Page.Kanban)} className="w-full text-left transition-transform transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-lg">
            <StatCard title="Total Tasks" value={tasks.length} icon={<CheckSquareIcon className="w-6 h-6 text-green-900"/>} iconBgColor="bg-green-200" />
        </button>
        <StatCard title="Completed Tasks" value={completedTasks} icon={<PartyPopperIcon className="w-6 h-6 text-indigo-900"/>} iconBgColor="bg-indigo-200" />
      </div>

      <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">AI Scheduler</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., Remind me to call John tomorrow at 2 pm"
            className="flex-grow p-3 px-4 bg-input text-foreground border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
            disabled={user?.isGuest}
          />
          <button onClick={handleSchedule} disabled={isScheduling} className="px-8 py-3 bg-foreground text-background font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {user?.isGuest && <PlusFeatureIcon className="w-5 h-5 text-background" />}
            {isScheduling ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Upcoming Agenda</h2>
          <div className="space-y-3">
            {upcomingNotes.length > 0 ? upcomingNotes.map(note => (
              <div key={note.id} className="p-4 bg-secondary rounded-md">
                <p className="font-medium">{note.title}</p>
                <p className="text-sm text-muted-foreground">Due: {new Date(note.dueDate!).toLocaleString()}</p>
              </div>
            )) : <p className="text-muted-foreground pt-4 text-center">No upcoming due dates.</p>}
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Notes</h2>
          <div className="space-y-3">
            {recentNotes.length > 0 ? recentNotes.map(note => (
              <div key={note.id} className="p-4 bg-secondary rounded-md">
                <p className="font-medium">{note.title}</p>
                 <p className="text-sm text-muted-foreground truncate">{note.content}</p>
              </div>
            )) : <p className="text-muted-foreground pt-4 text-center">No recent notes.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useMemo } from 'react';
import { Note, Task, KanbanStatus } from '../types';
import { scheduleTaskWithAI } from '../services/geminiService';

interface DashboardProps {
  notes: Note[];
  tasks: Task[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const StatCard: React.FC<{ title: string; value: number | string, icon: string }> = ({ title, value, icon }) => (
    <div className="bg-card border border-border p-6 rounded-lg shadow-sm flex items-center space-x-4">
        <div className="bg-muted text-muted-foreground p-3 rounded-lg">
            <span className="text-2xl">{icon}</span>
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ notes, tasks, setTasks }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

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
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Notes" value={notes.length} icon="📝" />
        <StatCard title="Total Tasks" value={tasks.length} icon="✅" />
        <StatCard title="Completed Tasks" value={completedTasks} icon="🎉" />
      </div>

      <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">AI Scheduler</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., Remind me to call John tomorrow at 2 pm"
            className="flex-grow p-3 px-4 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
          />
          <button onClick={handleSchedule} disabled={isScheduling} className="px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
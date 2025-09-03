import React, { useState } from 'react';
import { Task, KanbanStatus } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const KanbanCard: React.FC<{ task: Task }> = ({ task }) => (
    <div
        draggable
        onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
        className="p-4 bg-card border border-border rounded-lg shadow-sm cursor-grab active:cursor-grabbing"
    >
        {task.content}
    </div>
);

const KanbanColumn: React.FC<{ title: KanbanStatus; tasks: Task[]; children: React.ReactNode }> = ({ title, tasks, children }) => {
    return (
        <div className="flex-1 p-4 bg-secondary rounded-lg min-w-[300px]">
            <h3 className="font-bold text-lg mb-4 tracking-wider px-2">{title} <span className="text-sm font-normal text-muted-foreground">{tasks.length}</span></h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, setTasks }) => {
    const [newTaskContent, setNewTaskContent] = useState('');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskContent.trim()) return;
        const newTask: Task = {
            id: `task-${Date.now()}`,
            content: newTaskContent,
            status: KanbanStatus.ToDo
        };
        setTasks(prev => [...prev, newTask]);
        setNewTaskContent('');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: KanbanStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        setTasks(prevTasks => prevTasks.map(task =>
            task.id === taskId ? { ...task, status } : task
        ));
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Kanban Board</h1>
            <form onSubmit={handleAddTask} className="flex gap-4">
                <input
                    type="text"
                    value={newTaskContent}
                    onChange={(e) => setNewTaskContent(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-grow p-3 px-4 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
                />
                <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90">Add Task</button>
            </form>

            <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4">
                {Object.values(KanbanStatus).map(status => (
                    <div
                        key={status}
                        onDrop={(e) => handleDrop(e, status)}
                        onDragOver={handleDragOver}
                        className="w-full"
                    >
                        <KanbanColumn title={status} tasks={tasks.filter(t => t.status === status)}>
                            {tasks.filter(t => t.status === status).map(task => (
                                <KanbanCard key={task.id} task={task} />
                            ))}
                        </KanbanColumn>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;
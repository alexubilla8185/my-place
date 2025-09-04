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
        className="p-4 bg-surface-container-high rounded-lg shadow-sm cursor-grab active:cursor-grabbing border border-outline-variant"
    >
        {task.content}
    </div>
);

const KanbanColumn: React.FC<{ title: KanbanStatus; tasks: Task[]; children: React.ReactNode }> = ({ title, tasks, children }) => {
    return (
        <div className="flex-1 p-4 bg-surface-container rounded-xl min-w-[300px]">
            <h3 className="font-bold text-lg mb-4 tracking-wider px-2 text-on-surface">{title} <span className="text-sm font-normal text-on-surface-variant">{tasks.length}</span></h3>
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
            <h1 className="hidden lg:block text-3xl font-bold text-on-surface">Kanban Board</h1>
            <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4 p-4 bg-surface-container rounded-xl">
                <input
                    type="text"
                    value={newTaskContent}
                    onChange={(e) => setNewTaskContent(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-grow p-3 px-4 bg-surface-container-highest text-on-surface border-b-2 border-outline rounded-t-lg focus:outline-none focus:border-primary transition-colors"
                />
                <button type="submit" className="px-6 py-3 sm:py-2 bg-primary text-on-primary font-semibold rounded-full hover:opacity-90">Add Task</button>
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

import React from 'react';

const Documentation: React.FC = () => {
  return (
    <div className="prose dark:prose-invert max-w-4xl mx-auto text-foreground">
      <h1 className="text-3xl font-bold text-foreground">Documentation</h1>

      <p className="text-muted-foreground">Welcome to the My Place documentation. Here you'll find information on how to use the various features of the application.</p>

      <h2 className="text-2xl font-bold mt-8 text-foreground">Dashboard</h2>
      <p className="text-muted-foreground">The dashboard provides a high-level overview of your productivity. It includes stat cards for notes and tasks, an AI scheduler to quickly add tasks, and sections for upcoming and recent notes.</p>

      <h2 className="text-2xl font-bold mt-8 text-foreground">Notes</h2>
      <p className="text-muted-foreground">The notes section allows you to create, edit, and delete notes. You can also add due dates to your notes, which will be reflected in the calendar. Use the "Summarize" feature to get a quick AI-powered summary of any note.</p>

      <h2 className="text-2xl font-bold mt-8 text-foreground">Kanban Board</h2>
      <p className="text-muted-foreground">Organize your tasks using the Kanban board. You can add new tasks to the "To Do" column and drag them between "In Progress" and "Done" to track your workflow visually.</p>

      <h2 className="text-2xl font-bold mt-8 text-foreground">Voice Recorder</h2>
      <p className="text-muted-foreground">Capture your thoughts on the go with the voice recorder. Record audio clips, play them back, and use the "Transcribe" feature to convert your speech into text.</p>

      <h2 className="text-2xl font-bold mt-8 text-foreground">Settings</h2>
      <p className="text-muted-foreground">Customize your experience in the settings. You can switch between light and dark themes, export all your data to a JSON file for backup, or clear all data to start fresh.</p>
    </div>
  );
};

export default Documentation;
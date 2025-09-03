import React, { useState } from 'react';
import { Note } from '../types';

interface CalendarPageProps {
  notes: Note[];
}

const CalendarPage: React.FC<CalendarPageProps> = ({ notes }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const notesByDate = notes.reduce((acc, note) => {
    if (note.dueDate) {
      const dateKey = new Date(note.dueDate).toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(note);
    }
    return acc;
  }, {} as Record<string, Note[]>);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="border-r border-b border-border"></div>);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const dateKey = dayDate.toISOString().split('T')[0];
    const dayHasNotes = notesByDate[dateKey] && notesByDate[dateKey].length > 0;
    const isToday = dayDate.toDateString() === new Date().toDateString();

    days.push(
      <div key={i} className={`p-2 border-r border-b border-border h-32 flex flex-col ${dayHasNotes ? 'bg-muted/50' : ''}`}>
        <span className={`font-semibold w-8 h-8 flex items-center justify-center ${isToday ? 'bg-accent text-accent-foreground rounded-full' : ''}`}>{i}</span>
        {dayHasNotes && (
          <div className="mt-1 text-xs text-accent overflow-hidden space-y-1">
            {notesByDate[dateKey].map(note => <div key={note.id} className="truncate p-1 bg-accent/20 rounded" title={note.title}>{note.title}</div>)}
          </div>
        )}
      </div>
    );
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendar</h1>
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="px-4 py-2 rounded-full hover:bg-muted">&lt;</button>
          <h2 className="text-xl font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={nextMonth} className="px-4 py-2 rounded-full hover:bg-muted">&gt;</button>
        </div>
        <div className="grid grid-cols-7 border-t border-l border-border">
          {weekdays.map(day => (
            <div key={day} className="p-2 text-center font-bold text-muted-foreground border-r border-b border-border">{day}</div>
          ))}
          {days}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
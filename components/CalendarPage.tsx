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
      <div key={i} className={`p-1 sm:p-2 border-r border-b border-border h-24 sm:h-32 flex flex-col ${dayHasNotes ? 'bg-muted/50' : ''}`}>
        <span className={`font-semibold text-sm w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center ${isToday ? 'bg-accent text-accent-foreground rounded-full' : ''}`}>{i}</span>
        {dayHasNotes && (
          <div className="mt-1 text-[10px] sm:text-xs text-accent overflow-hidden space-y-1">
            {notesByDate[dateKey].slice(0, 2).map(note => <div key={note.id} className="truncate p-0.5 sm:p-1 bg-accent/20 rounded" title={note.title}>{note.title}</div>)}
             {notesByDate[dateKey].length > 2 && <div className="text-muted-foreground text-[10px]">+ {notesByDate[dateKey].length - 2} more</div>}
          </div>
        )}
      </div>
    );
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendar</h1>
      <div className="bg-card rounded-lg shadow-sm p-2 sm:p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="px-4 py-2 rounded-full hover:bg-muted">&lt;</button>
          <h2 className="text-lg sm:text-xl font-semibold text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={nextMonth} className="px-4 py-2 rounded-full hover:bg-muted">&gt;</button>
        </div>
        <div className="grid grid-cols-7 border-t border-l border-border">
          {weekdays.map(day => (
            <div key={day} className="p-2 text-center text-xs sm:text-base font-bold text-muted-foreground border-r border-b border-border">{day}</div>
          ))}
          {days}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
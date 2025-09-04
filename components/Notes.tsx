import React, { useState } from 'react';
import { Note, Page } from '../types';
import Modal from './Modal';
import { summarizeText } from '../services/geminiService';
import { EditIcon, DeleteIcon, AddIcon, PlusFeatureIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

interface NotesPageProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  setActivePage: (page: Page) => void;
  setIsUpgradePromptVisible: (isVisible: boolean) => void;
}

const NoteForm: React.FC<{ onSave: (note: Note) => void; noteToEdit?: Note | null; onCancel: () => void;}> = ({ onSave, noteToEdit, onCancel }) => {
    const [title, setTitle] = useState(noteToEdit?.title || '');
    const [content, setContent] = useState(noteToEdit?.content || '');
    const [dueDate, setDueDate] = useState(noteToEdit?.dueDate?.substring(0, 16) || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        const newNote: Note = {
            id: noteToEdit?.id || `note-${Date.now()}`,
            title,
            content,
            dueDate: dueDate || undefined,
            createdAt: noteToEdit?.createdAt || Date.now(),
        };
        onSave(newNote);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-surface-container border border-outline-variant rounded-xl space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-on-surface">{noteToEdit ? 'Edit Note' : 'Create New Note'}</h2>
            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 bg-surface-container-highest text-on-surface border-b-2 border-outline rounded-t-lg focus:outline-none focus:border-primary transition-colors"/>
            <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full p-3 bg-surface-container-highest text-on-surface border-b-2 border-outline rounded-t-lg focus:outline-none focus:border-primary transition-colors"></textarea>
            <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-3 bg-surface-container-highest text-on-surface border-b-2 border-outline rounded-t-lg focus:outline-none focus:border-primary transition-colors"/>
            <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-full hover:bg-surface-container-high font-semibold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-full hover:opacity-90">{noteToEdit ? 'Save Changes' : 'Add Note'}</button>
            </div>
        </form>
    );
};

const NotesPage: React.FC<NotesPageProps> = ({ notes, setNotes, setActivePage, setIsUpgradePromptVisible }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const { user } = useAuth();

  const handleSaveNote = (note: Note) => {
    setNotes(prev => {
        const exists = prev.some(n => n.id === note.id);
        if (exists) {
            return prev.map(n => n.id === note.id ? note : n);
        }
        return [note, ...prev];
    });
    setIsFormVisible(false);
    setNoteToEdit(null);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
        setNotes(prev => prev.filter(n => n.id !== id));
    }
  };
  
  const handleSummarize = async (content: string) => {
      if (user?.isGuest) {
        setIsUpgradePromptVisible(true);
        return;
      }
      setIsSummaryLoading(true);
      setSummary("Generating summary...");
      const result = await summarizeText(content);
      setSummary(result);
      setIsSummaryLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="hidden lg:block text-3xl font-bold">Notes</h1>
      </div>
      
      {isFormVisible && <NoteForm onSave={handleSaveNote} noteToEdit={noteToEdit} onCancel={() => { setIsFormVisible(false); setNoteToEdit(null); }}/>}

      {!isFormVisible && (
        <button 
          onClick={() => { setNoteToEdit(null); setIsFormVisible(true); }}
          className="fixed z-20 bottom-6 right-6 sm:bottom-8 sm:right-8 w-16 h-16 bg-primary-container text-on-primary-container rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform"
          aria-label="New Note"
        >
          <AddIcon className="w-8 h-8"/>
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
          <div key={note.id} className="bg-surface-container p-6 rounded-xl border border-outline-variant flex flex-col">
            <h3 className="text-lg font-bold mb-2 text-on-surface">{note.title}</h3>
            <p className="flex-1 text-on-surface-variant whitespace-pre-wrap mb-4">{note.content}</p>
            
            <div className="mt-auto"> 
              {note.dueDate && <p className="text-xs mb-4 text-tertiary">Due: {new Date(note.dueDate).toLocaleDateString()}</p>}
              <div className="flex justify-between items-center gap-2 pt-4 border-t border-outline-variant">
                  <button 
                    onClick={() => handleSummarize(note.content)} 
                    disabled={isSummaryLoading}
                    className="text-sm font-semibold bg-secondary-container text-on-secondary-container hover:opacity-90 px-4 py-2 rounded-full transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {user?.isGuest && !isSummaryLoading && <PlusFeatureIcon className="w-5 h-5" />}
                    {isSummaryLoading ? 'Summarizing...' : 'Summarize'}
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setNoteToEdit(note); setIsFormVisible(true); window.scrollTo(0,0); }} className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => handleDeleteNote(note.id)} className="p-2 text-on-surface-variant hover:text-destructive hover:bg-surface-container-high rounded-full"><DeleteIcon className="w-5 h-5"/></button>
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Modal isOpen={!!summary} onClose={() => setSummary(null)} title="AI Summary">
          <p className="whitespace-pre-wrap text-popover-foreground">{summary}</p>
      </Modal>
    </div>
  );
};

export default NotesPage;
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import { Page, Theme, Note, Task, Recording, AccentColor, Project, User } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Modal from './components/Modal';
import { SearchIcon, MenuIcon } from './components/icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';

// Statically import pages
import Dashboard from './components/Dashboard';
import NotesPage from './components/Notes';
import KanbanBoard from './components/KanbanBoard';
import VoiceRecorder from './components/VoiceRecorder';
import Settings from './components/Settings';
import Upgrade from './components/Upgrade';
import Documentation from './components/Documentation';
import Personalization from './components/Personalization';
import ProjectsPage from './components/ProjectsPage';

const accentColorMap: Record<AccentColor, {light: string, dark: string}> = {
    [AccentColor.Default]: { light: '240 5.9% 10%', dark: '0 0% 98%' },
    [AccentColor.Blue]: { light: '221.2 83.2% 53.3%', dark: '217.2 91.2% 59.8%' },
    [AccentColor.Green]: { light: '142.1 76.2% 36.3%', dark: '142.1 70.6% 45.3%' },
    [AccentColor.Yellow]: { light: '47.9 95.8% 53.1%', dark: '47.9 95.8% 53.1%' },
    [AccentColor.Pink]: { light: '333.3 80.4% 53.1%', dark: '333.3 80.4% 53.1%' },
    [AccentColor.Orange]: { light: '24.6 95% 53.1%', dark: '24.6 95% 53.1%' },
};

const MainApp: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', Theme.System);
  const [accentColor, setAccentColor] = useLocalStorage<AccentColor>('accent-color', AccentColor.Default);
  const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [recordings, setRecordings] = useLocalStorage<Recording[]>('recordings', []);
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === Theme.Dark || (theme === Theme.System && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);

    const accent = accentColorMap[accentColor] || accentColorMap.Default;
    root.style.setProperty('--accent', isDark ? accent.dark : accent.light);
    
    // Set other colors based on theme
    if (isDark) {
        root.style.setProperty('--background', '0 0% 7%'); // #121212
        root.style.setProperty('--foreground', '0 0% 98%'); // #fafafa
        root.style.setProperty('--card', '0 0% 11%'); // #1c1c1c
        root.style.setProperty('--card-foreground', '0 0% 98%');
        root.style.setProperty('--popover', '0 0% 11%');
        root.style.setProperty('--popover-foreground', '0 0% 98%');
        root.style.setProperty('--primary', '0 0% 98%');
        root.style.setProperty('--primary-foreground', '0 0% 9%');
        root.style.setProperty('--secondary', '0 0% 11%');
        root.style.setProperty('--secondary-foreground', '0 0% 98%');
        root.style.setProperty('--muted', '0 0% 15%'); // #262626
        root.style.setProperty('--muted-foreground', '0 0% 63.9%'); // #a3a3a3
        root.style.setProperty('--accent-foreground', '0 0% 9%'); // Black for on-accent text
        root.style.setProperty('--destructive', '0 62.8% 30.6%');
        root.style.setProperty('--destructive-foreground', '0 0% 98%');
        root.style.setProperty('--border', '0 0% 20%'); // #333333
        root.style.setProperty('--input', '0 0% 15%');
        root.style.setProperty('--ring', '0 0% 83.1%');
    } else {
        root.style.setProperty('--background', '0 0% 96.1%'); // #f5f5f5
        root.style.setProperty('--foreground', '0 0% 9%');
        root.style.setProperty('--card', '0 0% 100%'); // #ffffff
        root.style.setProperty('--card-foreground', '0 0% 9%');
        root.style.setProperty('--popover', '0 0% 100%');
        root.style.setProperty('--popover-foreground', '0 0% 9%');
        root.style.setProperty('--primary', '0 0% 9%');
        root.style.setProperty('--primary-foreground', '0 0% 98%');
        root.style.setProperty('--secondary', '0 0% 98%'); // #fafafa
        root.style.setProperty('--secondary-foreground', '0 0% 9%');
        root.style.setProperty('--muted', '0 0% 94%'); // #f0f0f0
        root.style.setProperty('--muted-foreground', '0 0% 45.1%');
        root.style.setProperty('--accent-foreground', '0 0% 98%'); // White for on-accent text
        root.style.setProperty('--destructive', '0 84.2% 60.2%');
        root.style.setProperty('--destructive-foreground', '0 0% 98%');
        root.style.setProperty('--border', '0 0% 89.8%');
        root.style.setProperty('--input', '0 0% 93%'); // #ededed
        root.style.setProperty('--ring', '0 0% 9%');
    }

  }, [theme, accentColor]);

  const handleSearchClick = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case Page.Dashboard:
        return <Dashboard notes={notes} tasks={tasks} setNotes={setNotes} setTasks={setTasks} setActivePage={setActivePage} />;
      case Page.Notes:
        return <NotesPage notes={notes} setNotes={setNotes} />;
      case Page.Kanban:
        return <KanbanBoard tasks={tasks} setTasks={setTasks} />;
      case Page.Projects:
        return <ProjectsPage 
            projects={projects}
            setProjects={setProjects}
            notes={notes}
            tasks={tasks}
            recordings={recordings}
            setNotes={setNotes}
          />;
      case Page.VoiceRecorder:
        return <VoiceRecorder recordings={recordings} setRecordings={setRecordings} />;
      case Page.Settings:
        return <Settings setActivePage={setActivePage} />;
      case Page.Personalization:
        return <Personalization theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor} setActivePage={setActivePage} />;
      case Page.Upgrade:
          return <Upgrade />;
      case Page.HowItWorks:
          return <Documentation />;
      default:
        return <Dashboard notes={notes} tasks={tasks} setNotes={setNotes} setTasks={setTasks} setActivePage={setActivePage} />;
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter(task =>
    task.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredRecordings = recordings.filter(rec =>
    (rec.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (rec.transcript && rec.transcript.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onSearchClick={handleSearchClick}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex lg:hidden items-center justify-between p-4 border-b border-border h-16 flex-shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-muted">
            <MenuIcon className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold">{activePage}</span>
          <button onClick={handleSearchClick} className="p-2 rounded-full hover:bg-muted">
             <SearchIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderPage()}
        </div>
      </main>

      <Modal isOpen={isSearchOpen} onClose={() => { setIsSearchOpen(false); setSearchQuery(''); }} title="Search Everywhere">
        <div className="relative">
          <input
            type="text"
            placeholder="Type to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-12 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
        </div>
        <div className="mt-4 space-y-4">
          {searchQuery && (
            <>
              {filteredProjects.length > 0 && <div><h4 className="font-semibold mb-2 text-accent">Projects</h4><div className="space-y-2">{filteredProjects.map(p => <div key={p.id} className="p-3 bg-secondary rounded-md">{p.name}</div>)}</div></div>}
              {filteredNotes.length > 0 && <div><h4 className="font-semibold mb-2 text-accent">Notes</h4><div className="space-y-2">{filteredNotes.map(n => <div key={n.id} className="p-3 bg-secondary rounded-md">{n.title}</div>)}</div></div>}
              {filteredTasks.length > 0 && <div><h4 className="font-semibold mb-2 text-accent">Tasks</h4><div className="space-y-2">{filteredTasks.map(t => <div key={t.id} className="p-3 bg-secondary rounded-md">{t.content}</div>)}</div></div>}
              {filteredRecordings.length > 0 && <div><h4 className="font-semibold mb-2 text-accent">Recordings</h4><div className="space-y-2">{filteredRecordings.map(r => <div key={r.id} className="p-3 bg-secondary rounded-md">{r.name}</div>)}</div></div>}
              {filteredProjects.length === 0 && filteredNotes.length === 0 && filteredTasks.length === 0 && filteredRecordings.length === 0 && <p className="text-center text-muted-foreground py-4">No results found.</p>}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return <MainApp />;
}

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
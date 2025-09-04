import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import { Page, Theme, Note, Task, Recording, AccentColor, Project, User } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Modal from './components/Modal';
import { SearchIcon, MenuIcon, PlusFeatureIcon } from './components/icons';
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

// HSL color definitions for each accent color
const accentColorMap: Record<AccentColor, { h: number; s: number; l: number }> = {
    [AccentColor.Default]: { h: 221, s: 83, l: 53 }, // Use Blue as the default
    [AccentColor.Blue]: { h: 221, s: 83, l: 53 },
    [AccentColor.Green]: { h: 142, s: 76, l: 36 },
    [AccentColor.Yellow]: { h: 48, s: 96, l: 53 },
    [AccentColor.Pink]: { h: 333, s: 80, l: 53 },
    [AccentColor.Orange]: { h: 25, s: 95, l: 53 },
};

interface MainAppProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const MainApp: React.FC<MainAppProps> = ({ theme, setTheme, accentColor, setAccentColor }) => {
  const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUpgradePromptVisible, setIsUpgradePromptVisible] = useState(false);

  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [recordings, setRecordings] = useLocalStorage<Recording[]>('recordings', []);
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchClick = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case Page.Dashboard:
        return <Dashboard notes={notes} tasks={tasks} setNotes={setNotes} setTasks={setTasks} setActivePage={setActivePage} setIsUpgradePromptVisible={setIsUpgradePromptVisible} />;
      case Page.Notes:
        return <NotesPage notes={notes} setNotes={setNotes} setActivePage={setActivePage} setIsUpgradePromptVisible={setIsUpgradePromptVisible} />;
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
            setActivePage={setActivePage}
            setIsUpgradePromptVisible={setIsUpgradePromptVisible}
          />;
      case Page.VoiceRecorder:
        return <VoiceRecorder recordings={recordings} setRecordings={setRecordings} setActivePage={setActivePage} setIsUpgradePromptVisible={setIsUpgradePromptVisible} />;
      case Page.Settings:
        return <Settings setActivePage={setActivePage} />;
      case Page.Personalization:
        return <Personalization theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor} setActivePage={setActivePage} />;
      case Page.Upgrade:
          return <Upgrade />;
      case Page.HowItWorks:
          return <Documentation />;
      default:
        return <Dashboard notes={notes} tasks={tasks} setNotes={setNotes} setTasks={setTasks} setActivePage={setActivePage} setIsUpgradePromptVisible={setIsUpgradePromptVisible} />;
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
        <header className="flex lg:hidden items-center justify-between p-4 border-b border-outline-variant h-16 flex-shrink-0 bg-surface">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-surface-container">
            <MenuIcon className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold">{activePage}</span>
          <button onClick={handleSearchClick} className="p-2 rounded-full hover:bg-surface-container">
             <SearchIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface">
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
            className="w-full p-3 pl-12 bg-input text-on-surface placeholder:text-on-surface-variant border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-variant" />
        </div>
        <div className="mt-4 space-y-4">
          {searchQuery && (
            <>
              {filteredProjects.length > 0 && <div><h4 className="font-semibold mb-2 text-primary">Projects</h4><div className="space-y-2">{filteredProjects.map(p => <div key={p.id} className="p-3 bg-surface-container rounded-md">{p.name}</div>)}</div></div>}
              {filteredNotes.length > 0 && <div><h4 className="font-semibold mb-2 text-primary">Notes</h4><div className="space-y-2">{filteredNotes.map(n => <div key={n.id} className="p-3 bg-surface-container rounded-md">{n.title}</div>)}</div></div>}
              {filteredTasks.length > 0 && <div><h4 className="font-semibold mb-2 text-primary">Tasks</h4><div className="space-y-2">{filteredTasks.map(t => <div key={t.id} className="p-3 bg-surface-container rounded-md">{t.content}</div>)}</div></div>}
              {filteredRecordings.length > 0 && <div><h4 className="font-semibold mb-2 text-primary">Recordings</h4><div className="space-y-2">{filteredRecordings.map(r => <div key={r.id} className="p-3 bg-surface-container rounded-md">{r.name}</div>)}</div></div>}
              {filteredProjects.length === 0 && filteredNotes.length === 0 && filteredTasks.length === 0 && filteredRecordings.length === 0 && <p className="text-center text-on-surface-variant py-4">No results found.</p>}
            </>
          )}
        </div>
      </Modal>

      <Modal isOpen={isUpgradePromptVisible} onClose={() => setIsUpgradePromptVisible(false)} title="Plus Feature">
        <div className="text-center">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-primary-container flex items-center justify-center">
                 <PlusFeatureIcon className="w-8 h-8 text-on-primary-container"/>
            </div>
            <h3 className="text-xl font-bold mb-2">Unlock with My Place Plus</h3>
            <p className="text-on-surface-variant mb-6">This is a premium feature. Upgrade your plan to unlock powerful AI capabilities and boost your productivity.</p>
            <button
                onClick={() => {
                    setActivePage(Page.Upgrade);
                    setIsUpgradePromptVisible(false);
                }}
                className="w-full px-6 py-3 bg-primary text-on-primary font-semibold rounded-md hover:opacity-90"
            >
                Upgrade Now
            </button>
        </div>
      </Modal>
    </div>
  );
};

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const [theme, setTheme] = useLocalStorage<Theme>('theme', Theme.System);
    const [accentColor, setAccentColor] = useLocalStorage<AccentColor>('accent-color', AccentColor.Default);

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark = theme === Theme.Dark || (theme === Theme.System && window.matchMedia('(prefers-color-scheme: dark)').matches);
        root.classList.toggle('dark', isDark);

        const accent = accentColorMap[accentColor] || accentColorMap.Default;
        const p = (role: string, l: number) => root.style.setProperty(`--${role}`, `${accent.h} ${accent.s}% ${l}%`);
        const n = (role: string, l: number) => root.style.setProperty(`--${role}`, `240 6% ${l}%`); // Neutral palette
        
        if (isDark) {
            // Accent colors
            p('primary', 80); p('on-primary', 20);
            p('primary-container', 30); p('on-primary-container', 90);
            p('secondary', 80); p('on-secondary', 20);
            p('secondary-container', 30); p('on-secondary-container', 90);
            p('tertiary', 80); p('on-tertiary', 20);
            p('tertiary-container', 30); p('on-tertiary-container', 90);

            // Neutral / Surface colors
            n('background', 10); n('on-background', 90);
            n('surface', 10); n('on-surface', 90);
            root.style.setProperty('--foreground', `240 6% 90%`); // Explicitly set foreground for dark mode
            n('on-surface-variant', 80);
            n('surface-container-lowest', 4);
            n('surface-container-low', 10);
            n('surface-container', 12);
            n('surface-container-high', 17);
            n('surface-container-highest', 22);

            // Outlines
            n('outline', 60); n('outline-variant', 30);
            
            // Destructive
            root.style.setProperty('--destructive', '0 70% 50%');
            root.style.setProperty('--on-destructive', '0 0% 10%');

        } else {
            // Accent colors
            p('primary', 40); p('on-primary', 100);
            p('primary-container', 90); p('on-primary-container', 10);
            p('secondary', 40); p('on-secondary', 100);
            p('secondary-container', 90); p('on-secondary-container', 10);
            p('tertiary', 40); p('on-tertiary', 100);
            p('tertiary-container', 90); p('on-tertiary-container', 10);

            // Neutral / Surface colors
            n('background', 98); n('on-background', 10);
            n('surface', 98); n('on-surface', 10);
            root.style.setProperty('--foreground', `240 6% 10%`); // Explicitly set foreground for light mode
            n('on-surface-variant', 30);
            n('surface-container-lowest', 100);
            n('surface-container-low', 96);
            n('surface-container', 94);
            n('surface-container-high', 92);
            n('surface-container-highest', 90);

            // Outlines
            n('outline', 60); n('outline-variant', 80);
            
            // Destructive
            root.style.setProperty('--destructive', '0 84% 60%');
            root.style.setProperty('--on-destructive', '0 0% 100%');
        }

    }, [theme, accentColor]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return <MainApp theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor} />;
}

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
import React from 'react';
import { Page } from '../types';
import { DashboardIcon, NotesIcon, VoiceRecorderIcon, KanbanIcon, SettingsIcon, SearchIcon, CloseIcon, QuestionMarkIcon, ProjectsIcon } from './icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onSearchClick: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const navItems = [
  { page: Page.Dashboard, icon: <DashboardIcon className="w-6 h-6" /> },
  { page: Page.Notes, icon: <NotesIcon className="w-6 h-6" /> },
  { page: Page.VoiceRecorder, icon: <VoiceRecorderIcon className="w-6 h-6" /> },
  { page: Page.Kanban, icon: <KanbanIcon className="w-6 h-6" /> },
  { page: Page.Projects, icon: <ProjectsIcon className="w-6 h-6" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onSearchClick, isSidebarOpen, setIsSidebarOpen }) => {
  const NavButton: React.FC<{ page: Page; icon: React.ReactNode }> = ({ page, icon }) => (
    <li>
        <button
          onClick={() => {
            setActivePage(page);
            setIsSidebarOpen(false);
          }}
          className={`flex items-center w-full p-4 transition-all duration-200 rounded-xl text-md font-medium ${
            activePage === page
              ? 'bg-accent text-accent-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {icon}
          <span className="ml-4">{page}</span>
        </button>
    </li>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-sm"></div>}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 lg:relative z-40 w-72 h-full bg-background flex-col flex-shrink-0 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 border-r border-border`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center h-20 px-2">
             <div className="flex items-center">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-2xl">M</div>
              <span className="ml-4 text-2xl font-bold text-foreground">My Place</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-muted-foreground ml-auto p-2 rounded-full hover:bg-muted">
              <CloseIcon className="w-6 h-6"/>
            </button>
          </div>
          
          <div className="px-2 mb-4">
            <button 
              onClick={() => { onSearchClick(); setIsSidebarOpen(false); }} 
              className="flex items-center w-full p-4 text-left text-muted-foreground bg-secondary hover:bg-muted rounded-xl border border-transparent hover:border-border transition-colors duration-200"
            >
                <SearchIcon className="w-5 h-5" />
                <span className="ml-4">Search...</span>
            </button>
          </div>

          <nav className="flex-1 px-2">
            <ul className="space-y-2">
                {navItems.map(item => (
                <NavButton key={item.page} page={item.page} icon={item.icon} />
                ))}
            </ul>
          </nav>
          
          <div className="mt-auto flex items-center justify-center space-x-4 p-4 border-t border-border">
              <div className="relative group">
                  <button onClick={() => { setActivePage(Page.HowItWorks); setIsSidebarOpen(false); }} className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors" aria-label="How it works">
                      <QuestionMarkIcon className="w-6 h-6" />
                  </button>
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-3 py-1.5 bg-foreground text-background text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                      How it works
                  </span>
              </div>
              <div className="relative group">
                  <button onClick={() => { setActivePage(Page.Settings); setIsSidebarOpen(false); }} className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors" aria-label="Settings">
                      <SettingsIcon className="w-6 h-6" />
                  </button>
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-3 py-1.5 bg-foreground text-background text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                      Settings
                  </span>
              </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
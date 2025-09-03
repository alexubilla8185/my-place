import React from 'react';
import { Page, Theme } from '../types';
import { DashboardIcon, NotesIcon, VoiceRecorderIcon, KanbanIcon, DocsIcon, CalendarIcon, PlusIcon, SettingsIcon, SearchIcon, CloseIcon } from './icons';

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
  { page: Page.Documentation, icon: <DocsIcon className="w-6 h-6" /> },
  { page: Page.Calendar, icon: <CalendarIcon className="w-6 h-6" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onSearchClick, isSidebarOpen, setIsSidebarOpen }) => {
  const NavButton: React.FC<{ page: Page; icon: React.ReactNode }> = ({ page, icon }) => (
    <li>
        <button
          onClick={() => {
            setActivePage(page)
            setIsSidebarOpen(false)
          }}
          className={`flex items-center w-full h-14 px-3 transition-colors rounded-lg ${
            activePage === page
              ? 'text-accent font-semibold bg-accent/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <div className="w-12 flex justify-center">{icon}</div>
          <span className="ml-0">{page}</span>
        </button>
    </li>
  );

  return (
    <>
      <aside className={`fixed lg:relative z-40 lg:z-auto w-80 h-full bg-background flex-col flex-shrink-0 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center h-20 px-2">
             <div className="flex items-center">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-2xl">M</div>
              <span className="ml-4 text-2xl font-bold text-foreground">My Place</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-muted-foreground ml-auto">
              <CloseIcon className="w-6 h-6"/>
            </button>
          </div>
          
          <div className="px-2">
            <button onClick={() => { onSearchClick(); setIsSidebarOpen(false); }} className="flex items-center w-full h-12 px-4 text-left text-muted-foreground bg-secondary hover:bg-muted rounded-lg border border-border transition-colors">
                <SearchIcon className="w-5 h-5" />
                <span className="ml-4">Search...</span>
            </button>
          </div>


          <nav className="flex-1 mt-6 px-2">
            <ul className="space-y-2">
                {navItems.map(item => (
                <NavButton key={item.page} page={item.page} icon={item.icon} />
                ))}
            </ul>
          </nav>
          
          <div className="mt-auto px-2">
            <ul className="space-y-2">
                <NavButton page={Page.Upgrade} icon={<PlusIcon className="w-6 h-6" />} />
                <NavButton page={Page.Settings} icon={<SettingsIcon className="w-6 h-6" />} />
            </ul>
          </div>
        </div>
      </aside>
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden"></div>}
    </>
  );
};

export default Sidebar;
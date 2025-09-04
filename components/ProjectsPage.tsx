import React, { useState, useMemo } from 'react';
import { Project, Note, Task, Recording, KanbanStatus, Page } from '../types';
import { generateDocumentation } from '../services/geminiService';
import Modal from './Modal';
import { AddIcon, NotesIcon, CheckSquareIcon, VoiceRecorderIcon, EditIcon, DeleteIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import PlusFeatureTooltip from './PlusFeatureTooltip';

interface ProjectsPageProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  notes: Note[];
  tasks: Task[];
  recordings: Recording[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  setActivePage: (page: Page) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, setProjects, notes, tasks, recordings, setNotes, setActivePage }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  
  const [docType, setDocType] = useState<'Status Report' | 'Technical Brief' | 'Meeting Summary' | null>(null);
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectedRecordingIds, setSelectedRecordingIds] = useState<string[]>([]);

  const { user } = useAuth();

  const unassignedItems = useMemo(() => {
    const allNoteIds = new Set(projects.flatMap(p => p.noteIds));
    const allTaskIds = new Set(projects.flatMap(p => p.taskIds));
    const allRecordingIds = new Set(projects.flatMap(p => p.recordingIds));

    return {
      notes: notes.filter(n => !allNoteIds.has(n.id)),
      tasks: tasks.filter(t => !allTaskIds.has(t.id)),
      recordings: recordings.filter(r => !allRecordingIds.has(r.id)),
    };
  }, [projects, notes, tasks, recordings]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName,
      description: newProjectDesc,
      noteIds: [], taskIds: [], recordingIds: [],
      createdAt: Date.now(),
    };
    setProjects(prev => [newProject, ...prev]);
    setNewProjectName('');
    setNewProjectDesc('');
    setIsCreateModalOpen(false);
  };

  const handleOpenAssignModal = (project: Project) => {
    setSelectedProject(project);
    const assignedNoteIds = new Set(project.noteIds);
    const assignedTaskIds = new Set(project.taskIds);
    const assignedRecordingIds = new Set(project.recordingIds);

    setSelectedNoteIds(notes.filter(n => assignedNoteIds.has(n.id)).map(n => n.id));
    setSelectedTaskIds(tasks.filter(t => assignedTaskIds.has(t.id)).map(t => t.id));
    setSelectedRecordingIds(recordings.filter(r => assignedRecordingIds.has(r.id)).map(r => r.id));
    setIsAssignModalOpen(true);
  };

  const handleAssignItems = () => {
    if (!selectedProject) return;
    const updatedProject = {
      ...selectedProject,
      noteIds: selectedNoteIds,
      taskIds: selectedTaskIds,
      recordingIds: selectedRecordingIds,
    };
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setIsAssignModalOpen(false);
    setSelectedProject(null);
  };

  const handleGenerateDocs = async () => {
    if (!selectedProject || !docType) return;
    setIsGenerating(true);
    setGeneratedDoc('');
    
    const projectNotes = notes.filter(n => selectedProject.noteIds.includes(n.id));
    const projectTasks = tasks.filter(t => selectedProject.taskIds.includes(t.id));
    const projectRecordings = recordings.filter(r => selectedProject.recordingIds.includes(r.id));
    
    let content = `## Notes\n`;
    projectNotes.forEach(n => { content += `### ${n.title}\n${n.content}\n\n`; });
    
    content += `## Tasks\n`;
    Object.values(KanbanStatus).forEach(status => {
      const tasksInStatus = projectTasks.filter(t => t.status === status);
      if(tasksInStatus.length > 0) {
        content += `### ${status}\n`;
        tasksInStatus.forEach(t => { content += `- ${t.content}\n`; });
        content += '\n';
      }
    });
    
    content += `## Recordings\n`;
    projectRecordings.forEach(r => {
      content += `### ${r.name}\n`;
      content += r.transcript ? `Transcript: ${r.transcript}\n\n` : `(No transcript available)\n\n`;
    });
    
    const result = await generateDocumentation(selectedProject.name, content, docType);
    setGeneratedDoc(result);
    setIsGenerating(false);
  };

  const saveDocAsNote = () => {
    if (!generatedDoc || !selectedProject) return;
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: `${selectedProject.name} - ${docType}`,
      content: generatedDoc,
      createdAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    alert("Documentation saved as a new note!");
    setIsDocsModalOpen(false);
    setDocType(null);
    setGeneratedDoc('');
    setSelectedProject(null);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This will not delete the items within it.')) {
        setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const toggleSelection = (id: string, type: 'note' | 'task' | 'recording') => {
    const updaters = {
      note: setSelectedNoteIds,
      task: setSelectedTaskIds,
      recording: setSelectedRecordingIds,
    };
    const selectors = {
      note: selectedNoteIds,
      task: selectedTaskIds,
      recording: selectedRecordingIds,
    };
    const setter = updaters[type];
    const currentSelection = selectors[type];
    const newSelection = new Set(currentSelection);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setter(Array.from(newSelection));
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="hidden lg:block text-3xl font-bold">Projects</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 flex items-center gap-2"
        >
          <AddIcon className="w-5 h-5"/>
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-card p-6 rounded-lg border border-border flex flex-col">
            <h3 className="text-lg font-bold mb-2">{project.name}</h3>
            <p className="flex-1 text-muted-foreground text-sm mb-4">{project.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground py-3 border-y border-border">
                <div className="flex items-center gap-2" title="Notes"><NotesIcon className="w-4 h-4"/><span>{project.noteIds.length}</span></div>
                <div className="flex items-center gap-2" title="Tasks"><CheckSquareIcon className="w-4 h-4"/><span>{project.taskIds.length}</span></div>
                <div className="flex items-center gap-2" title="Recordings"><VoiceRecorderIcon className="w-4 h-4"/><span>{project.recordingIds.length}</span></div>
            </div>
             <div className="flex justify-between items-center gap-2 pt-4">
                <div className="flex items-center gap-1">
                    <button onClick={() => handleDeleteProject(project.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-full"><DeleteIcon className="w-5 h-5"/></button>
                    <button onClick={() => handleOpenAssignModal(project)} className="p-2 text-muted-foreground hover:text-accent hover:bg-muted rounded-full"><EditIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setSelectedProject(project); setIsDocsModalOpen(true); }} className="text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-md transition-colors flex items-center gap-2">
                        Generate Docs
                    </button>
                    {user?.isGuest && <PlusFeatureTooltip setActivePage={setActivePage} />}
                </div>
              </div>
          </div>
        ))}
      </div>
      
      {/* Create Project Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
            <input type="text" placeholder="Project Name" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required className="w-full p-3 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"/>
            <textarea placeholder="Description" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} rows={3} className="w-full p-3 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"></textarea>
            <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2.5 rounded-md hover:bg-muted font-semibold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90">Create Project</button>
            </div>
        </form>
      </Modal>

      {/* Assign Items Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => { setIsAssignModalOpen(false); setSelectedProject(null); }} title={`Assign Items to "${selectedProject?.name}"`}>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Notes</h4>
              {unassignedItems.notes.length > 0 || selectedNoteIds.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-border rounded-md bg-secondary">
                  {[...unassignedItems.notes, ...notes.filter(n => selectedNoteIds.includes(n.id) && !unassignedItems.notes.find(un => un.id === n.id))].map(note => (
                    <label key={note.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <input type="checkbox" checked={selectedNoteIds.includes(note.id)} onChange={() => toggleSelection(note.id, 'note')} className="w-4 h-4 accent-accent"/>
                      <span>{note.title}</span>
                    </label>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm">No available notes.</p>}
            </div>
            {/* Repeat for Tasks and Recordings */}
             <div>
              <h4 className="font-semibold mb-2">Tasks</h4>
                {[...unassignedItems.tasks, ...tasks.filter(t => selectedTaskIds.includes(t.id) && !unassignedItems.tasks.find(un => un.id === t.id))].length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-border rounded-md bg-secondary">
                  {[...unassignedItems.tasks, ...tasks.filter(t => selectedTaskIds.includes(t.id) && !unassignedItems.tasks.find(un => un.id === t.id))].map(task => (
                    <label key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <input type="checkbox" checked={selectedTaskIds.includes(task.id)} onChange={() => toggleSelection(task.id, 'task')} className="w-4 h-4 accent-accent"/>
                      <span>{task.content}</span>
                    </label>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm">No available tasks.</p>}
            </div>
             <div>
              <h4 className="font-semibold mb-2">Recordings</h4>
               {[...unassignedItems.recordings, ...recordings.filter(r => selectedRecordingIds.includes(r.id) && !unassignedItems.recordings.find(un => un.id === r.id))].length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-border rounded-md bg-secondary">
                  {[...unassignedItems.recordings, ...recordings.filter(r => selectedRecordingIds.includes(r.id) && !unassignedItems.recordings.find(un => un.id === r.id))].map(rec => (
                    <label key={rec.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <input type="checkbox" checked={selectedRecordingIds.includes(rec.id)} onChange={() => toggleSelection(rec.id, 'recording')} className="w-4 h-4 accent-accent"/>
                      <span>{rec.name}</span>
                    </label>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm">No available recordings.</p>}
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-border">
            <button onClick={() => handleAssignItems()} className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90">Save Assignments</button>
          </div>
      </Modal>

       {/* Generate Docs Modal */}
      <Modal isOpen={isDocsModalOpen} onClose={() => { setIsDocsModalOpen(false); setDocType(null); setGeneratedDoc(''); setSelectedProject(null); }} title="Generate Documentation">
        {!docType ? (
            <div className="space-y-4 text-center">
                <p>Choose a document type to generate for "{selectedProject?.name}":</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                    <button onClick={() => setDocType('Status Report')} className="px-6 py-3 bg-secondary font-semibold rounded-md hover:bg-muted">Status Report</button>
                    <button onClick={() => setDocType('Technical Brief')} className="px-6 py-3 bg-secondary font-semibold rounded-md hover:bg-muted">Technical Brief</button>
                    <button onClick={() => setDocType('Meeting Summary')} className="px-6 py-3 bg-secondary font-semibold rounded-md hover:bg-muted">Meeting Summary</button>
                </div>
                <div className="pt-4">
                  <button onClick={handleGenerateDocs} disabled={!docType} className="px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed">Generate</button>
                </div>
            </div>
        ) : isGenerating ? (
            <div className="text-center p-8">
                <p className="font-semibold animate-pulse">Generating your document...</p>
            </div>
        ) : (
            <div>
                <pre className="whitespace-pre-wrap bg-secondary p-4 rounded-md max-h-80 overflow-y-auto font-sans text-sm">{generatedDoc}</pre>
                <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-border">
                    <button onClick={() => { setDocType(null); setGeneratedDoc('');}} className="px-6 py-2.5 rounded-md hover:bg-muted font-semibold">Back</button>
                    <button onClick={saveDocAsNote} className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90">Save as Note</button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectsPage;

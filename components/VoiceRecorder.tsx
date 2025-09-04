import React, { useState, useRef, useCallback } from 'react';
import { Recording, Page } from '../types';
import { transcribeAudio } from '../services/geminiService';
import { PlayIcon, StopIcon, DeleteIcon, VoiceRecorderIcon, PlusFeatureIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

interface VoiceRecorderProps {
  recordings: Recording[];
  setRecordings: React.Dispatch<React.SetStateAction<Recording[]>>;
  setActivePage: (page: Page) => void;
  setIsUpgradePromptVisible: (isVisible: boolean) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ recordings, setRecordings, setActivePage, setIsUpgradePromptVisible }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribingId, setTranscribingId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuth();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const newRecording: Recording = {
          id: `rec-${Date.now()}`,
          name: `Recording ${new Date().toLocaleString()}`,
          audioUrl,
          createdAt: Date.now()
        };
        setRecordings(prev => [newRecording, ...prev]);
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this recording?')) {
      setRecordings(prev => prev.filter(r => r.id !== id));
    }
  };
  
  const handleTranscribe = async (id: string, audioUrl: string) => {
    if (user?.isGuest) {
        setIsUpgradePromptVisible(true);
        return;
    }
    setTranscribingId(id);
    const transcript = await transcribeAudio(audioUrl);
    setRecordings(prev => prev.map(r => r.id === id ? {...r, transcript} : r));
    setTranscribingId(null);
  };

  const playRecording = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="hidden lg:block text-3xl font-bold text-on-surface">Voice Recorder</h1>
      <div className="flex flex-col items-center justify-center p-8 bg-surface-container border border-outline-variant rounded-xl">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-destructive animate-pulse' : 'bg-primary hover:opacity-90'}`}
        >
            {isRecording ? <StopIcon className="w-10 h-10 text-on-destructive"/> : <VoiceRecorderIcon className="w-10 h-10 text-on-primary"/>}
        </button>
        <p className="mt-4 font-semibold text-on-surface">{isRecording ? 'Recording...' : 'Tap to Record'}</p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Past Recordings</h2>
        {recordings.length > 0 ? recordings.map(rec => (
          <div key={rec.id} className="p-4 bg-surface-container border border-outline-variant rounded-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full">
                <div className="p-3 bg-secondary-container rounded-full flex-shrink-0">
                    <VoiceRecorderIcon className="w-6 h-6 text-on-secondary-container"/>
                </div>
                <div className="truncate">
                    <p className="font-semibold truncate text-on-surface-variant">{rec.name}</p>
                    <p className="text-sm text-on-surface-variant">{new Date(rec.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <button onClick={() => playRecording(rec.audioUrl)} className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant"><PlayIcon className="w-5 h-5"/></button>
                <button onClick={() => handleTranscribe(rec.id, rec.audioUrl)} disabled={transcribingId === rec.id} className="text-sm font-semibold text-primary hover:bg-primary-container/50 px-3 py-2 rounded-full disabled:opacity-50 flex items-center gap-2">
                    {user?.isGuest && transcribingId !== rec.id && <PlusFeatureIcon className="w-5 h-5" />}
                    {transcribingId === rec.id ? '...' : 'Transcribe'}
                </button>
                <button onClick={() => handleDelete(rec.id)} className="p-2 rounded-full hover:bg-surface-container-high text-destructive"><DeleteIcon className="w-5 h-5"/></button>
              </div>
            </div>
            {rec.transcript && (
                <div className="mt-3 pt-3 border-t border-outline-variant">
                    <p className="text-sm italic text-on-surface-variant">"{rec.transcript}"</p>
                </div>
            )}
          </div>
        )) : <p className="text-on-surface-variant pt-4 text-center">No recordings yet.</p>}
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default VoiceRecorder;
import React, { useState, useRef, useCallback } from 'react';
import { Recording } from '../types';
import { transcribeAudio } from '../services/geminiService';
import { PlayIcon, StopIcon, DeleteIcon, VoiceRecorderIcon } from './icons';

interface VoiceRecorderProps {
  recordings: Recording[];
  setRecordings: React.Dispatch<React.SetStateAction<Recording[]>>;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ recordings, setRecordings }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribingId, setTranscribingId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      <h1 className="hidden lg:block text-3xl font-bold">Voice Recorder</h1>
      <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-lg shadow-sm">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 text-white ${isRecording ? 'bg-destructive animate-pulse' : 'bg-accent hover:bg-accent/90'}`}
        >
            {isRecording ? <StopIcon className="w-10 h-10 text-destructive-foreground"/> : <VoiceRecorderIcon className="w-10 h-10 text-accent-foreground"/>}
        </button>
        <p className="mt-4 font-semibold text-foreground">{isRecording ? 'Recording...' : 'Tap to Record'}</p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Past Recordings</h2>
        {recordings.length > 0 ? recordings.map(rec => (
          <div key={rec.id} className="p-4 bg-card border border-border rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full">
                <div className="p-3 bg-muted rounded-full flex-shrink-0">
                    <VoiceRecorderIcon className="w-6 h-6 text-muted-foreground"/>
                </div>
                <div className="truncate">
                    <p className="font-semibold truncate">{rec.name}</p>
                    <p className="text-sm text-muted-foreground">{new Date(rec.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <button onClick={() => playRecording(rec.audioUrl)} className="p-2 rounded-full hover:bg-muted"><PlayIcon className="w-5 h-5"/></button>
                <button onClick={() => handleTranscribe(rec.id, rec.audioUrl)} disabled={transcribingId === rec.id} className="text-sm font-semibold text-accent hover:bg-accent/10 px-3 py-2 rounded-md disabled:opacity-50">
                    {transcribingId === rec.id ? '...' : 'Transcribe'}
                </button>
                <button onClick={() => handleDelete(rec.id)} className="p-2 rounded-full hover:bg-muted"><DeleteIcon className="w-5 h-5 text-destructive"/></button>
              </div>
            </div>
            {rec.transcript && (
                <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm italic text-muted-foreground">"{rec.transcript}"</p>
                </div>
            )}
          </div>
        )) : <p className="text-muted-foreground pt-4 text-center">No recordings yet.</p>}
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default VoiceRecorder;
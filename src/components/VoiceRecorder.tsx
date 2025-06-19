
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onRecordingClear: () => void;
}

const VoiceRecorder = ({ onRecordingComplete, onRecordingClear }: VoiceRecorderProps) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingStartTime = useRef<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        onRecordingComplete(blob, recordingDuration);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      recordingStartTime.current = Date.now();
      
      // Start duration counter
      durationInterval.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - recordingStartTime.current) / 1000));
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Speak your complaint clearly...",
        className: "bg-green-50 text-green-800"
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      toast({
        title: "Recording Stopped",
        description: `Recorded ${recordingDuration} seconds of audio.`,
        className: "bg-blue-50 text-blue-800"
      });
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setPlaybackDuration(0);
      });

      audio.addEventListener('timeupdate', () => {
        setPlaybackDuration(Math.floor(audio.currentTime));
      });

      audio.play();
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const clearRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setAudioBlob(null);
    setRecordingDuration(0);
    setPlaybackDuration(0);
    setIsPlaying(false);
    onRecordingClear();

    toast({
      title: "Recording Cleared",
      description: "Voice message has been removed.",
      className: "bg-gray-50 text-gray-800"
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {!isRecording && !audioBlob && (
          <Button
            type="button"
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
          >
            <Mic className="h-4 w-4" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button
            type="button"
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            Stop Recording
          </Button>
        )}

        {audioBlob && !isRecording && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={isPlaying ? pausePlayback : playRecording}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            
            <Button
              type="button"
              onClick={clearRecording}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Recording status */}
      {isRecording && (
        <div className="flex items-center gap-2 text-red-600">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Recording: {formatTime(recordingDuration)}</span>
        </div>
      )}

      {/* Playback status */}
      {audioBlob && !isRecording && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              Voice message recorded ({formatTime(recordingDuration)})
            </span>
            {isPlaying && (
              <span className="text-blue-600 text-sm">
                Playing: {formatTime(playbackDuration)} / {formatTime(recordingDuration)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;

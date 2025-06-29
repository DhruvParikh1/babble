// File: voice-text-note-processor/components/voice-recorder.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  userId: string;
}

// TypeScript interfaces for Web Speech API
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

export function VoiceRecorder({ userId }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const isStoppingRef = useRef(false);

  const processTranscription = useCallback(async (text: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/process-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: text,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process transcription');
      }

      const result = await response.json();
      console.log('Processing result:', result);
      
      // Clear the transcript after successful processing
      setTranscript('');
      finalTranscriptRef.current = '';
      
      // Trigger a refresh of the processed items list
      window.dispatchEvent(new CustomEvent('refreshProcessedItems'));
      
    } catch (error) {
      console.error('Error processing transcription:', error);
      setError('Failed to process your voice note');
    } finally {
      setIsProcessing(false);
    }
  }, [userId]);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = false; // Changed to false for better mobile support
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
        setError(null);
        finalTranscriptRef.current = '';
        setTranscript('');
        isStoppingRef.current = false;
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        finalTranscriptRef.current = finalTranscript;
        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        
        // Don't show error for 'aborted' since that's intentional
        if (event.error !== 'aborted') {
          setError(`Speech recognition error: ${event.error}`);
        }
        
        setIsRecording(false);
        isStoppingRef.current = false;
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        
        // Only process if we're not manually stopping
        if (!isStoppingRef.current) {
          setIsRecording(false);
          
          if (finalTranscriptRef.current.trim()) {
            processTranscription(finalTranscriptRef.current.trim());
          }
        }
      };
    } else {
      setError('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [processTranscription]);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording && !isProcessing) {
      try {
        console.log('Starting speech recognition...');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setError('Failed to start recording');
      }
    }
  };

  const recreateRecognition = useCallback(() => {
    const SpeechRecognition = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition;
    
    if (SpeechRecognition && recognitionRef.current) {
      // Destroy old instance
      try {
        recognitionRef.current.abort();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Ignore errors when aborting
      }
      
      // Create new instance
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Re-attach event handlers
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
        setError(null);
        finalTranscriptRef.current = '';
        setTranscript('');
        isStoppingRef.current = false;
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        finalTranscriptRef.current = finalTranscript;
        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error !== 'aborted') {
          setError(`Speech recognition error: ${event.error}`);
        }
        
        setIsRecording(false);
        isStoppingRef.current = false;
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        
        if (!isStoppingRef.current) {
          setIsRecording(false);
          
          if (finalTranscriptRef.current.trim()) {
            processTranscription(finalTranscriptRef.current.trim());
          }
        }
      };
    }
  }, [processTranscription]);

  const stopRecording = () => {
    if (recognitionRef.current && isRecording && !isStoppingRef.current) {
      console.log('Stopping speech recognition...');
      isStoppingRef.current = true;
      
      try {
        // Capture current transcript before stopping
        const currentTranscript = finalTranscriptRef.current.trim();
        
        // Force state reset immediately
        setIsRecording(false);
        
        // Try to abort the current recognition
        recognitionRef.current.abort();
        
        // Reset stopping flag
        isStoppingRef.current = false;
        
        // Recreate the recognition instance for next time
        setTimeout(() => {
          recreateRecognition();
        }, 100);
        
        // Process transcript if we have any
        if (currentTranscript) {
          processTranscription(currentTranscript);
        }
        
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsRecording(false);
        isStoppingRef.current = false;
        recreateRecognition();
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center space-y-4">
        <div className="text-red-500">
          Speech recognition is not supported in this browser. 
          Please use Chrome, Safari, or Edge.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recording Button */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing || isStoppingRef.current}
            size="lg"
            className={cn(
              "w-20 h-20 rounded-full transition-all duration-200",
              isRecording 
                ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                : "bg-blue-500 hover:bg-blue-600"
            )}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </Button>
          
          {isRecording && (
            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-red-300 animate-ping" />
          )}
        </div>

        <div className="text-center">
          {isProcessing ? (
            <p className="text-sm text-muted-foreground">Processing your voice note...</p>
          ) : isRecording ? (
            <p className="text-sm text-blue-600 font-medium">Recording... Tap to stop</p>
          ) : (
            <p className="text-sm text-muted-foreground">Tap to start recording</p>
          )}
        </div>
      </div>

      {/* Live Transcript */}
      {transcript && (
        <div className="bg-muted rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">Live Transcript:</h3>
          <p className="text-sm text-muted-foreground italic">&quot;{transcript}&quot;</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-xs text-muted-foreground">
        <p>Try saying things like:</p>
        <p>&quot;Remind me to call mom tomorrow at 3pm&quot; • &quot;Buy milk and eggs&quot; • &quot;Research competitor pricing&quot;</p>
      </div>
    </div>
  );
}
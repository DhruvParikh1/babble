// File: voice-text-note-processor/components/processing-indicator.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function ProcessingIndicator() {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleProcessingStart = () => setIsProcessing(true);
    const handleProcessingEnd = () => setIsProcessing(false);

    window.addEventListener('voiceProcessingStart', handleProcessingStart);
    window.addEventListener('voiceProcessingEnd', handleProcessingEnd);

    return () => {
      window.removeEventListener('voiceProcessingStart', handleProcessingStart);
      window.removeEventListener('voiceProcessingEnd', handleProcessingEnd);
    };
  }, []);

  if (!isProcessing) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      <div>
        <p className="text-sm font-medium text-blue-900">Processing your voice note...</p>
        <p className="text-xs text-blue-700">AI is categorizing and organizing your content</p>
      </div>
    </div>
  );
}
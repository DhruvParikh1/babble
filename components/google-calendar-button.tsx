// File: components/google-calendar-button.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GoogleCalendarButtonProps {
  isConnected: boolean;
  userId: string;
}

export function GoogleCalendarButton({ isConnected: initialConnected }: GoogleCalendarButtonProps) {
  const [isConnected, setIsConnected] = useState(initialConnected);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'google_calendar_connected') {
      setIsConnected(true);
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    if (error) {
      setError('Failed to connect Google Calendar. Please try again.');
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/integrations/google-calendar/connect');
      if (!response.ok) {
        throw new Error('Failed to start connection process');
      }

      const { authUrl } = await response.json();
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      setError('Failed to connect Google Calendar. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar? This will stop automatic calendar event creation.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/integrations/google-calendar/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      setIsConnected(false);
      router.refresh(); // Refresh the page to update the UI
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      setError('Failed to disconnect Google Calendar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={isLoading}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <ExternalLink className="w-3 h-3 mr-1" />
          )}
          {isConnected ? 'Disconnect' : 'Retry'}
        </Button>
        <p className="text-xs text-red-600">{error}</p>
      </div>
    );
  }

  if (isConnected) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleDisconnect}
        disabled={isLoading}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        ) : (
          <X className="w-3 h-3 mr-1" />
        )}
        Disconnect
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleConnect}
      disabled={isLoading}
      className="text-green-600 border-green-200 hover:bg-green-50"
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : (
        <Calendar className="w-3 h-3 mr-1" />
      )}
      Connect
    </Button>
  );
}
// File: app/api/integrations/google-calendar/create-event/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { googleCalendarService } from '@/lib/google-calendar';

interface CreateEventRequest {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateEventRequest = await request.json();
    const { summary, description, startDateTime, endDateTime, timeZone } = body;

    if (!summary || !startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: 'Missing required fields: summary, startDateTime, endDateTime' },
        { status: 400 }
      );
    }

    // Get user's Google Calendar tokens
    const tokens = await googleCalendarService.getUserTokens(user.id);
    if (!tokens) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    // Create the calendar event
    const event = await googleCalendarService.createEvent(tokens, {
      summary,
      description,
      startDateTime,
      endDateTime,
      timeZone: timeZone || 'America/New_York'
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        htmlLink: event.htmlLink
      }
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
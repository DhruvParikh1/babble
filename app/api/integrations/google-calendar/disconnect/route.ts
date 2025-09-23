// File: app/api/integrations/google-calendar/disconnect/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { googleCalendarService } from '@/lib/google-calendar';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Disconnect Google Calendar
    await googleCalendarService.disconnectCalendar(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    );
  }
}
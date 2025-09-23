// File: app/api/integrations/google-calendar/connect/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { googleCalendarService } from '@/lib/google-calendar';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate Google OAuth URL
    const authUrl = googleCalendarService.getAuthUrl(user.id);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google Calendar auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}
// File: app/api/auth/google/callback/route.ts
import { NextRequest } from 'next/server';
import { googleCalendarService } from '@/lib/google-calendar';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // This contains the user ID
  const error = searchParams.get('error');

  console.log('Google Calendar OAuth callback received:', { 
    hasCode: !!code, 
    hasState: !!state, 
    error,
    scope: searchParams.get('scope')
  });

  // Handle OAuth errors
  if (error) {
    console.error('Google OAuth error:', error);
    redirect('/capture/profile?error=google_calendar_connection_failed');
  }

  if (!code || !state) {
    console.error('Missing OAuth parameters:', { code: !!code, state: !!state });
    redirect('/capture/profile?error=missing_oauth_parameters');
  }

  try {
    // Exchange code for tokens
    console.log('Exchanging code for tokens...');
    const tokens = await googleCalendarService.getTokensFromCode(code);
    console.log('Tokens received:', { 
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date
    });

    // Save tokens to database
    console.log('Saving tokens to database for user:', state);
    await googleCalendarService.saveUserTokens(state, tokens);
    console.log('Tokens saved successfully');

  } catch (error) {
    console.error('Error in Google Calendar OAuth process:', error);
    redirect('/capture/profile?error=google_calendar_connection_failed');
  }

  // Redirect back to profile page with success (outside try-catch)
  redirect('/capture/profile?success=google_calendar_connected');
}
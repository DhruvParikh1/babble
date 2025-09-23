// File: lib/google-calendar.ts
import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import type { calendar_v3 } from 'googleapis';
import { createClient } from '@/lib/supabase/server';

interface CalendarEvent {
  summary: string;
  description?: string;
  startDateTime: string; // ISO string
  endDateTime: string; // ISO string
  timeZone?: string;
}

interface GoogleCalendarTokens {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`
    );
  }

  // Generate OAuth URL for user to connect their Google Calendar
  getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId, // We'll use this to identify the user in the callback
      prompt: 'consent' // Forces refresh token to be returned
    });
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code: string): Promise<GoogleCalendarTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens as GoogleCalendarTokens;
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken: string): Promise<string> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials.access_token as string;
  }

  // Set credentials for API calls
  setCredentials(tokens: Partial<GoogleCalendarTokens>) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Create a calendar event
  async createEvent(
    userTokens: GoogleCalendarTokens,
    eventDetails: CalendarEvent
  ): Promise<calendar_v3.Schema$Event> {
    try {
      // Set up OAuth client with user's tokens
      this.setCredentials(userTokens);

      // Create calendar service
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Create the event
      const event = {
        summary: eventDetails.summary,
        description: eventDetails.description,
        start: {
          dateTime: eventDetails.startDateTime,
          timeZone: eventDetails.timeZone || 'America/New_York',
        },
        end: {
          dateTime: eventDetails.endDateTime,
          timeZone: eventDetails.timeZone || 'America/New_York',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      
      // If token is expired, try to refresh
      if (this.isGoogleApiError(error) && error.code === 401 && userTokens.refresh_token) {
        try {
          const newAccessToken = await this.refreshAccessToken(userTokens.refresh_token);
          
          // Update tokens and retry
          const updatedTokens = { ...userTokens, access_token: newAccessToken };
          this.setCredentials(updatedTokens);
          
          // Update the access token in database
          await this.updateUserTokens(userTokens.refresh_token, newAccessToken);
          
          // Retry the event creation
          return this.createEvent(updatedTokens, eventDetails);
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          throw new Error('Failed to refresh Google Calendar access token');
        }
      }
      
      throw error;
    }
  }

  // Type guard for Google API errors
  private isGoogleApiError(error: unknown): error is { code: number; message: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
  }

  // Get user's calendar tokens from database
  async getUserTokens(userId: string): Promise<GoogleCalendarTokens | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('google_calendar_refresh_token, google_calendar_access_token, google_calendar_token_expiry')
      .eq('user_id', userId)
      .single();

    if (error || !data?.google_calendar_refresh_token) {
      return null;
    }

    return {
      access_token: data.google_calendar_access_token || '',
      refresh_token: data.google_calendar_refresh_token,
      scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
      token_type: 'Bearer',
      expiry_date: data.google_calendar_token_expiry || 0
    };
  }

  // Save user tokens to database
  async saveUserTokens(userId: string, tokens: GoogleCalendarTokens): Promise<void> {
    const supabase = await createClient();
    
    await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        google_calendar_connected: true,
        google_calendar_refresh_token: tokens.refresh_token,
        google_calendar_access_token: tokens.access_token,
        google_calendar_token_expiry: tokens.expiry_date,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
  }

  // Update access token in database
  async updateUserTokens(refreshToken: string, newAccessToken: string): Promise<void> {
    const supabase = await createClient();
    
    await supabase
      .from('user_profiles')
      .update({
        google_calendar_access_token: newAccessToken,
        google_calendar_token_expiry: Date.now() + (3600 * 1000), // 1 hour from now
        updated_at: new Date().toISOString()
      })
      .eq('google_calendar_refresh_token', refreshToken);
  }

  // Disconnect Google Calendar
  async disconnectCalendar(userId: string): Promise<void> {
    const supabase = await createClient();
    
    await supabase
      .from('user_profiles')
      .update({
        google_calendar_connected: false,
        google_calendar_refresh_token: null,
        google_calendar_access_token: null,
        google_calendar_token_expiry: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  }

  // Check if user has Google Calendar connected
  async isCalendarConnected(userId: string): Promise<boolean> {
    const supabase = await createClient();
    
    const { data } = await supabase
      .from('user_profiles')
      .select('google_calendar_connected')
      .eq('user_id', userId)
      .single();

    return data?.google_calendar_connected || false;
  }
}

export const googleCalendarService = new GoogleCalendarService();
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processVoiceNote } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { transcript, userId } = body;

    if (!transcript || !userId || userId !== user.id) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Step 1: Save the original transcription
    const { data: transcriptionData, error: transcriptionError } = await supabase
      .from('transcriptions')
      .insert({
        user_id: userId,
        original_text: transcript,
        status: 'processing'
      })
      .select()
      .single();

    if (transcriptionError) {
      console.error('Error saving transcription:', transcriptionError);
      return NextResponse.json({ error: 'Failed to save transcription' }, { status: 500 });
    }

    try {
      // Step 2: Get user's existing categories
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('name')
        .eq('user_id', userId);

      const categoryNames = existingCategories?.map(cat => cat.name) || [];

      // Step 3: Process with OpenAI (pass current date, existing categories, and timezone)
      const currentDate = new Date().toISOString();
      const userTimezone = 'America/New_York'; // Norfolk, Virginia timezone
      const processedItems = await processVoiceNote(transcript, categoryNames, currentDate, userTimezone);

      const createdItems = [];

      // Step 4: Process each item separately
      for (const processed of processedItems) {
        // Find or create category for this item
        let categoryId: string;
        
        // First, try to find existing category
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', userId)
          .eq('name', processed.category)
          .single();

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Create new category
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({
              user_id: userId,
              name: processed.category,
              description: `Auto-created category for ${processed.category.toLowerCase()}`
            })
            .select()
            .single();

          if (categoryError) {
            console.error('Error creating category:', categoryError);
            continue; // Skip this item but continue with others
          }

          categoryId = newCategory.id;
        }

        // Create processed item
        const { data: processedItem, error: itemError } = await supabase
          .from('processed_items')
          .insert({
            user_id: userId,
            transcription_id: transcriptionData.id,
            category_id: categoryId,
            content: processed.content,
            item_type: processed.item_type,
            due_date: processed.due_date || null,
            completed: false
          })
          .select()
          .single();

        if (itemError) {
          console.error('Error creating processed item:', itemError);
          continue; // Skip this item but continue with others
        }

        createdItems.push({
          processed_item_id: processedItem.id,
          category: processed.category,
          content: processed.content,
          item_type: processed.item_type,
          due_date: processed.due_date,
          confidence: processed.confidence
        });

        // Handle calendar integration for reminders
        if (processed.item_type === 'reminder' && processed.due_date) {
          try {
            // TODO: Integrate with Google Calendar
            console.log('Calendar reminder needed:', {
              content: processed.content,
              due_date: processed.due_date
            });
          } catch (calendarError) {
            console.error('Calendar integration error:', calendarError);
            // Don't fail the whole request for calendar errors
          }
        }
      }

      // Step 5: Update transcription status
      await supabase
        .from('transcriptions')
        .update({ 
          status: 'completed',
          processed_text: processedItems.map(item => item.content).join('; ')
        })
        .eq('id', transcriptionData.id);

      return NextResponse.json({
        success: true,
        data: {
          transcription_id: transcriptionData.id,
          items_created: createdItems.length,
          items: createdItems
        }
      });

    } catch (processingError) {
      console.error('Error during processing:', processingError);
      
      // Update transcription status to error
      await supabase
        .from('transcriptions')
        .update({ status: 'error' })
        .eq('id', transcriptionData.id);

      return NextResponse.json({ error: 'Failed to process voice note' }, { status: 500 });
    }

  } catch (error) {
    console.error('Unexpected error in process-voice API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
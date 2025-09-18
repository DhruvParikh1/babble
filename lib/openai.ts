// File: lib/openai.ts
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ProcessedVoiceNote {
  category: string;
  content: string;
  item_type: 'reminder' | 'task' | 'note' | 'contact_action';
  due_date?: string; // ISO string if applicable
  confidence: number; // 0-1 confidence score
}

export interface ProcessedVoiceNoteResponse {
  items: ProcessedVoiceNote[];
}

export async function processVoiceNote(
  transcript: string, 
  existingCategories: string[] = [],
  currentDate: string = new Date().toISOString(),
  userTimezone: string = 'America/New_York'
): Promise<ProcessedVoiceNote[]> {
  const categoryList = existingCategories.length > 0 
    ? `Existing categories: ${existingCategories.join(', ')}`
    : 'No existing categories - you can create new ones';

  const now = new Date(currentDate);
  const userLocalTime = now.toLocaleString('en-US', { 
    timeZone: userTimezone,
    dateStyle: 'full',
    timeStyle: 'long'
  });

  const systemPrompt = `You are an AI assistant that categorizes voice notes into actionable items. 

Current date and time in user's timezone (${userTimezone}): ${userLocalTime}
Current UTC time: ${currentDate}

IMPORTANT INSTRUCTIONS:
1. IDENTIFY ALL SEPARATE TASKS/ITEMS in the voice note - users often mention multiple things
2. CREATE SEPARATE ENTRIES for each distinct task/reminder/item
3. CATEGORIZE APPROPRIATELY - be specific and logical with categories

TIMEZONE RULES:
- When user mentions times like "3pm", "tomorrow at 3pm", etc., they mean LOCAL TIME in ${userTimezone}
- Convert all times to UTC for storage
- For example: if user says "3pm" and they're in Eastern Time, store as 19:00:00Z (3pm + 4 hours for EDT)

CATEGORIZATION RULES:
- Doctor/medical appointments → "Health" or "Medical"
- Shopping items → "Shopping" or "Groceries"
- Work-related → "Work" or specific work category
- Family calls → "Family"
- General appointments → "Appointments"
- Bills/payments → "Finance"
- Personal care → "Personal"
- PREFER existing categories when appropriate, but CREATE NEW SPECIFIC ones when needed

${categoryList}

Analyze the user's voice note and extract ALL separate actionable items:

For EACH separate task/item, determine:
1. An appropriate category name (prefer existing categories when suitable, create specific new ones when needed)
2. Clean, actionable content (just the specific task, not combined items)
3. Item type (reminder, task, note, or contact_action)
4. Due date if mentioned (return as ISO string in UTC, converted from user's local time)

Examples of MULTIPLE ITEMS:
- "Remind me to call mom tomorrow and buy groceries" = 2 items
- "Doctor appointment at 3pm and also pay bills" = 2 items
- "Buy milk, eggs, and bread" = 1 item (single shopping task)

Rules:
- ALWAYS look for multiple separate tasks
- Extract clear, actionable content for each item
- Use specific, logical categories
- For times: if no time specified but date is, assume 9:00 AM local time
- ALWAYS convert local times to UTC for storage

Respond with valid JSON only:
{
  "items": [
    {
      "category": "string",
      "content": "string", 
      "item_type": "reminder" | "task" | "note" | "contact_action",
      "due_date": "ISO string in UTC or null",
      "confidence": 0.0-1.0
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please process this voice note: "${transcript}"` }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const parsed = JSON.parse(response) as ProcessedVoiceNoteResponse;
    
    // Validate the response structure
    if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      throw new Error('Invalid response structure from OpenAI - no items array');
    }

    // Validate and fix each item
    const validatedItems: ProcessedVoiceNote[] = [];
    
    for (const item of parsed.items) {
      if (!item.category || !item.content || !item.item_type) {
        console.warn('Skipping invalid item:', item);
        continue;
      }

      // Validate and fix due_date if present
      if (item.due_date) {
        try {
          const parsedDate = new Date(item.due_date);
          if (isNaN(parsedDate.getTime())) {
            console.warn('Invalid date from OpenAI, removing due_date:', item.due_date);
            item.due_date = undefined;
          } else {
            // Ensure the date is reasonable (not too far in past/future)
            const now = new Date();
            const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            const oneYearFromNow = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
            
            if (parsedDate < oneMonthAgo) {
              console.warn('Due date is too far in the past, removing:', item.due_date);
              item.due_date = undefined;
            } else if (parsedDate > oneYearFromNow) {
              console.warn('Due date is too far in future, removing:', item.due_date);
              item.due_date = undefined;
            } else {
              // Date looks reasonable, keep as UTC
              item.due_date = parsedDate.toISOString();
            }
          }
        } catch (dateError) {
          console.warn('Error parsing due_date, removing:', item.due_date, dateError);
          item.due_date = undefined;
        }
      }

      validatedItems.push(item);
    }

    if (validatedItems.length === 0) {
      throw new Error('No valid items after validation');
    }

    return validatedItems;
  } catch (error) {
    console.error('Error processing voice note with OpenAI:', error);
    
    // Fallback processing if OpenAI fails
    return [{
      category: 'General',
      content: transcript,
      item_type: 'note',
      confidence: 0.1
    }];
  }
}
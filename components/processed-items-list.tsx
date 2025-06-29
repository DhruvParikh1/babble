'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Calendar, CheckCircle, Circle, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ProcessedItem {
  id: string;
  content: string;
  item_type: 'reminder' | 'task' | 'note' | 'contact_action';
  category_name: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

interface ProcessedItemsListProps {
  userId: string;
}

export function ProcessedItemsList({ userId }: ProcessedItemsListProps) {
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('processed_items')
        .select(`
          id,
          content,
          item_type,
          due_date,
          completed,
          created_at,
          category_id,
          categories(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedItems = data?.map(item => ({
        ...item,
        category_name: item.categories && typeof item.categories === 'object' && !Array.isArray(item.categories) 
          ? (item.categories as { name: string }).name 
          : 'Uncategorized'
      })) || [];

      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to load your items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();

    // Listen for refresh events from voice recorder
    const handleRefresh = () => {
      fetchItems();
    };

    window.addEventListener('refreshProcessedItems', handleRefresh);
    return () => {
      window.removeEventListener('refreshProcessedItems', handleRefresh);
    };
  }, [userId]);

  const toggleCompleted = async (itemId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('processed_items')
        .update({ completed: !completed })
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId ? { ...item, completed: !completed } : item
      ));
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('processed_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Calendar className="w-4 h-4" />;
      case 'task':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'bg-blue-100 text-blue-800';
      case 'task':
        return 'bg-green-100 text-green-800';
      case 'note':
        return 'bg-gray-100 text-gray-800';
      case 'contact_action':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        timeZone: 'America/New_York', // Ensure we display in user's timezone
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading your items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-600">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={fetchItems}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No items yet. Start by recording a voice note!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className={item.completed ? 'opacity-60' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getItemTypeIcon(item.item_type)}
                <CardTitle className="text-sm font-medium">{item.category_name}</CardTitle>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getItemTypeColor(item.item_type)}`}
                >
                  {item.item_type}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCompleted(item.id, item.completed)}
                >
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-sm ${item.completed ? 'line-through' : ''}`}>
              {item.content}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>Created {formatDate(item.created_at)}</span>
              {item.due_date && (
                <span>Due {formatDate(item.due_date)}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
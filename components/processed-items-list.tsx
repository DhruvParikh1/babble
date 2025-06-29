// File: voice-text-note-processor/components/processed-items-list.tsx
'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Edit, 
  Calendar, 
  CheckCircle, 
  Circle, 
  Trash2, 
  Plus,
  Clock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface ProcessedItem {
  id: string;
  content: string;
  item_type: 'reminder' | 'task' | 'note' | 'contact_action';
  category_name: string;
  category_id: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  items: ProcessedItem[];
  color: string;
}

interface ProcessedItemsListProps {
  userId: string;
}

export function ProcessedItemsList({ userId }: ProcessedItemsListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  const supabase = createClient();

  const categoryColors: Record<string, string> = {
    'Health': 'bg-red-500',
    'Medical': 'bg-red-500',
    'Work': 'bg-blue-500',
    'Shopping': 'bg-green-500',
    'Groceries': 'bg-green-500',
    'Family': 'bg-purple-500',
    'Personal': 'bg-indigo-500',
    'Finance': 'bg-yellow-500',
    'Appointments': 'bg-orange-500',
    'General': 'bg-gray-500'
  };

  const getColorForCategory = (categoryName: string): string => {
    return categoryColors[categoryName] || 'bg-slate-500';
  };

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
          categories(id, name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Group items by category
      const categoryMap = new Map<string, Category>();
      
      data?.forEach(item => {
        const categoryData = item.categories && typeof item.categories === 'object' && !Array.isArray(item.categories) 
          ? item.categories as { id: string; name: string }
          : { id: 'general', name: 'General' };

        const categoryId = categoryData.id;
        const categoryName = categoryData.name;

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            id: categoryId,
            name: categoryName,
            items: [],
            color: getColorForCategory(categoryName)
          });
        }

        const processedItem: ProcessedItem = {
          ...item,
          category_name: categoryName,
          category_id: categoryId
        };

        categoryMap.get(categoryId)!.items.push(processedItem);
      });

      const categoriesArray = Array.from(categoryMap.values());
      setCategories(categoriesArray);
      
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

      setCategories(categories.map(category => ({
        ...category,
        items: category.items.map(item => 
          item.id === itemId ? { ...item, completed: !completed } : item
        )
      })));
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

      setCategories(categories.map(category => ({
        ...category,
        items: category.items.filter(item => item.id !== itemId)
      })));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const addNewItem = async () => {
    if (!newItemText.trim()) return;

    try {
      // Find the active category
      const activeCateg = categories.find(cat => cat.id === activeCategory);
      if (!activeCateg) return;

      const { data, error } = await supabase
        .from('processed_items')
        .insert({
          user_id: userId,
          transcription_id: '', // We'll need to handle this differently for manual items
          category_id: activeCategory,
          content: newItemText.trim(),
          item_type: 'task',
          completed: false
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newItem: ProcessedItem = {
        id: data.id,
        content: data.content,
        item_type: data.item_type,
        category_name: activeCateg.name,
        category_id: activeCategory,
        due_date: data.due_date,
        completed: false,
        created_at: data.created_at
      };

      setCategories(categories.map(category => 
        category.id === activeCategory 
          ? { ...category, items: [newItem, ...category.items] }
          : category
      ));

      setNewItemText('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding item:', error);
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
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';
      if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
      if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  const activeCategoryData = activeCategory === 'all' 
    ? {
        id: 'all',
        name: 'All Items',
        items: categories.flatMap(cat => cat.items).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        color: 'bg-gradient-to-r from-blue-500 to-purple-500'
      }
    : categories.find(cat => cat.id === activeCategory);
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedItems = categories.reduce((sum, cat) => sum + cat.items.filter(item => item.completed).length, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-muted-foreground">Loading your items...</div>
        </div>
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

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Your Items</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{totalItems} total • {completedItems} completed</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{categories.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-2 min-w-max px-1">
          {/* All Items Tab */}
          <motion.button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all duration-200 whitespace-nowrap ${
              activeCategory === 'all'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            <span className="font-medium">All Items</span>
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                activeCategory === 'all' ? 'bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200' : 'dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {totalItems}
            </Badge>
          </motion.button>
          
          {/* Category Tabs */}
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all duration-200 whitespace-nowrap ${
                activeCategory === category.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`w-3 h-3 rounded-full ${category.color}`} />
              <span className="font-medium">{category.name}</span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  activeCategory === category.id ? 'bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200' : 'dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {category.items.length}
              </Badge>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Add Item Form */}
      <AnimatePresence>
        {showAddForm && activeCategory !== 'all' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-dashed border-2 border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Input
                    placeholder={`Add item to ${activeCategoryData?.name}...`}
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNewItem()}
                    className="border-blue-200 dark:border-blue-700 focus:border-blue-400 dark:focus:border-blue-500 dark:bg-slate-800"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={addNewItem} disabled={!newItemText.trim()} className="flex-1">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Item Button */}
      {!showAddForm && (
        <motion.div whileTap={{ scale: 0.95 }}>
          {activeCategory === 'all' ? (
            <Button
              disabled
              variant="outline"
              className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 h-12 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Select a category to add items
            </Button>
          ) : (
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 h-12 text-gray-600 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          )}
        </motion.div>
      )}

      {/* Items List */}
      {activeCategoryData && (
        <div className="space-y-3">
          {activeCategoryData.items.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
              <CardContent className="py-12">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No items in {activeCategoryData.name}</p>
                  <p className="text-sm">Add items by voice recording or manually</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {activeCategoryData.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`transition-all duration-200 ${item.completed ? 'opacity-60 bg-gray-50 dark:bg-slate-800/50' : 'hover:shadow-md dark:bg-slate-800 dark:border-slate-700'}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => toggleCompleted(item.id, item.completed)}
                          className="mt-1 flex-shrink-0"
                        >
                          {item.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 hover:text-green-500 transition-colors" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {getItemTypeIcon(item.item_type)}
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getItemTypeColor(item.item_type)}`}
                            >
                              {item.item_type}
                            </Badge>
                            {/* Show category when viewing all items */}
                            {activeCategory === 'all' && (
                              <Badge variant="outline" className="text-xs">
                                {item.category_name}
                              </Badge>
                            )}
                            {item.due_date && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(item.due_date)}
                              </Badge>
                            )}
                          </div>
                          
                          <p className={`text-sm leading-relaxed ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                            {item.content}
                          </p>
                          
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                        
                        <div className="flex space-x-1 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteItem(item.id)}
                            className="h-8 w-8 p-0 hover:text-red-500 dark:hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Empty State */}
      {categories.length === 0 && (
        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
          <CardContent className="py-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Circle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-medium mb-2">No items yet</p>
              <p className="text-sm">Start by recording a voice note or add items manually</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
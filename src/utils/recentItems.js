import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_ITEMS_KEY = 'recent_items';
const MAX_RECENT = 10;

export const addToRecent = async (itemName, quantity, price) => {
  try {
    const existing = await getRecentItems();
    const newItem = {
      itemname: itemName,
      quantity: quantity || 1,
      price: price || '',
      timestamp: Date.now(),
    };

    // Remove duplicate if exists
    const filtered = existing.filter(item => 
      item.itemname.toLowerCase() !== itemName.toLowerCase()
    );

    // Add to front and limit
    const updated = [newItem, ...filtered].slice(0, MAX_RECENT);
    
    await AsyncStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error adding to recent:', error);
    return [];
  }
};

export const getRecentItems = async () => {
  try {
    const data = await AsyncStorage.getItem(RECENT_ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting recent items:', error);
    return [];
  }
};

export const clearRecentItems = async () => {
  try {
    await AsyncStorage.removeItem(RECENT_ITEMS_KEY);
  } catch (error) {
    console.error('Error clearing recent items:', error);
  }
};

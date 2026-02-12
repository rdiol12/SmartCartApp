import * as Notifications from 'expo-notifications';

export const updateBadgeCount = async (count) => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
};

export const clearBadge = async () => {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing badge:', error);
  }
};

export const calculateUnreadCount = (lists) => {
  return lists.reduce((total, list) => {
    return total + (list.item_count || 0);
  }, 0);
};

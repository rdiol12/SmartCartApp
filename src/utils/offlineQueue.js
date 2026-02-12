import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_queue';

/**
 * Queue an operation for later replay when back online.
 * @param {{ type: 'send_item'|'toggle_item'|'delete_item'|'mark_paid', data: object }} op
 */
export const queueOperation = async (op) => {
  try {
    const queue = await getQueue();
    const entry = {
      type: op.type,
      data: op.data,
      timestamp: Date.now(),
    };
    queue.push(entry);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return queue;
  } catch (error) {
    console.error('Error queuing operation:', error);
    return [];
  }
};

/**
 * Get all queued operations.
 * @returns {Promise<Array<{ type: string, data: object, timestamp: number }>>}
 */
export const getQueue = async () => {
  try {
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting offline queue:', error);
    return [];
  }
};

/**
 * Clear all queued operations.
 */
export const clearQueue = async () => {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing offline queue:', error);
  }
};

/**
 * Replay all queued operations through the provided socket, then clear the queue.
 * @param {object} socket - socket.io client instance
 */
export const processQueue = async (socket) => {
  try {
    const queue = await getQueue();
    if (queue.length === 0) return;

    for (const op of queue) {
      socket.emit(op.type, op.data);
    }

    await clearQueue();
    console.log(`Processed ${queue.length} queued operations`);
  } catch (error) {
    console.error('Error processing offline queue:', error);
  }
};

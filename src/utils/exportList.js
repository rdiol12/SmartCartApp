import * as Clipboard from 'expo-clipboard';
import { Alert, Share } from 'react-native';

export const exportListAsText = async (listName, items) => {
  const checked = items.filter(i => i.is_checked || i.paid_by);
  const unchecked = items.filter(i => !i.is_checked && !i.paid_by);

  let text = `📋 ${listName}\n`;
  text += `━━━━━━━━━━━━━━━━\n\n`;

  if (unchecked.length > 0) {
    text += `⭕ לקנות (${unchecked.length}):\n`;
    unchecked.forEach(item => {
      const qty = item.quantity > 1 ? ` x${item.quantity}` : '';
      const price = item.price ? ` - ₪${item.price}` : '';
      text += `  • ${item.itemname}${qty}${price}\n`;
    });
    text += `\n`;
  }

  if (checked.length > 0) {
    text += `✅ הושלם (${checked.length}):\n`;
    checked.forEach(item => {
      const qty = item.quantity > 1 ? ` x${item.quantity}` : '';
      const price = item.price ? ` - ₪${item.price}` : '';
      text += `  ✓ ${item.itemname}${qty}${price}\n`;
    });
    text += `\n`;
  }

  const totalPrice = items.reduce((sum, item) => {
    const p = parseFloat(item.price) || 0;
    const q = parseFloat(item.quantity) || 1;
    return sum + (p * q);
  }, 0);

  if (totalPrice > 0) {
    text += `━━━━━━━━━━━━━━━━\n`;
    text += `💰 סה"כ: ₪${totalPrice.toFixed(2)}\n`;
  }

  text += `\n📱 SmartCart`;

  return text;
};

export const shareList = async (listName, items) => {
  try {
    const text = await exportListAsText(listName, items);
    await Share.share({
      message: text,
      title: listName,
    });
  } catch (error) {
    Alert.alert('שגיאה', 'לא ניתן לשתף את הרשימה');
  }
};

export const copyToClipboard = async (listName, items) => {
  try {
    const text = await exportListAsText(listName, items);
    await Clipboard.setStringAsync(text);
    Alert.alert('הועתק!', 'הרשימה הועתקה ללוח');
  } catch (error) {
    Alert.alert('שגיאה', 'לא ניתן להעתיק את הרשימה');
  }
};

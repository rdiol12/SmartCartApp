import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';

export const generateDeliveryText = (listName, items) => {
  const unchecked = items.filter((i) => !i.is_checked && !i.paid_by);

  let text = `רשימת קניות - ${listName}\n`;
  text += '━━━━━━━━━━━━━━━━\n';
  unchecked.forEach((item) => {
    const qty = item.quantity > 1 ? ` x${item.quantity}` : '';
    text += `• ${item.itemname}${qty}\n`;
  });
  text += `\nסה"כ ${unchecked.length} פריטים`;
  return text;
};

export const copyDeliveryList = async (listName, items) => {
  const text = generateDeliveryText(listName, items);
  await Clipboard.setStringAsync(text);
  Alert.alert('הועתק!', 'הרשימה הועתקה ללוח. פתח את אתר הרשת והדבק.');
};

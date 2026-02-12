import AsyncStorage from '@react-native-async-storage/async-storage';

const TEMPLATES_KEY = 'list_templates';

export const saveTemplate = async (name, items) => {
  try {
    const templates = await getTemplates();
    const newTemplate = {
      id: Date.now(),
      name,
      items: items.map(item => ({
        itemname: item.itemname,
        quantity: item.quantity,
        price: item.price || '',
      })),
      createdAt: Date.now(),
    };
    
    const updated = [...templates, newTemplate];
    await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
    return newTemplate;
  } catch (error) {
    console.error('Error saving template:', error);
    return null;
  }
};

export const getTemplates = async () => {
  try {
    const data = await AsyncStorage.getItem(TEMPLATES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting templates:', error);
    return [];
  }
};

export const deleteTemplate = async (templateId) => {
  try {
    const templates = await getTemplates();
    const updated = templates.filter(t => t.id !== templateId);
    await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    return false;
  }
};

export const loadTemplateItems = async (templateId) => {
  try {
    const templates = await getTemplates();
    const template = templates.find(t => t.id === templateId);
    return template ? template.items : [];
  } catch (error) {
    console.error('Error loading template:', error);
    return [];
  }
};

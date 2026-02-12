// Auto-categorize items based on keywords
export const categories = [
  {
    name: 'פירות וירקות',
    icon: '🥬',
    color: '#10B981',
    keywords: ['תפוח', 'בננה', 'תפוז', 'עגבנייה', 'מלפפון', 'חסה', 'גזר', 'בצל', 'שום', 'תפוח אדמה', 'בטטה', 'אבוקדו', 'לימון', 'תות', 'אבטיח', 'מלון', 'אגס', 'אפרסק', 'ענבים', 'רוקט', 'תרד', 'כרוב', 'פלפל', 'חצילים', 'קישוא'],
  },
  {
    name: 'חלב ומוצריו',
    icon: '🥛',
    color: '#3B82F6',
    keywords: ['חלב', 'גבינה', 'יוגורט', 'שמנת', 'חמאה', 'קוטג', 'פתה', 'צהובה', 'בולגרית', 'לבן', 'מעדן', 'ביצים', 'ביצה'],
  },
  {
    name: 'בשר ודגים',
    icon: '🥩',
    color: '#EF4444',
    keywords: ['בשר', 'עוף', 'חזה עוף', 'כרעיים', 'שניצל', 'קציצות', 'נקניק', 'סלמי', 'נתחי', 'דג', 'פילה', 'סלמון', 'טונה', 'הודו', 'בקר', 'טחון'],
  },
  {
    name: 'לחם ומאפים',
    icon: '🍞',
    color: '#F59E0B',
    keywords: ['לחם', 'פיתה', 'חלה', 'בגט', 'לחמנייה', 'טוסט', 'רוגלך', 'בורקס', 'מאפה', 'עוגה', 'עוגיות', 'קרואסון', 'מיני'],
  },
  {
    name: 'משקאות',
    icon: '🥤',
    color: '#8B5CF6',
    keywords: ['מים', 'קולה', 'ספרייט', 'פאנטה', 'מיץ', 'בירה', 'יין', 'קפה', 'תה', 'משקה', 'שוקו', 'אנרגיה', 'זירו', 'תפוזים', 'סודה'],
  },
  {
    name: 'חטיפים',
    icon: '🍿',
    color: '#EC4899',
    keywords: ['ביסלי', 'במבה', 'דוריטוס', 'צ\'יפס', 'חטיף', 'שוקולד', 'מנטוס', 'סוכריות', 'ופלים', 'גומי', 'חטיף אנרגיה', 'פופקורן', 'בוטנים', 'פיצוחים'],
  },
  {
    name: 'מוצרי בסיס',
    icon: '🍝',
    color: '#F97316',
    keywords: ['פסטה', 'אורז', 'קמח', 'סוכר', 'מלח', 'שמן', 'שמנת בישול', 'רוטב', 'קטשופ', 'מיונז', 'חרדל', 'טונה', 'שימורים', 'חומוס', 'טחינה', 'קוסקוס'],
  },
  {
    name: 'ניקיון וטיפוח',
    icon: '🧴',
    color: '#06B6D4',
    keywords: ['סבון', 'שמפו', 'מרכך', 'ג\'ל', 'קרם', 'משחת שיניים', 'מברשת', 'נייר טואלט', 'מגבונים', 'חיתולים', 'אבקת כביסה', 'מרכך כביסה', 'נוזל כלים', 'ספוג', 'מטליות', 'סמרטוט'],
  },
  {
    name: 'אחר',
    icon: '📦',
    color: '#6B7280',
    keywords: [],
  },
];

export const categorizeItem = (itemName) => {
  const name = itemName.toLowerCase();
  
  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (name.includes(keyword)) {
        return category;
      }
    }
  }
  
  return categories[categories.length - 1]; // Return 'Other' category
};

export const getCategoryColor = (itemName) => {
  return categorizeItem(itemName).color;
};

export const getCategoryIcon = (itemName) => {
  return categorizeItem(itemName).icon;
};

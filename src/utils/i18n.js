import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  he: {
    // Navigation
    home: 'בית',
    lists: 'רשימות',
    store: 'חנות',
    budget: 'תקציב',
    settings: 'הגדרות',
    meals: 'ארוחות',
    pantry: 'מזווה',
    achievements: 'הישגים',

    // Common
    save: 'שמור',
    cancel: 'ביטול',
    delete: 'מחק',
    add: 'הוסף',
    edit: 'ערוך',
    close: 'סגור',
    search: 'חיפוש',
    loading: 'טוען...',
    error: 'שגיאה',
    success: 'הצלחה',
    yes: 'כן',
    no: 'לא',
    ok: 'אישור',

    // Auth
    login: 'התחברות',
    logout: 'התנתקות',
    register: 'הרשמה',
    email: 'אימייל',
    password: 'סיסמה',
    forgotPassword: 'שכחת סיסמה?',

    // Lists
    myLists: 'הרשימות שלי',
    parentLists: 'רשימות ההורים',
    newList: 'רשימה חדשה',
    addItem: 'הוסף פריט',
    requestItem: 'בקש פריט',
    noItems: 'אין פריטים ברשימה',
    itemName: 'שם פריט',
    quantity: 'כמות',
    price: 'מחיר',
    paid: 'שולם',
    checked: 'מסומן',
    unchecked: 'לא מסומן',
    all: 'הכל',
    sort: 'מיון',
    filter: 'סינון',

    // Shopping
    shoppingMode: 'מצב קניות',
    total: 'סה"כ',
    storeRoute: 'מסלול חנות',

    // Profile
    accountSettings: 'הגדרות חשבון',
    security: 'אבטחה',
    currentPassword: 'סיסמה נוכחית',
    newPassword: 'סיסמה חדשה',
    confirmPassword: 'אישור סיסמה',
    updatePassword: 'עדכן סיסמה',
    appearance: 'מראה',
    light: 'בהיר',
    dark: 'כהה',
    auto: 'אוטומטי',
    language: 'שפה',
    family: 'ניהול משפחה',
    templates: 'תבניות',
    logoutAll: 'התנתק מכל המכשירים',

    // Budget
    monthlyBudget: 'תקציב חודשי',
    estimated: 'משוער',
    spent: 'שולם',
    remaining: 'נותר',
    overBudget: 'חריגה',

    // Pantry
    myPantry: 'המזווה שלי',
    expiryTracker: 'מעקב תוקף מוצרים',
    expired: 'פג תוקף',
    expiringSoon: 'עומד לפוג',
    fresh: 'תקין',
    expiryDate: 'תאריך תפוגה',

    // Meals
    weeklyMenu: 'תפריט שבועי',
    myRecipes: 'המתכונים שלי',
    newRecipe: 'מתכון חדש',
    ingredients: 'מרכיבים',
    generateList: 'צור רשימה',
    breakfast: 'ארוחת בוקר',
    lunch: 'ארוחת צהריים',
    dinner: 'ארוחת ערב',
    snack: 'חטיף',

    // Offline
    offline: 'אין חיבור לאינטרנט',
    pendingOps: 'פעולות ממתינות',
    backOnline: 'חזרה לאינטרנט',
  },

  en: {
    home: 'Home',
    lists: 'Lists',
    store: 'Store',
    budget: 'Budget',
    settings: 'Settings',
    meals: 'Meals',
    pantry: 'Pantry',
    achievements: 'Achievements',

    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    add: 'Add',
    edit: 'Edit',
    close: 'Close',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',

    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',

    myLists: 'My Lists',
    parentLists: "Parents' Lists",
    newList: 'New List',
    addItem: 'Add Item',
    requestItem: 'Request Item',
    noItems: 'No items in list',
    itemName: 'Item name',
    quantity: 'Quantity',
    price: 'Price',
    paid: 'Paid',
    checked: 'Checked',
    unchecked: 'Unchecked',
    all: 'All',
    sort: 'Sort',
    filter: 'Filter',

    shoppingMode: 'Shopping Mode',
    total: 'Total',
    storeRoute: 'Store Route',

    accountSettings: 'Account Settings',
    security: 'Security',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    updatePassword: 'Update Password',
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
    language: 'Language',
    family: 'Family Management',
    templates: 'Templates',
    logoutAll: 'Logout All Devices',

    monthlyBudget: 'Monthly Budget',
    estimated: 'Estimated',
    spent: 'Spent',
    remaining: 'Remaining',
    overBudget: 'Over Budget',

    myPantry: 'My Pantry',
    expiryTracker: 'Expiry Tracker',
    expired: 'Expired',
    expiringSoon: 'Expiring Soon',
    fresh: 'Fresh',
    expiryDate: 'Expiry Date',

    weeklyMenu: 'Weekly Menu',
    myRecipes: 'My Recipes',
    newRecipe: 'New Recipe',
    ingredients: 'Ingredients',
    generateList: 'Generate List',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',

    offline: 'No internet connection',
    pendingOps: 'pending operations',
    backOnline: 'Back online',
  },

  ar: {
    home: 'الرئيسية',
    lists: 'القوائم',
    store: 'المتجر',
    budget: 'الميزانية',
    settings: 'الإعدادات',
    meals: 'الوجبات',
    pantry: 'المخزن',
    achievements: 'الإنجازات',

    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    add: 'إضافة',
    edit: 'تعديل',
    close: 'إغلاق',
    search: 'بحث',
    loading: '...جاري التحميل',
    error: 'خطأ',
    success: 'نجاح',
    yes: 'نعم',
    no: 'لا',
    ok: 'موافق',

    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    register: 'التسجيل',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',

    myLists: 'قوائمي',
    parentLists: 'قوائم الوالدين',
    newList: 'قائمة جديدة',
    addItem: 'إضافة عنصر',
    requestItem: 'طلب عنصر',
    noItems: 'لا توجد عناصر',
    itemName: 'اسم العنصر',
    quantity: 'الكمية',
    price: 'السعر',
    paid: 'مدفوع',
    checked: 'محدد',
    unchecked: 'غير محدد',
    all: 'الكل',
    sort: 'ترتيب',
    filter: 'تصفية',

    shoppingMode: 'وضع التسوق',
    total: 'المجموع',
    storeRoute: 'مسار المتجر',

    accountSettings: 'إعدادات الحساب',
    security: 'الأمان',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    updatePassword: 'تحديث كلمة المرور',
    appearance: 'المظهر',
    light: 'فاتح',
    dark: 'داكن',
    auto: 'تلقائي',
    language: 'اللغة',
    family: 'إدارة العائلة',
    templates: 'القوالب',
    logoutAll: 'تسجيل الخروج من جميع الأجهزة',

    monthlyBudget: 'الميزانية الشهرية',
    estimated: 'تقديري',
    spent: 'مدفوع',
    remaining: 'متبقي',
    overBudget: 'تجاوز الميزانية',

    myPantry: 'مخزني',
    expiryTracker: 'تتبع الصلاحية',
    expired: 'منتهي الصلاحية',
    expiringSoon: 'ينتهي قريبًا',
    fresh: 'سليم',
    expiryDate: 'تاريخ الانتهاء',

    weeklyMenu: 'قائمة أسبوعية',
    myRecipes: 'وصفاتي',
    newRecipe: 'وصفة جديدة',
    ingredients: 'المكونات',
    generateList: 'إنشاء قائمة',
    breakfast: 'فطور',
    lunch: 'غداء',
    dinner: 'عشاء',
    snack: 'وجبة خفيفة',

    offline: 'لا يوجد اتصال بالإنترنت',
    pendingOps: 'عمليات معلقة',
    backOnline: 'تمت العودة للاتصال',
  },

  ru: {
    home: 'Главная',
    lists: 'Списки',
    store: 'Магазин',
    budget: 'Бюджет',
    settings: 'Настройки',
    meals: 'Питание',
    pantry: 'Кладовая',
    achievements: 'Достижения',

    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    add: 'Добавить',
    edit: 'Изменить',
    close: 'Закрыть',
    search: 'Поиск',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успех',
    yes: 'Да',
    no: 'Нет',
    ok: 'ОК',

    login: 'Вход',
    logout: 'Выход',
    register: 'Регистрация',
    email: 'Эл. почта',
    password: 'Пароль',
    forgotPassword: 'Забыли пароль?',

    myLists: 'Мои списки',
    parentLists: 'Списки родителей',
    newList: 'Новый список',
    addItem: 'Добавить товар',
    requestItem: 'Запросить товар',
    noItems: 'Нет товаров',
    itemName: 'Название',
    quantity: 'Количество',
    price: 'Цена',
    paid: 'Оплачено',
    checked: 'Отмечено',
    unchecked: 'Не отмечено',
    all: 'Все',
    sort: 'Сортировка',
    filter: 'Фильтр',

    shoppingMode: 'Режим покупок',
    total: 'Итого',
    storeRoute: 'Маршрут',

    accountSettings: 'Настройки аккаунта',
    security: 'Безопасность',
    currentPassword: 'Текущий пароль',
    newPassword: 'Новый пароль',
    confirmPassword: 'Подтверждение пароля',
    updatePassword: 'Обновить пароль',
    appearance: 'Оформление',
    light: 'Светлая',
    dark: 'Тёмная',
    auto: 'Авто',
    language: 'Язык',
    family: 'Управление семьёй',
    templates: 'Шаблоны',
    logoutAll: 'Выйти на всех устройствах',

    monthlyBudget: 'Месячный бюджет',
    estimated: 'Примерно',
    spent: 'Потрачено',
    remaining: 'Осталось',
    overBudget: 'Превышение',

    myPantry: 'Моя кладовая',
    expiryTracker: 'Отслеживание срока',
    expired: 'Просрочено',
    expiringSoon: 'Скоро истечёт',
    fresh: 'Свежее',
    expiryDate: 'Срок годности',

    weeklyMenu: 'Меню на неделю',
    myRecipes: 'Мои рецепты',
    newRecipe: 'Новый рецепт',
    ingredients: 'Ингредиенты',
    generateList: 'Создать список',
    breakfast: 'Завтрак',
    lunch: 'Обед',
    dinner: 'Ужин',
    snack: 'Перекус',

    offline: 'Нет подключения к интернету',
    pendingOps: 'ожидающих операций',
    backOnline: 'Подключение восстановлено',
  },
};

let currentLang = 'he';

export function t(key) {
  return translations[currentLang]?.[key] || translations.he[key] || key;
}

export function getCurrentLang() {
  return currentLang;
}

export function setLang(lang) {
  currentLang = lang;
}

export async function loadLang() {
  try {
    const saved = await AsyncStorage.getItem('app_language');
    if (saved && translations[saved]) {
      currentLang = saved;
    }
  } catch (err) {
    // default to Hebrew
  }
}

export async function saveLang(lang) {
  currentLang = lang;
  await AsyncStorage.setItem('app_language', lang);
}

export const LANGUAGES = [
  { code: 'he', label: 'עברית', nativeLabel: 'עברית' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ar', label: 'العربية', nativeLabel: 'العربية' },
  { code: 'ru', label: 'Русский', nativeLabel: 'Русский' },
];

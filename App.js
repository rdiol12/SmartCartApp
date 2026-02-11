import React, { useContext } from 'react';
import { I18nManager, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import NotificationBell from './src/components/NotificationBell';
import { colors } from './src/theme';

// Auth screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Main screens
import HomeScreen from './src/screens/HomeScreen';
import MyListsScreen from './src/screens/MyListsScreen';
import ListDetailScreen from './src/screens/ListDetailScreen';
import StoreScreen from './src/screens/StoreScreen';
import ProductScreen from './src/screens/ProductScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FamilyScreen from './src/screens/FamilyScreen';
import TemplatesScreen from './src/screens/TemplatesScreen';

// Force RTL for Hebrew (only when not already RTL to avoid iOS crash)
I18nManager.allowRTL(true);
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}

const AuthStack = createNativeStackNavigator();
const ListsStack = createNativeStackNavigator();
const StoreStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function ListsNavigator() {
  const { isLinkedChild } = useContext(AuthContext);
  return (
    <ListsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerTitleAlign: 'center',
      }}
    >
      <ListsStack.Screen
        name="MyLists"
        component={MyListsScreen}
        options={{ title: isLinkedChild ? 'רשימות ההורים' : 'הרשימות שלי' }}
      />
      <ListsStack.Screen
        name="ListDetail"
        component={ListDetailScreen}
        options={({ route }) => ({ title: route.params?.listName || 'רשימה' })}
      />
    </ListsStack.Navigator>
  );
}

function StoreNavigator() {
  return (
    <StoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerTitleAlign: 'center',
      }}
    >
      <StoreStack.Screen name="StoreMain" component={StoreScreen} options={{ title: 'חנות' }} />
      <StoreStack.Screen
        name="Product"
        component={ProductScreen}
        options={{ title: 'פרטי מוצר' }}
      />
    </StoreStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerTitleAlign: 'center',
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'הגדרות' }} />
      <ProfileStack.Screen name="Family" component={FamilyScreen} options={{ title: 'ניהול משפחה' }} />
      <ProfileStack.Screen name="Templates" component={TemplatesScreen} options={{ title: 'תבניות' }} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  const { isLinkedChild } = useContext(AuthContext);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'ListsTab') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'StoreTab') iconName = focused ? 'storefront' : 'storefront-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{
        title: 'בית',
        headerShown: true,
        headerTitle: 'SmartCart',
        headerTitleStyle: { fontWeight: '800', color: colors.primary, fontSize: 18 },
        headerStyle: { backgroundColor: colors.surface },
        headerRight: () => (!isLinkedChild ? <NotificationBell /> : null),
        headerRightContainerStyle: { paddingRight: 16 },
      }} />
      <Tab.Screen name="ListsTab" component={ListsNavigator} options={{ title: 'רשימות' }} />
      <Tab.Screen name="StoreTab" component={StoreNavigator} options={{ title: 'חנות' }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ title: 'הגדרות' }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

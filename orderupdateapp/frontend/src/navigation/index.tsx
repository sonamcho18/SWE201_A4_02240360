/**
 * navigation/index.tsx
 * App-wide navigation setup using React Navigation.
 * Exports `navigationRef` so App.tsx can navigate from notification tap handlers.
 */

import React from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator }  from '@react-navigation/native-stack';
import { createBottomTabNavigator }    from '@react-navigation/bottom-tabs';
import { Ionicons }                    from '@expo/vector-icons';

import OrdersScreen      from '../screens/OrdersScreen';
import PlaceOrderScreen  from '../screens/PlaceOrderScreen';
import AdminScreen       from '../screens/AdminScreen';
import SettingsScreen    from '../screens/SettingsScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import { Colors }        from '../constants';
import { RootStackParamList, TabParamList } from '../types';

// Exported so App.tsx can call navigationRef.current?.navigate(...)
// when the user taps a push notification
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, string> = {
  Orders:     'bag-outline',
  PlaceOrder: 'add-circle-outline',
  Admin:      'construct-outline',
  Settings:   'notifications-outline',
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle:      { backgroundColor: Colors.surface },
        headerTitleStyle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 17 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor:  Colors.border,
          borderTopWidth:  1,
          height:          62,
          paddingBottom:   8,
          paddingTop:      6,
        },
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle:        { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={(TAB_ICONS[route.name] || 'ellipse-outline') as any}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Orders"     component={OrdersScreen}     options={{ title: 'My Orders',    tabBarLabel: 'Orders' }} />
      <Tab.Screen name="PlaceOrder" component={PlaceOrderScreen} options={{ title: 'Place Order',  tabBarLabel: 'Order'  }} />
      <Tab.Screen name="Admin"      component={AdminScreen}      options={{ title: 'Admin Panel',  tabBarLabel: 'Admin'  }} />
      <Tab.Screen name="Settings"   component={SettingsScreen}   options={{ title: 'Notifications', tabBarLabel: 'Alerts' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerStyle:      { backgroundColor: Colors.surface },
          headerTitleStyle: { color: Colors.textPrimary, fontWeight: '700' },
          headerTintColor:  Colors.primary,
          headerShadowVisible: false,
          contentStyle:     { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="MainTabs"    component={TabNavigator}      options={{ headerShown: false }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Detail' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

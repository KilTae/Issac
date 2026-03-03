// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/Login';
import AccountScreen from './screens/Account';

export type RootStackParamList = {
  Login: undefined;
  Account: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: '로그인' }} />
        <Stack.Screen name="Account" component={AccountScreen} options={{ title: '계좌 조회' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
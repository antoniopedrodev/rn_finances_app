import React from 'react';
import { GestureHandlerRootView} from 'react-native-gesture-handler'
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';
import { StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import 'react-native-gesture-handler';
import theme from './src/global/styles/theme'
import { useAuth } from './src/hooks/auth';
import { AuthProvider } from './src/hooks/auth';
import { Routes } from './src/routes';


export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  });

  const { user, userStorageLoading } = useAuth();
  console.log(user)
  
  if (fontsLoaded || userStorageLoading) {
    SplashScreen.hideAsync();
  } else {
    return null;
  }

  

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ThemeProvider theme={theme}>
        <StatusBar barStyle='light-content'/>
        <AuthProvider>
          <Routes />
          {/* <NavigationContainer>
            {user ? <AppRoutes /> : <AuthRoutes />}
          </NavigationContainer> */}
        </AuthProvider>
        
    </ThemeProvider>
    </GestureHandlerRootView>
    
    
  );
}

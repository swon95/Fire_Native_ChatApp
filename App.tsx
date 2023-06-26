/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useCallback, useContext} from 'react';
import {RootStackParamList} from './src/types';
import SignupScreen from './src/SignupScreen/SignupScreen';
import AuthProvider from './src/components/AuthProvider';
import SigninScreen from './src/SigninScreen/SigninScreen';
import AuthContext from './src/components/AuthContext';
import HomeScreen from './src/HomeScreen/HomeScreen';
import LoadingScreen from './src/LoadingScreen/LoadingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Screens = () => {
  const {user, processingSignin, processingSignup, initialized} =
    useContext(AuthContext);
  // useCallback => 메모이제이션된 함수를 생성하여 렌더링 될 때마다 새로운 함수를 생성하지 않아 성능을 최적화함
  const renderRootStack = useCallback(() => {
    // fbUser 를 불러오기 전 약간의 텀을 로딩 컴포넌트로 시각적 효과 대체
    if (!initialized) {
      return <Stack.Screen name="Loading" component={LoadingScreen} />;
    }
    // user 가 빈 값이 아니고, 로그인, 회원가입이 진행되는 상태가 아닐경우 => Home Page 를 보여줌 => 로그인이 완료된 상태
    if (user != null && !processingSignin && !processingSignup) {
      // 로그인이 되었다면 보여줄 Stack
      return <Stack.Screen name="Home" component={HomeScreen} />;
    }
    // 그게 아니라면 => 로그아웃

    return (
      <>
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Signin" component={SigninScreen} />
      </>
    );
    // dependencies 에는 Callback 함수가 의존하는 값의 배열을 넣음.
    // 배열의 값이 변경될 때만 콜백함수를 생성
    // 만약, 빈 배열일 경우 컴포넌트가 처음 렌더링 될 때만 새로운 콜백함수를 생성
  }, [user, processingSignin, processingSignup]);
  return (
    <NavigationContainer>
      {/* 공통된 header 를 구성하기 위해 shown -> false */}
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {renderRootStack()}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Screens />
    </AuthProvider>
  );
};

export default App;

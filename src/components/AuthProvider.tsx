// AuthContext 를 사용하기 위한 AuthProvider

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Collections, User} from '../types';
import AuthContext from './AuthContext';

const AuthProvider = ({children}: {children: React.ReactNode}) => {
  // 유저의 변경을 처리해주기 위한 state
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  // signup 의 진행여부에 대한 state
  const [processingSignup, setProcessingSignup] = useState(false);
  const [processingSignin, setProcessingSignin] = useState(false);

  useEffect(() => {
    // Firebase에서 반환되는 User 객체의 타입은 firebase.User이므로,
    // firebaseUser 인자의 타입을 firebase.User | null로 명시
    const unsubsribe = auth().onUserChanged(async fbUser => {
      // 로그인의 유무를 콘솔창에서 확인하기 위해
      console.log('fbUser', fbUser);

      // 로그인 된 경우 == null
      if (fbUser != null) {
        setUser({
          userId: fbUser.uid,
          email: fbUser.email ?? '',
          name: fbUser.displayName ?? '',
        });
        // 로그인이 되지 않은경우 == not null
      } else {
        setUser(null);
      }
      // 초기에 로그인 유무를 확인했으므로 true
      setInitialized(true);
    });
    return () => {
      // provider 가 unmount 될때 실행
      unsubsribe();
    };
  }, []);

  // firebase 에 회원가입 정보 넘기기
  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      // signup 이 실행되면 setProcessingSignup state 를 true 로 변경
      setProcessingSignup(true);
      try {
        // user 의 이름을 currentUser 로 변경
        const {user: currentUser} = await auth().createUserWithEmailAndPassword(
          email,
          password,
        );
        // displayName 을 name 으로 변경
        await currentUser.updateProfile({displayName: name});

        // firebase DB 에 저장
        await firestore()
          // USERS collection 내부에 저장
          .collection(Collections.USERS)
          // 문서 생성
          .doc(currentUser.uid)
          .set({
            userId: currentUser.uid,
            email,
            name,
          });
        //   // 코드가 실행에 성공해도 실패해도 false
        // } catch (error) {
        //   console.log(error);
      } finally {
        // 회원가입이 끝나면 false 로 종료
        setProcessingSignup(false);
      }
    },
    [],
  );

  const signin = useCallback(async (email: string, password: string) => {
    // await 이 실패 할 경우 false 로 변경되지 않으므로 try finally 로 감싸줌
    try {
      setProcessingSignin(true);
      await auth().signInWithEmailAndPassword(email, password);
    } finally {
      // 에러의 유무와 관계없이 로그인이 끝나면 => false
      setProcessingSignin(false);
    }
  }, []);

  // 자식 컴포넌트들에게 뿌려주기 위해 Provider
  const value = useMemo(() => {
    return {
      initialized,
      user,
      signup,
      processingSignup,
      signin,
      processingSignin,
    };
  }, [initialized, user, signup, processingSignup, signin, processingSignin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

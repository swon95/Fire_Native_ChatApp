// AuthContext 를 사용하기 위한 AuthProvider

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {Collections, User} from '../types';
import AuthContext from './AuthContext';
import _ from 'lodash';

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
          // user 에 updateProfileImage 함수 실행
          // => user 객체 정보를 불러와 photoURL 이 있는 경우 setUser 객체에 profileUrl 로 가져오기
          // props -> homeScreen
          profileUrl: fbUser.photoURL ?? '',
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

  const updateProfileImage = useCallback(
    async (filepath: string) => {
      // 이미지 업로드 => firebase.storage
      const filename = _.last(filepath.split('/')); // / 기호로 구분, lodash 의 last 메소드를 사용하여 경로 최 하단(마지막)의 아이템을 가져옴

      // 잘못된경우
      if (user == null) {
        throw new Error('User is undefined');
      }
      // filename 의 값이 null 일 경우 Error 메세지 출력
      if (filename == null) {
        throw new Error('filename is undefined');
      }
      // 프로필에 이미지 등록 => users / userId / 경로에 filename 생성
      const storageFilepath = `users/${user.userId}/${filename}`;
      // ref == path , putFile == original filepath
      await storage().ref(storageFilepath).putFile(filepath);
      // storage 에서 download 가능한 URL 가져오기
      const url = await storage().ref(storageFilepath).getDownloadURL();
      // firebase user 에 등록 == update
      await auth().currentUser?.updateProfile({photoURL: url});
      // DB 에 저장
      await firestore().collection(Collections.USERS).doc(user.userId).update({
        profileUrl: url,
      });
    },
    [user],
  );

  // 자식 컴포넌트들에게 뿌려주기 위해 Provider
  const value = useMemo(() => {
    return {
      initialized,
      user,
      signup,
      processingSignup,
      signin,
      processingSignin,
      updateProfileImage,
    };
  }, [
    initialized,
    user,
    signup,
    processingSignup,
    signin,
    processingSignin,
    updateProfileImage,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

// Context Api == 명시적으로 컴포넌트에 props 를 전달하지 않아도 자식 컴포넌트들이 값을 공유할 수 있는 api
import { createContext } from 'react';
import { User } from '../types';

// 타입 명시
export interface AuthContextProp {
  // 로그인의 유무를 확인하는 initialized
  initialized: boolean;
  // User 타입이 없기때문에 types.ts 에서 선언해줌
  user: User | null;
  // 회원가입
  signup: (email: string, password: string, name: string) => Promise<void>;
  // signup 이 Promise(비동기 함수) 이므로 processingSignup 이 진행중일경우 true 끝날 경우 false
  processingSignup: boolean;
  signin: (email: string, password: string) => Promise<void>;
  // 로그인이 진행되는동안 상태를 표시해주기 위한 processingSignin => 진행중일경우 true 끝날 경우 false
  processingSignin: boolean;
}

const AuthContext = createContext<AuthContextProp>({
  initialized: false,
  user: null,
  signup: async () => {},
  processingSignup: false,
  signin: async () => {},
  processingSignin: false,
});

export default AuthContext;

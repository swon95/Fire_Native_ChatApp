import React, { useMemo, useState, useCallback, useContext } from 'react';
import validator from 'validator';
import Screen from '../components/Screen';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Colors from '../modules/Colors';
import AuthContext from '../components/AuthContext';

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [name, setName] = useState('');
  const { processingSignup, signup } = useContext(AuthContext);

  // useMemo == 연산 결과를 저장하여 값이 변경되지 않을경우 이전 결과를 재사용하는 Hooks
  const emailErrorText = useMemo(() => {
    // email 이 입력되지 않았을경우 return
    if (email.length === 0) {
      return '이메일을 입력해주세요.';
    }
    // 이메일이 올바르게 작성되었는지 유효성검사를 위해 vaildator -> 패키지
    // validator 에서 제공하는 isEmail 을 사용해 이메일이 일치하지 않을 경우 return 문 실행
    if (!validator.isEmail(email)) {
      return '올바른 이메일이 아닙니다.';
    }
    // 에러가 없는경우 null return
    return null;
    // Dependencies -> email
  }, [email]);

  // 비밀번호를 체크하는 함수
  const passwordErrorText = useMemo(() => {
    // 비밀번호가 입력되지 않았을경우 return
    if (password.length === 0) {
      return '비밀번호를 입력해주세요.';
    }
    // 입력한 비밀번호가 6자 이하일 경우 return
    if (password.length < 6) {
      return '비밀번호는 6 자리 이상이어야 합니다.';
    }
    // 입력한 비밀번호가 confirmedPassword 와 일치하지 않을 경우 return
    if (password !== confirmedPassword) {
      return '비밀번호가 일치하지 않습니다.';
    }
    // 에러가 없을 경우 null
    return null;
    // Dependencies(의존) -> password, confirmedPassword
  }, [password, confirmedPassword]);

  // 비밀번호 확인을 체크하는 함수
  const confirmedPasswordErrorText = useMemo(() => {
    if (confirmedPassword.length === 0) {
      return '비밀번호를 입력해주세요.';
    }
    if (confirmedPassword.length < 6) {
      return '비밀번호는 6 자리 이상이어야 합니다.';
    }
    if (password !== confirmedPassword) {
      return '비밀번호가 일치하지 않습니다.';
    }
  }, [password, confirmedPassword]);

  // 이름을 체크하는 함수
  const nameErrorText = useMemo(() => {
    if (name.length === 0) {
      return '이름을 입력해주세요.';
    }
    return null;
  }, [name.length]);

  // Text input 을 입력받을 경우 setEmail 에 넣어주는 함수
  const onChangeEmailText = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const onChangePasswordText = useCallback((text: string) => {
    setPassword(text);
  }, []);

  const onChangeConfirmedPasswordText = useCallback((text: string) => {
    setConfirmedPassword(text);
  }, []);

  const onChangeNameText = useCallback((text: string) => {
    setName(text);
  }, []);

  // true 일 경우 => signupButtonStyle
  const signupButtonEnabled = useMemo(() => {
    return (
      emailErrorText == null &&
      passwordErrorText == null &&
      confirmedPasswordErrorText == null &&
      nameErrorText == null
    );
  }, [
    emailErrorText,
    passwordErrorText,
    confirmedPasswordErrorText,
    nameErrorText,
  ]);

  const signupButtonStyle = useMemo(() => {
    // signupButtonEnabled 가 true 일 경우 return
    if (signupButtonEnabled) {
      return styles.signupButton;
    }
    // false일 경우 signupButton style 에 disabledSignupButton style 덮어쓰기
    return [styles.signupButton, styles.disabledSignupButton];
  }, [signupButtonEnabled]);

  // 버튼을 눌렀을때의 callback
  const onPressSignupButton = useCallback(async () => {
    // 에러가 발생할 경우를 대비하여 try catch
    try {
      await signup(email, password, name);
    } catch (error: any) {
      // 에러가 있을 경우 alert
      Alert.alert(error.message);
    }
  }, [signup, email, password, name]);

  const onPressSigninButton = useCallback(() => {}, []);

  return (
    <Screen title="회원가입">
      {/* 로딩 이펙트 ActivityIndicator 추가  */}
      {processingSignup ? (
        <View style={styles.signingContainer}>
          <ActivityIndicator />
        </View>
      ) : (
        // 그게 아니라면, 아래 로직 실행
        <ScrollView style={styles.container}>
          <View style={styles.section}>
            <Text style={styles.title}>이메일</Text>
            <TextInput
              value={email}
              style={styles.input}
              // TextInput 의 값이 바뀔때마다 callback 을 받음
              onChangeText={onChangeEmailText}
            />
            {/* emailErrorText 가 있을때만 Text 출력 */}
            {emailErrorText && (
              <Text style={styles.errorText}>{emailErrorText}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>비밀번호</Text>
            <TextInput
              value={password}
              style={styles.input}
              // 입력한 비밀번호 숨김처리
              secureTextEntry
              onChangeText={onChangePasswordText}
            />
            {passwordErrorText && (
              <Text style={styles.errorText}>{passwordErrorText}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>비밀번호 확인</Text>
            <TextInput
              value={confirmedPassword}
              style={styles.input}
              // 입력한 비밀번호 숨김처리
              secureTextEntry
              onChangeText={onChangeConfirmedPasswordText}
            />
            {confirmedPasswordErrorText && (
              <Text style={styles.errorText}>{confirmedPasswordErrorText}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>이름</Text>
            <TextInput
              value={name}
              style={styles.input}
              // 입력한 비밀번호 숨김처리
              // secureTextEntry
              onChangeText={onChangeNameText}
            />
            {nameErrorText && (
              <Text style={styles.errorText}>{nameErrorText}</Text>
            )}
          </View>

          {/* button */}
          <View>
            <TouchableOpacity
              style={signupButtonStyle}
              onPress={onPressSignupButton}>
              <Text style={styles.signupButtonText}>회원 가입</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signinTextButton}
              onPress={onPressSigninButton}>
              <Text style={styles.signinButtonText}>
                이미 계정이 있으신가요 ?
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </Screen>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    marginTop: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    fontSize: 16,
  },
  errorText: {
    fontSize: 13,
    // 이메일 형식에 맞게 입력하지 않았을 경우 Red Text
    color: Colors.RED,
    marginTop: 4,
  },
  // button
  signupButton: {
    backgroundColor: Colors.BLACK,
    borderRadius: 10,
    alignItems: 'center',
    padding: 20,
  },
  signupButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledSignupButton: {
    backgroundColor: Colors.GRAY,
  },
  signinTextButton: {
    marginTop: 5,
    alignItems: 'center',
    padding: 10,
  },
  signinButtonText: {
    fontSize: 16,
    color: Colors.BLACK,
  },
  signingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

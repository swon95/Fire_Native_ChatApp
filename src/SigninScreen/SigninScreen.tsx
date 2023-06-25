import React, {useCallback, useMemo, useState, useContext} from 'react';
import validator from 'validator';
import Screen from '../components/Screen';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Colors from '../modules/Colors';
import AuthContext from '../components/AuthContext';

const SigninScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // AuthProvider 에서 정의한 signin, processingSign 가져오기
  const {signin, processingSignin} = useContext(AuthContext);

  // email 검증
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
    // 에러가 없을 경우 null
    return null;
    // Dependencies(의존) -> password
  }, [password]);

  // Text input 을 입력받을 경우 setEmail 에 넣어주는 함수
  const onChangeEmailText = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const onChangePasswordText = useCallback((text: string) => {
    setPassword(text);
  }, []);

  // true 일 경우 => signinButtonStyle
  const signinButtonEnabled = useMemo(() => {
    return emailErrorText == null && passwordErrorText == null;
  }, [emailErrorText, passwordErrorText]);

  const signinButtonStyle = useMemo(() => {
    // signinButtonEnabled 가 true 일 경우 return
    if (signinButtonEnabled) {
      return styles.signinButton;
    }
    // false일 경우 signinButton style 에 disabledSigninButton style 덮어쓰기
    return [styles.signinButton, styles.disabledSigninButton];
  }, [signinButtonEnabled]);

  const onPressSigninButton = useCallback(async () => {
    try {
      await signin(email, password);
    } catch (error: any) {
      Alert.alert(error.message);
    }
  }, [signin, email, password]);

  return (
    <Screen title="로그인">
      <View style={styles.container}>
        {processingSignin ? (
          <View style={styles.signingContainer}>
            {/* 로딩스피너 => ActivityIndicator */}
            <ActivityIndicator />
          </View>
        ) : (
          // 부모 컴포넌트로 View 를 사용해도 되지만, <></> Fragment 를 사용해도 됨
          <View>
            <View style={styles.section}>
              <Text style={styles.title}>이메일</Text>
              <TextInput
                value={email}
                style={styles.input}
                onChangeText={onChangeEmailText}></TextInput>
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

            {/* button */}
            <View>
              <TouchableOpacity
                style={signinButtonStyle}
                onPress={onPressSigninButton}
                // 에러가 있을 경우 버튼 비활성화를 위해 disabled
                disabled={!signinButtonEnabled}>
                <Text style={styles.signinButtonText}>로그인</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
};

export default SigninScreen;

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
    color: Colors.BLACK,
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
  signinButton: {
    backgroundColor: Colors.BLACK,
    borderRadius: 10,
    alignItems: 'center',
    padding: 20,
  },
  signinButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledSigninButton: {
    backgroundColor: Colors.GRAY,
  },
  signingContainer: {
    flex: 1,
    // 세로축 가운데 정렬
    justifyContent: 'center',
    // 가로축 가운데 정렬
    alignItems: 'center',
  },
});

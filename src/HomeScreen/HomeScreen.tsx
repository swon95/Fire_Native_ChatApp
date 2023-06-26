import React, {useContext, useCallback} from 'react';
import Screen from '../components/Screen';
import auth from '@react-native-firebase/auth';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import AuthContext from '../components/AuthContext';
import Colors from '../modules/Colors';

const HomeScreen = () => {
  // 현재 user == null
  // 직관적으로 확인하기 위해 user 를 me 라는 변수에 담아줌 => 객체분해할당 (destructuring assignment)
  const {user: me} = useContext(AuthContext);
  // me 에 값이 비어있다면 잘못된것이므로 null return
  if (me == null) {
    return null;
  }

  const onPressLogout = useCallback(() => {
    // auth 에서 제공하는 signOut 함수
    auth().signOut();
  }, []);
  return (
    <Screen title="홈">
      <View style={styles.container}>
        <View>
          <Text style={styles.SectionTitle}>나의 정보</Text>
          <View style={styles.userSectionContent}>
            <View style={styles.myProfile}>
              <Text style={styles.myNameText}>{me.name}</Text>
              <Text style={styles.myEmailText}>{me.email}</Text>
            </View>
            <TouchableOpacity onPress={onPressLogout}>
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Screen>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'blue',
    padding: 20,
  },
  SectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.BLACK,
  },
  userSectionContent: {
    backgroundColor: Colors.BLACK,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  myProfile: {
    // backgroundColor: 'red',
    flex: 1,
  },
  myNameText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  myEmailText: {
    marginTop: 4,
    color: Colors.WHITE,
    fontSize: 14,
  },
  logoutText: {
    color: Colors.WHITE,
    fontSize: 14,
  },
});

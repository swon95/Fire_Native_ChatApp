import React, {useContext, useCallback, useState, useEffect} from 'react';
import Screen from '../components/Screen';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import AuthContext from '../components/AuthContext';
import Colors from '../modules/Colors';
import {Collections, User} from '../types';

const HomeScreen = () => {
  // firestore 에 저장되어있는 다른 사용자의 정보를 가져오는 State
  const [loadingUsers, setLoadingUsers] = useState(false);
  // 저장된 사용자들의 정보를 배열로 담아두는 State
  const [users, setUsers] = useState<User[]>([]);
  console.log(users);
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

  const otherUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      // firestore 의 users Collection 에 담긴 모든 문서를 가져오기
      const snapshot = await firestore().collection(Collections.USERS).get();
      // 각각의 문서
      setUsers(
        snapshot.docs
          .map(doc => doc.data() as User)
          // filter 함수를 통해 들어온 유저의 아이디가 내 정보와 다른 것만 화면에 출력되게 조건 부여
          .filter(u => u.userId !== me?.userId),
      );
    } finally {
      setLoadingUsers(false);
    }
  }, [me?.userId]);

  useEffect(() => {
    otherUsers();
  }, [otherUsers]);

  const renderLoading = useCallback(() => {
    return (
      <View style={styles.loadingContainer}>
        {/* 자체제공 로딩 컴포넌트 */}
        <ActivityIndicator />
      </View>
    );
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
        <View style={styles.userListSection}>
          {/* loadingUsers 가 있다면 renderLoading 함수를 불러오고, 그게 아니라면 FlatList 출력 */}
          {loadingUsers ? (
            renderLoading()
          ) : (
            <>
              <Text style={styles.SectionTitle}>
                다른 사용자와 대화해보세요 !
              </Text>
              <FlatList
                style={styles.userList}
                // data={[]} // 데이터(다른 유저정보)가 비어있는경우
                data={users}
                // renderItem 함수가 없으면 FlatList 는 에러 발생
                // renderItem => 각각의 Item 을 그려주는 함수
                // item 을 Object 로 불러오면 data 의 element 가 순차대로 들어옴
                renderItem={(
                  {item: user}, // item 의 이름을 user 로 변경
                ) => (
                  // 채팅창으로 이동하기 위해 TouchableOpacity
                  <TouchableOpacity
                    style={styles.userListItem}
                    onPress={() => {}}>
                    <Text style={styles.otherNameText}>{user.name}</Text>
                    <Text style={styles.otherEmailText}>{user.email}</Text>
                  </TouchableOpacity>
                )}
                // FlatList 간의 간격을 적용하는 메소드
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                // 데이터가 비어있을 경우 출력하는 메소드
                ListEmptyComponent={() => {
                  return (
                    <Text style={styles.emptyText}>사용자가 없습니다.</Text>
                  );
                }}
              />
            </>
          )}
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
  userListSection: {
    flex: 1,
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userList: {
    // backgroundColor: 'red'
    flex: 1,
  },
  userListItem: {
    backgroundColor: Colors.RIGHT_GRAY,
    borderRadius: 12,
    padding: 20,
  },
  otherNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  otherEmailText: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.BLACK,
  },
  separator: {
    height: 10,
  },
  emptyText: {
    color: Colors.BLACK,
  },
});
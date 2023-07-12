import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Colors from '../modules/Colors';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 48,
    flexDirection: 'row',
  },
  left: {
    flex: 1,
    // backgroundColor: 'red',
    justifyContent: 'center',
  },
  center: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  right: {
    flex: 1,
    // backgroundColor: 'red',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  body: {
    flex: 1,
  },
  backButtonText: {
    fontSize: 12,
    color: Colors.BLACK,
  },
  backButtonIcon: {
    color: Colors.BLACK,
    fontSize: 20,
    marginLeft: 20,
  },
});

interface ScreenProps {
  // header 의 title 을 입력받을 수 있게
  title?: string;
  // screen 안에 자식컴포넌트들을 그려주기 위해
  children?: React.ReactNode;
}

const Screen = ({title, children}: ScreenProps) => {
  // goBack 메서드를 통해 이전화면으로 돌아가기
  // canGoBack 메서드를 통해 이전화면으로 돌아갈 수 있는지의 유무를 판별
  const {goBack, canGoBack} = useNavigation();

  const onPressBackButton = useCallback(() => {
    goBack();
  }, [goBack]);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.left}>
          {/* 회원가입 페이지에서는 더 이상 뒤로 갈 화면이 없기 때문에 Back 버튼이 보이지 않음 ! */}
          {canGoBack() && (
            <TouchableOpacity onPress={onPressBackButton}>
              {/* <Text style={styles.backButtonText}>{'Back'}</Text> */}
              <Icon style={styles.backButtonIcon} name="arrow-back" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.center}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.right} />
      </View>

      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
};

export default Screen;

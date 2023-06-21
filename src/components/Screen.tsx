import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Colors from '../modules/Colors';

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
});

interface ScreenProps {
  // header 의 title 을 입력받을 수 있게
  title?: string;
  // screen 안에 자식컴포넌트들을 그려주기 위해
  children?: React.ReactNode;
}

const Screen = ({ title, children }: ScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.left} />
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

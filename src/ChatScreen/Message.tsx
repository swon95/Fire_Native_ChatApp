import React, {useCallback} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import moment from 'moment';
import Colors from '../modules/Colors';

// Props
interface MessageProps {
  name: string;
  text: string;
  createAt: Date;
  // 누가 보낸 메세지인지 ?
  isOtherMessage: boolean;
}

const Message = ({name, text, createAt, isOtherMessage}: MessageProps) => {
  // 내가 보낸 메세지가 아니라면 otherMessageStyles 에서 가져오고 내가 보낸 메세지라면 styles 에서 가져오기
  const messageStyles = isOtherMessage ? otherMessageStyles : styles;
  const renderMessageContainer = useCallback(() => {
    // array 로 담겨질 경우 key 값을 지정하여 렌더링을 보다 효과적으로
    const components = [
      // 텍스트 보낸 시간 moment 로 포맷팅
      <Text key="timeText" style={messageStyles.timeText}>
        {moment(createAt).format('HH:mm')}
      </Text>,
      // 상대방 텍스트 상자 색깔 변경
      <View key="message" style={messageStyles.messageBubble}>
        <Text style={messageStyles.messageText}>{text}</Text>
      </View>,
    ];
    // isOtherMessage 일 경우 component 를 뒤집어 메세지 - 타임스탬프 순으로 출력
    return isOtherMessage ? components.reverse() : components;
  }, [createAt, text, messageStyles, isOtherMessage]);
  return (
    // messageStyles 를 통해 상대방 메세지의 경우 otherMessageStyles 를 가져옴
    <View style={messageStyles.container}>
      <Text style={styles.nameText}>{name}</Text>
      <View style={styles.messageContainer}>{renderMessageContainer()}</View>
    </View>
  );
};

export default Message;

const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'red',
    // marginBottom: 10,
    alignItems: 'flex-end',
  },
  nameText: {
    fontSize: 12,
    color: Colors.GRAY,
    marginBottom: 4,
  },
  messageContainer: {
    // backgroundColor: 'red',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    color: Colors.GRAY,
    marginRight: 4,
  },
  messageBubble: {
    backgroundColor: Colors.BLACK,
    borderRadius: 12,
    padding: 12,
    // Flex 컨테이너 내에서 각 Flex 항목이 차지하는 공간의 크기 조정을 관리 => default = 1
    // Flex 가 넘치는 경우 컨테이너에서 넘치지 않게 컨트롤
    flexShrink: 1,
  },
  messageText: {
    fontSize: 14,
    color: Colors.WHITE,
  },
});

// 다른 사용자가 보낸 메세지 스타일
const otherMessageStyles = {
  container: [styles.container, {alignItems: 'flex-start' as const}],
  messageBubble: [styles.messageBubble, {backgroundColor: Colors.LIGHT_GRAY}],
  messageText: [styles.messageText, {color: Colors.BLACK}],
  timeText: [styles.timeText, {marginRight: 0, marginLeft: 4}],
};

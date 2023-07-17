import React, {useCallback, useContext, useMemo, useState} from 'react';
import Screen from '../components/Screen';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import useChat from './useChat';
import Colors from './../modules/Colors';
import AuthContext from '../components/AuthContext';
import Message from './Message';

const ChatScreen = () => {
  // HomeScreen 에서 넘겨준 파라미터를 받아옴
  const {params} = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  // 다른 사용자 정보를 클릭 시 Title 에 userId 출력
  const {other, userIds} = params;
  // Custom Hook mount -> 채팅방 접근 -> firestore 에 chats Collection 생성
  // sendMessage props
  const {chat, loadingChat, sendMessage, messages, loadingMessages} =
    useChat(userIds);

  // console.log('messages', messages);
  const loading = loadingChat || loadingMessages;

  // 텍스트를 입력받는 State
  const [text, setText] = useState('');

  // 내 정보 가져오기
  const {user: me} = useContext(AuthContext);

  const onChangeText = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const disabledSendButtonStyle = [
    styles.sendButton,
    {backgroundColor: Colors.GRAY},
  ];

  const sendDisabled = useMemo(() => text.length === 0, [text]);

  const onPressSendButton = useCallback(() => {
    // TODO: send text message
    // me 가 null 일 때만 메세지 전송
    if (me != null) {
      sendMessage(text, me);
      setText(''); // 텍스트를 입력 후 버튼을 누르면 input area 초기화
    }
  }, [me, sendMessage, text]);

  const renderChat = useCallback(() => {
    if (chat == null) {
      return null;
    }
    return (
      <View style={styles.chatContainer}>
        <View style={styles.memberSection}>
          <Text style={styles.memberSectionTitleText}>대화상대</Text>
          <FlatList
            data={chat.users}
            renderItem={({item: user}) => (
              <View style={styles.userProfile}>
                {/* user name 의 첫 글자만 가져오기 */}
                <Text style={styles.userProfileText}>{user.name[0]}</Text>
              </View>
            )}
            // 요소 가로배치 옵션
            horizontal
          />
        </View>
        <FlatList
          // FlatList 를 뒤집기 옵션 => inverted
          inverted
          style={styles.messageList}
          data={messages}
          renderItem={({item: message}) => {
            return (
              <Message
                name={message.user.name}
                text={message.text}
                createAt={message.createAt}
                // 내 userId(정보)와 다를 경우 상대방이 보낸 메세지로 판별
                isOtherMessage={message.user.userId !== me?.userId}
              />
            );
          }}
          ItemSeparatorComponent={() => (
            <View style={styles.messageSeparator} />
          )}
        />
        <View style={styles.inputContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={onChangeText}
              // 줄바꿈 가능하게
              multiline
            />
          </View>
          <TouchableOpacity
            style={sendDisabled ? disabledSendButtonStyle : styles.sendButton}
            disabled={sendDisabled}
            onPress={onPressSendButton}>
            {/* <Text style={styles.sendText}>Send</Text> */}
            {/* icon name 에는 _ 사용 시 icon 을 불러올 수 없음 */}
            <Icon style={styles.sendIcon} name="outgoing-mail" />
          </TouchableOpacity>
        </View>
      </View>
    );
    // dependencies array 추가
  }, [
    chat,
    text,
    onChangeText,
    sendDisabled,
    onPressSendButton,
    messages,
    me?.userId,
  ]);

  return (
    <Screen title={other.name}>
      <View style={styles.container}>
        {/* 채팅방이 이미 존재한다면 불러오는 시간동안 로딩스피너 보여주기 */}
        {/* loadingChat => loading */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        ) : (
          // 그게 아니라면 채팅방생성
          renderChat()
        )}
      </View>
    </Screen>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
    padding: 20,
    // backgroundColor: 'red',
  },
  memberSection: {},
  memberSectionTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 8,
  },
  userProfile: {
    width: 34,
    height: 34,
    backgroundColor: Colors.BLACK,
    borderRadius: 34 / 2,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userProfileText: {
    color: Colors.WHITE,
  },
  messageList: {
    flex: 1,
    // backgroundColor: 'red',
    // margin 의 간격을 위아래로 지정
    marginVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    // backgroundColor: 'blue',
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    // backgroundColor: 'white',
    marginRight: 10,
    borderRadius: 24,
    borderColor: Colors.BLACK,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 10,
    minHeight: 50,
    justifyContent: 'center',
  },
  textInput: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BLACK,
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
  },
  // sendText: {
  //   color: Colors.WHITE,
  // },
  sendIcon: {
    color: Colors.WHITE,
    fontSize: 24,
  },
  messageSeparator: {
    height: 8,
  },
});

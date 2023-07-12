// Custom Hook
// 사용자들을 대상으로 해당 유저에 해당하는 채팅방의 유무를 확인하고,
// 있으면 불러오고, 없으면 생성해줌

import React, {useState, useCallback, useEffect} from 'react'
import { Chat, Collections, Message, User, FirestoreMessageData } from './../types'
import firestore from '@react-native-firebase/firestore'
import _ from 'lodash'

// userIds 를 받아 특정 규칙에 따라 정렬 해 주는 함수
const getChatKey = (userIds: string[]) => {
    // userIds == 정렬할 대상,  userId 를 받아 userId 를 가지고 정렬 
    return _.orderBy(userIds, userId => userId, 'asc') // asc == 오름차순 정렬
}
const useChat = (userIds: string[]) => {
    // 채팅을 저장할 State => 처음 인 경우 채팅이 없을수도 있으므로 null
    const [chat, setChat] = useState<Chat | null>(null)
    // 채팅방의 로딩을 담당하는 State
    const [loadingChat, setLoadingChat] = useState(false)
    // 메세지를 보내는 State
    const [messages, setMessages] = useState<Message []>([])
    // 메세지를 보내는 상태를 나타내는 State
    const [sending, setSending] = useState(false)
    
    // 채팅방을 생성하는 함수
    const loadChat = useCallback( async () => {
        try {
            setLoadingChat(true)
        // 채팅방의 존재 유무를 판별하여 존재하지 않다면 생성
        const chatSnaphot = await firestore()
        .collection(Collections.CHATS)
        // firestore docs 에서 userIds 가 getChatKey 에 들어있는 userIds 와 같은 문서 찾음
        .where('userIds', '==', getChatKey(userIds))
        // 그걸 가져옴
        .get()

        // 존재유무 판별
        // 문서가 존재한다면 ?
        if (chatSnaphot.docs.length > 0) {
            // 첫 번째 문서 get
            const doc = chatSnaphot.docs[0]
            // 채팅방 정보 가져오기
            setChat({
                id: doc.id,
                userIds: doc.data().userIds as string[],
                users: doc.data().users as User[],
            })
            // 종료
            return
        }
        // 존재하지 않다면? -> 생성
        const usersSnapshot = await firestore()
        .collection(Collections.USERS)
        // where 대신 get 을 사용할 경우 모든 유저정보를 가져옴
        .where('userId', 'in', userIds) // doc 내부에 존재하는 userId 값이 userIds 에 속한 사용자만을 지정하는 쿼리문
        .get()
        const users = usersSnapshot.docs.map(doc => doc.data() as User)
        // 각 채팅에 저장할 데이터를 담당하는 기능
        const data = {
            // 지정한 유저에 맵핑된 채팅방을 가져와야하므로 userIds 가 Key 로 사용됨
            userIds: getChatKey(userIds),
            users,
        }
        // 새로운 채팅방을 개설하기 위해 firestore Docs 에 CHATS 이라는 Collection 추가
        const doc = await firestore().collection(Collections.CHATS).add(data) // add 메소드를 통해 id 지정 없이 임의의 uid 형태로 저장 <-> doc 메소드(./AuthProvider)
        setChat({
            id: doc.id,
            // data 안에 들어있는 userIds, users 가져옴
            ...data
        })
    } finally {
        setLoadingChat(false)
    }
    }, [userIds])

    // 해당 custom hook 이 마운트 되자마자 실행
    // 즉, 다른 유저 정보를 클릭 하자마자 실행
    useEffect(() => {
        loadChat()
    }, [loadChat])

    // 비동기처리
    const sendMessage = useCallback(async (
        // 메세지의 형태
        text: string,
        // 메세지를 보낸 유저정보
        user: User
    ) => {
        // chat.id 가 null 일 경우 에러 메세지 출력
        if (chat?.id == null) {
            throw new Error('Chat is not loaded')
        }
        try {
            setSending(true)
            // 데이터를 저장하는 형태 => firestore
            const data: FirestoreMessageData = {
                text: text,
                user: user,
                createAt: new Date(),
            }
            const doc = await firestore()
                // firestore 의 CHATS Collection 에 접근
                .collection(Collections.CHATS)
                // 몇번째 message 의 문서인지 id 를 통해 확인
                .doc(chat.id)
                // 생성한 MESSAGE Collection 에 접근
                .collection(Collections.MESSAGES)
                // data 를 추가
                .add(data)
            
            // 이전 메세지 가져와 해당 data 를 추가
            setMessages(prevMessages => prevMessages.concat([{
                id: doc.id,
                ...data
            }]))
        
        } finally {
            setSending(false)
        }
    }, [chat?.id])
    return {
        chat, loadingChat, sendMessage, messages, sending
    }
}

export default useChat
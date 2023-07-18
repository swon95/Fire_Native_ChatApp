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
    // 메세지를 불러/가져오는 상태를 나타내는 State
    const [loadingMessages, setLoadingMessages] = useState(false)
    
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

    // 새로운 메세지가 있을경우 messages State 에 추가
    const addNewMessages = useCallback((newMessages: Message[]) => {
        // 새로운 메세지를 이전 메세지 앞에 concat 메소드를 통해 붙여줌
        setMessages(prevMessages => newMessages.concat(prevMessages))
    }, [])

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
                // Collection 에 MESSAGES 불러오기
                .collection(Collections.MESSAGES)
                // data 를 추가
                .add(data)
            
            // 이전 메세지 가져와 해당 data 를 추가하는 영역
            setMessages(prevMessages => 
               [
                // 추가되는 데이터
                {
                  id: doc.id,
                  ...data
                },
               ].concat(prevMessages), // 이전 메세지
            )
        } finally {
            setSending(false)
        }
    }, [chat?.id],
    )
    
    // 어떤 채팅방인지를 확인하여 가져오기 위해 type 지정
    const loadMessages = useCallback(async (chatId: string) => {
        try{
            // false => true 
            setLoadingMessages(true)
            // 보낸 메세지를 읽어오기 위해 firestore 의 collection 접근
            const messagesSnapshot = await firestore()
            .collection(Collections.CHATS)
            .doc(chatId)
            .collection(Collections.MESSAGES)
            // 메세지를 보낸 순으로 정렬 => 오름차순 (asc) => 내림차순(desc)
            .orderBy('createAt', 'desc')
            // 가져오기
            .get()

            // messagesSnapshot 에 담긴 각각의 document 를 message Object 로 변환하여 messages State 에 담아줌
            const ms = messagesSnapshot.docs.map<Message>(doc => {
                // 문서의 내용이 변수 data (object)에 담김
                const data = doc.data()
                return {
                    id: doc.id,
                    user: data.user,
                    text: data.text,
                    // firestore 에 timestamp 타입이 존재하기에 일반 datetime 으로 변환해주기 위해 toDate 메소드 사용
                    createAt: data.createAt.toDate()
                }
            })
            setMessages(ms)
        } finally {
            setLoadingMessages(false)
        }
    }, [])

    // useChat 이 import 되면 실행
    useEffect(() => {
        // chat 이 null 이 아닐 때 => chat 에 무언가의 정보가 들어있을 때
        if (chat?.id != null) {
            // load
            loadMessages(chat.id)
        }
    }, [chat?.id, loadMessages])

    useEffect(() => {
        // chat.id 가 null 이라면 반응 x
        if (chat?.id == null) {
            return
        }
        firestore()
            .collection(Collections.CHATS)
            // null 이 아닐경우
            .doc(chat.id)
            .collection(Collections.MESSAGES)
            .orderBy('createAt', 'desc')
            // onSnapshot firebase 메소드를 통해 update 시 마다 onSnapshot 메소드 호출
            .onSnapshot((snapshot) => {
                // newMessages 변수에 정의된 snapshot 에 
                const newMessages = snapshot
                    // doc 에 (문서에) added (추가) 된 문서만 가져오기 
                    .docChanges().filter(({ type }) => type === 'added')
                    .map(docChange => {
                    // docChange 안에 {doc} 추가
                    const {doc} = docChange
                    // 데이터 가져오기
                    const docData = doc.data()
                    // 아래 메세지 타입으로 만들어 return
                    const newMessage: Message = {
                        id: doc.id,
                        text: docData.text,
                        user: docData.user,
                        createAt: docData.createAt.toDate()
                    }
                    return newMessage
                    })
                    // 업데이트를 위한 함수
                    addNewMessages(newMessages)
                })
    }, [])
    return {
        chat, loadingChat, sendMessage, messages, sending, loadingMessages
    }
}

export default useChat
export type RootStackParamList = {
    Signup: undefined
    Signin: undefined
    Home: undefined
    Loading: undefined
    Chat: {
        userIds: string[]
        other: User
    }
}

export interface User {
    userId: string
    email: string
    name: string
    // 처음 일 경우 null or undefined 일 수 있으니 ? 로 정의
    profileUrl?: string
}

export enum Collections {
    // 컬렉션 생성
    USERS = 'users',
    CHATS = 'chats',
    MESSAGES = 'message',
}

export interface Chat {
    id: string
    userIds: string[]
    users: User[]
}

export interface Message {
    // message 생성 시 각각의 List 들의 id 값
    id: string
    user: User
    text: string
    // message 를 보낸 시간
    createAt: Date
}

export interface FirestoreMessageData {
    text: string
    user: User
    createAt: Date
}
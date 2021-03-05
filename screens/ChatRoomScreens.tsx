import React, { useEffect, useState } from 'react';
import { Text, FlatList, ImageBackground } from 'react-native';

import { useRoute } from '@react-navigation/native';
import { API, Auth, graphqlOperation } from 'aws-amplify';

import ChatMessage from '../components/ChatMessage';
import BG from '../assets/images/BG.png';
import InputBox from '../components/InputBox';

import { messagesByChatRoom } from '../src/graphql/queries';
import { onCreateMessage } from '../src/graphql/subscriptions';

const ChatRoomScreen = () =>  {

    //useState for messages and this.userID
    const [messages, setMessages] = useState([]);
    const [myId, setMyId] = useState(null);

    const route = useRoute();

    //Fetch message by the chat room by graphql parsing and locate chat room ID and sort from descending order
    const fetchMessages = async () => {
        const messagesData = await API.graphql(
          graphqlOperation(
            messagesByChatRoom, {
              chatRoomID: route.params.id,
              sortDirection: "DESC",
            }
          )
        )
        
        //self check to see if everything goes well
        console.log("FETCH MESSAGES")

        //set the messages fetched from messagesData
        setMessages(messagesData.data.messagesByChatRoom.items);
      }
    
    //function calls fetchMessages() method above and places it in effect
    useEffect(() => {
        fetchMessages();
    }, [])

    //Acquire user ID authentication
    useEffect(() => {
        const getMyId = async () => {
            const userInfo = await Auth.currentAuthenticatedUser();
            setMyId(userInfo.attributes.sub);
        }
        getMyId();
    }, [])

    //Real time updating of back and forth messaging
    useEffect(() => {
        const subscription = API.graphql(
            graphqlOperation(onCreateMessage)
        ).subscribe({
            next: (data) => { 
                const newMessage = data.value.data.onCreateMessage;
                if (newMessage.chatRoomID !== route.params.id) {
                    return;
                }

                fetchMessages();
                //setMessages([newMessage, ...messages]);
            }
        });

        return () => subscription.unsubscribe();
    }, [])

    //Frontend of messaging app
    return (
        <ImageBackground  style={{width: '100%', height: '100%'}} source={BG}>
            <FlatList
                data={messages}
                renderItem={({ item }) => <ChatMessage myId={myId} message={item} />}
                inverted
            />

            <InputBox chatRoomID={route.params.id} />
        </ImageBackground>
    );
}

export default ChatRoomScreen;
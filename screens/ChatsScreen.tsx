import * as React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import ChatListItem from '../components/ChatListItem';
import { useEffect, useState } from "react";
import { API, graphqlOperation, Auth,} from 'aws-amplify';
import chatRooms from '../data/ChatRooms';
import NewMessageButton from '../components/NewMessageButton';
import { getUser } from "./queries";

export default function ChatsScreen() {

  //useState declaration for chatRooms and setting it
  const [chatRooms, setChatRooms] = useState([]);

  //Async method to fetch authentication and data of chat rooms
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const userInfo = await Auth.currentAuthenticatedUser();

        const userData = await API.graphql(
          graphqlOperation(
            getUser, {
              id: userInfo.attributes.sub,

            }
          )
        )
        setChatRooms(userData.data.getUser.chatRoomUsers.items);
      } catch (e) {
        console.log(e);
      }
    }
    fetchChatRooms();
  }, []);

  //frontend of the chat screen to display
  return (
    <View style={styles.container}>
      <FlatList 
        style={{width: '100%'}}
        data={chatRooms} 
        renderItem={({ item }) => <ChatListItem chatRoom={item.chatRoom} />} 
        keyExtractor={(item) => item.id}
      />
      <NewMessageButton />
    </View>
  );
}

//stylesheet that aligns the frontend
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

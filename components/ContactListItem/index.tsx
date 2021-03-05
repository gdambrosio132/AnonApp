import React from 'react';
import { View, Text, Image, TouchableWithoutFeedback } from "react-native";
import { User } from "../../types";
import styles from './styles';
import moment from "moment";
import { useNavigation } from '@react-navigation/native';

import { API, graphqlOperation, Auth } from "aws-amplify";
import { createChatRoom, createChatRoomUser } from '../../src/graphql/mutations';

export type ContactListItemProps = {
    user: User;
}

/*
 *  ContactListItem - Displays contact of friends
 *  TODO: set status icons to see if online, away, do not disturb, or etc.
 */

const ContactListItem = (props: ContactListItemProps) => {
    const { user } = props;

    const navigation = useNavigation();


    const onClick = () => async () => {
        //navigate to chat room with this user
        try {
            //1. Create new chat room
            const newChatRoomData = await API.graphql(
                graphqlOperation(
                   createChatRoom, {
                       input: {
                           lastMessageID: "bb486ffg-e8j3-183b-6v29-n44201q24y71" //this is just a random key, haha losers >:)
                       }
                   } 
                )
            )

            if (!newChatRoomData.data) {
                console.log("Fail to create a chat room");
                return;
            }

            const newChatRoom = newChatRoomData.data.createChatRoom;


            //2. Add 'user' to the Chat Room
            await API.graphql(
                graphqlOperation(
                    createChatRoomUser, {
                        input: {
                            userID: user.id,
                            chatRoomID: newChatRoom.id,
                        }
                    }
                )
            )
            //3. Add authenitcated user to the Chat Room
            const userInfo = await Auth.currentAuthenticatedUser();
            await API.graphql(
                graphqlOperation(
                    createChatRoomUser, {
                        input: {
                            userID: userInfo.attributes.sub,
                            chatRoomID: newChatRoom.id,
                        }
                    }
                )
            )
            
            //Lastly navigate to chatroom, with display message the needs to be changed
            navigation.navigate('ChatRoom', { 
                id: newChatRoom.id, 
                name: "Temporary Name", 
            })

        } catch (e) {
            console.log(e);
        }   
    }

    //Get feedback to open view
    return(
        <TouchableWithoutFeedback onPress={onClick}>
            <View style = {styles.container}>
                <View style = {styles.leftContainer}>
                    <Image source={{ uri: user.imageUri}} style={styles.avatar}/>

                    <View style = {styles.midContainer}>
                        <Text style={styles.username}>{user.name}</Text>
                        <Text numberOfLines={2} style={styles.status}>{user.status}</Text>
                    </View>

                </View>
            </View>
        </TouchableWithoutFeedback>
    )
};

export default ContactListItem;
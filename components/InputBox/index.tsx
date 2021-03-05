import React, { useEffect, useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform} from "react-native";
import styles from './styles';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import { createMessage, updateChatRoom } from '../../src/graphql/mutations';
import { MaterialCommunityIcons, MaterialIcons, FontAwesome5, Entypo, Fontisto } from '@expo/vector-icons';

/*
 *  InputBox - functionality and display of the inputbox for the messaging app
 *  TODO: Need to add microphone funcitonality - Maybe various microphone voices
 *        Add ability to navigate to photos, THIS IS NECESSARY!
 *        Ways to add special effects to each message like IOS messaging but maybe not
 */

const InputBox = (props) => {

    //Declare states for messages and user ID
    const { chatRoomID } = props;
    const [message, setMessage] = useState('');
    const [myUserId, setMyUserId] = useState(null);

    //Fetch User as always
    useEffect(() => {
        const fetchUser = async () => {
            const userInfo = await Auth.currentAuthenticatedUser();
            setMyUserId(userInfo.attributes.sub);
        }
        fetchUser();
    }, [])

    //TODO: work on this method to send voice messages, probably with a twist to alter voice
    const onMicrophonePress = () => {
        //console.warn('microphone')
    }

    //Mutate query for input message to AWS
    const updateChatRoomLastMessage = async (messageId: string) => {
        try {
            await API.graphql(
                graphqlOperation(
                    updateChatRoom, {
                        input: {
                            id: chatRoomID,
                            lastMessageID: messageId,
                        }
                    }
                )
            );
        } catch (e) {
            console.log(e);
        }
    }

    //Send content to AWS and mutate our input slot
    const onSendPress = async () => {
        //send message to the backend
        try {
            const newMessageData = await API.graphql(
                graphqlOperation(
                    createMessage, {
                        input: {
                            content: message,
                            userID: myUserId,
                            chatRoomID
                        }
                    }
                )
            )

            await updateChatRoomLastMessage(newMessageData.data.createMessage.id);
        } catch (e) {
            console.log(e);
        }


        setMessage('');
    }

    //Microphone and send button share same space, alter between them
    const onPress = () => {
        if (!message) {
            onMicrophonePress();
        } else {
            onSendPress();
        }
    }

    //Frontend design for inputbox and etc.
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS == "ios" ? "padding" : "height"}
            keyboardVerticalOffset={100}
            style={{width: '100%'}}
        >
            <View style={styles.container}>
                <View style={styles.mainContainer}>
                    <FontAwesome5 name="laught-beam" size={24} color="grey" />
                    <TextInput 
                        placeholder={"Type a message"}
                        style={styles.textInput}
                        multiline 
                        value={message}
                        onChangeText={setMessage}
                    />
                    <Entypo name="attachment" size={24} color="grey" style={styles.icons} />
                    {!message && <Fontisto name="camera" size={24} color="grey" style={styles.icons}/>}
                </View>
                <TouchableOpacity onPress={onPress}>
                    <View style={styles.buttonContainer}>
                        {!message 
                        ? <MaterialCommunityIcons name="microphone" size={28} color="white" />
                        : <MaterialIcons name="send" size={28} color="white" />}
                    </View>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

export default InputBox;
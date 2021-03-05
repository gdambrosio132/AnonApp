import React from 'react';
import { View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from './styles';
import { useNavigation } from '@react-navigation/native';

/*
 *  NewMessageButton
 *  Instantiate new message to new user to contacts
 */

const NewMessageButton = () => {

    const navigation = useNavigation();

    const onPress = () => {
        navigation.navigate('Contacts');
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onPress}>
                <MaterialCommunityIcons
                    name="message-reply-text"
                    size={28}
                    color="white"
                />
            </TouchableOpacity>
        </View>
        
    )
}

export default NewMessageButton
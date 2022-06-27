import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import React from 'react'
import Title from '../components/Title'
import { useNavigation } from '@react-navigation/native'


const Home = () => {

    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <Title titleText='Quizzo'/>

            <View style={styles.bannerContainer}>
                <Image source={{
                    uri:'https://cdni.iconscout.com/illustration/premium/thumb/faq-4040495-3354581.png'
                }}
                    style={styles.banner}
                    resizeMode="contain"
                />
            </View>

            <TouchableOpacity 
                onPress={()=>navigation.navigate('SelectQuiz')}
                style={styles.button}
            >
                <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default Home;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        height: '100%',
        backgroundColor: '#142850'
    },
    banner: {
        height: 350,
        width: 350
    },
    bannerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    button: {
        width: '100%',
        backgroundColor: '#1A759F',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 30
    },
    buttonText: {
        fontSize: 22,
        color: 'white',
        fontFamily: 'Ubuntu-Medium'
    }
});
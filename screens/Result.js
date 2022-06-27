import React from 'react'
import { 
    StyleSheet, 
    Text, 
    View, 
    Image, 
    TouchableOpacity, 
    SafeAreaView 
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Title from '../components/Title';

const Result = ({route}) => {
    const navigation = useNavigation();
    const {score} = route.params;
    const correctAns = score/10;
    
    const resultBanner = score>10? "https://static.vecteezy.com/system/resources/previews/004/105/995/original/successful-business-team-winner-cup-tiny-people-happy-winning-angry-losing-teams-illustration-winner-business-team-businessman-with-award-free-vector.jpg" : 
    "https://img.freepik.com/free-vector/loser-failure-success-winning-businessmen-composition-with-discouraged-man-broken-egg-shellvector-illustration_1284-63222.jpg"

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Results</Text>
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 25}}>
                <Text style={styles.scoreText}>Correct answers: </Text>
                <Text style={styles.scoreText}>{correctAns}</Text>
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={styles.scoreText}>Your score: </Text>
                <Text style={styles.scoreText}>{score}</Text>
            </View>

            <View style={styles.bannerContainer}>
                <Image source={{
                    uri:resultBanner
                }}
                    style={styles.banner}
                    resizeMode="contain"
                />
            </View>

            <TouchableOpacity onPress={()=>navigation.navigate('Home')}
                style={styles.button}
            >
                <Text style={styles.buttonText}>Go to Home</Text>
            </TouchableOpacity>

        </SafeAreaView>
    )
}

export default Result

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        height: '100%',
        backgroundColor: '#06173B',
    },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 25,
        paddingBottom: 18
    },
    headerText: {
        color: 'white',
        fontSize: 30,
        fontFamily: 'Ubuntu-Medium'
    },
    scoreText: {
        color: 'white',
        alignSelf: 'center',
        fontSize: 22,
        fontWeight: '600',
        fontFamily: 'Ubuntu-Regular',
    },
    banner: {
        height: 300,
        width: 300
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
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 27
    },
    buttonText: {
        fontSize: 20,
        fontFamily: 'Ubuntu-Medium',
        color: 'white'
    },
})
import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { 
    Image,
    StyleSheet, 
    Text, 
    View,
    TouchableOpacity
} from 'react-native'

const SelectQuiz = () => {

    const navigation = useNavigation();

    const computersURL = "https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple&encode=url3986";
    const geographyURL = "https://opentdb.com/api.php?amount=10&category=22&difficulty=medium&type=multiple&encode=url3986";
    const sportsURL = "https://opentdb.com/api.php?amount=10&category=21&difficulty=medium&type=multiple&encode=url3986";
    const historyURL = "https://opentdb.com/api.php?amount=10&category=23&difficulty=medium&type=multiple&encode=url3986";
    const animalsURL = "https://opentdb.com/api.php?amount=10&category=27&difficulty=medium&type=multiple&encode=url3986";
    const mythologyURL = "https://opentdb.com/api.php?amount=10&category=20&difficulty=medium&type=multiple&encode=url3986";

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity 
                    onPress={()=>navigation.navigate('Home')}
                    style={styles.backButton}
                >
                    <Image 
                        style={{width: 25, height: 25}}
                        source={require('../assets/back_bn.png')}
                    />
                </TouchableOpacity>
                <Text style={styles.headerText}>Select Category</Text>
            </View>

            {/* Category View */}
            <View style={styles.categoryContainer}>

                <View style={styles.categoryRow}>
                    <TouchableOpacity onPress={()=>navigation.navigate('Quiz',{url: computersURL})}
                        style={[styles.button, {backgroundColor: '#726A95'}]}
                    >
                        <Image
                            style={{width: 120, height: 120, borderRadius: 360, marginBottom: 12}}
                            source={{uri: 'https://img.freepik.com/free-vector/desktop-computer-vconcept-illustration_114360-12153.jpg?size=338&ext=jpg&ga=GA1.1.1395880969.1709510400&semt=ais'}}
                        />
                        <Text style={styles.buttonText}>Computers</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>navigation.navigate('Quiz',{url: geographyURL})} 
                        style={[styles.button, {backgroundColor: '#519872'}]}
                    >
                        <Image
                            style={{width: 120, height: 120, borderRadius: 360, marginBottom: 12}}
                            source={{uri: 'https://img.freepik.com/free-vector/earth-map-linear-composition_1284-34070.jpg?t=st=1709575055~exp=1709578655~hmac=d5e31ca114621ec2cb7e17da6fe77fbd7f2ea662fd3de1a79eedb356b35ac3d1&w=1380'}}
                        />
                        <Text style={styles.buttonText}>Geography</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.categoryRow}>
                    <TouchableOpacity onPress={()=>navigation.navigate('Quiz',{url: sportsURL})}
                        style={[styles.button, {backgroundColor: '#FA7D09'}]}
                    >
                        <Image
                            style={{width: 120, height: 120, borderRadius: 360, marginBottom: 12}}
                            source={{uri: 'https://img.freepik.com/free-vector/flat-design-man-playing-football_52683-126622.jpg?t=st=1709575140~exp=1709578740~hmac=4f139d13ac048b81e1621e7a1629167cadfe96fc4dbb0f1db268222430899c89&w=826'}}
                        />
                        <Text style={styles.buttonText}>Sports</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>navigation.navigate('Quiz',{url: historyURL})}
                        style={[styles.button, {backgroundColor: '#734046'}]}
                    >
                        <Image
                            style={{width: 120, height: 120, borderRadius: 360, marginBottom: 12}}
                            source={{uri: 'https://img.freepik.com/free-vector/shivaji-maharaja-illustration-concept_23-2148472300.jpg?t=st=1709575178~exp=1709578778~hmac=274d73da7e1e86f63811cd28a5dc8737772c54c1e36850bf0342d52258dcac49&w=826'}}
                        />
                        <Text style={styles.buttonText}>History</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.categoryRow}>
                    <TouchableOpacity onPress={()=>navigation.navigate('Quiz',{url: animalsURL})}
                        style={[styles.button, {backgroundColor: '#03C4A1'}]}
                    >
                        <Image
                            style={{width: 120, height: 120, borderRadius: 360, marginBottom: 12}}
                            source={{uri: 'https://img.freepik.com/free-vector/nice-lion_1196-396.jpg?t=st=1709575210~exp=1709578810~hmac=b853825b0262d46dcb3206ae52c2a11960639e14608ac64879b6456310a9b744&w=826'}}
                        />
                        <Text style={styles.buttonText}>Animals</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>navigation.navigate('Quiz',{url: mythologyURL})}
                        style={[styles.button, {backgroundColor: '#B5076B'}]}
                    >
                        <Image
                            style={{width: 120, height: 120, borderRadius: 360, marginBottom: 12}}
                            source={{uri: 'https://img.freepik.com/free-vector/hand-drawn-paleolithic-period-illustration_23-2150146759.jpg?t=st=1709575239~exp=1709578839~hmac=581dd4f9aafb91ac988416169259b83037871f1544f74e01a4d86a0bfebc8987&w=996'}}
                        />
                        <Text style={styles.buttonText}>Mythology</Text>
                    </TouchableOpacity>
                </View>

            </View>

        </View>
    )
}

export default SelectQuiz;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#06173B',
        padding: 12,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 13,
        paddingBottom: 25,
    },
    backButton: {
        position: 'absolute',
        left: 5,
        top: 16
    },
    headerText: {
        color: 'white',
        fontSize: 22,
        fontFamily: 'Ubuntu-Medium'
    },
    categoryContainer: {
        flex: 1,
    },
    categoryRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: '100%',
        marginBottom: 10
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        padding: 18,
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Ubuntu-Regular',
    }
})
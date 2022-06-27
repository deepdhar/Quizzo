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
                        <Text style={styles.buttonText}>Computers</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>navigation.navigate('Quiz',{url: geographyURL})} 
                        style={[styles.button, {backgroundColor: '#519872'}]}
                    >
                        <Text style={styles.buttonText}>Geography</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.categoryRow}>
                    <TouchableOpacity onPress={()=>navigation.navigate('Quiz',{url: sportsURL})}
                        style={[styles.button, {backgroundColor: '#FA7D09'}]}
                    >
                        <Text style={styles.buttonText}>Sports</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>navigation.navigate('Quiz',{url: historyURL})}
                        style={[styles.button, {backgroundColor: '#734046'}]}
                    >
                        <Text style={styles.buttonText}>History</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.categoryRow}>
                    <TouchableOpacity onPress={()=>navigation.navigate('Quiz',{url: animalsURL})}
                        style={[styles.button, {backgroundColor: '#03C4A1'}]}
                    >
                        <Text style={styles.buttonText}>Animals</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>navigation.navigate('Quiz',{url: mythologyURL})}
                        style={[styles.button, {backgroundColor: '#B5076B'}]}
                    >
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
        fontSize: 20,
        fontFamily: 'Ubuntu-Regular'
    }
})
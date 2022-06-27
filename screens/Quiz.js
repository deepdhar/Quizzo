import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'


const shuffleArray = (array) => {
    for(let i=array.length-1; i>0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const Quiz = ({route}) => {
    const navigation = useNavigation();
    const {url} = route.params;

    const [questions, setQuestions] = useState();
    const [ques, setQues] = useState(0);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const[isLoading, setIsLoading] = useState(false);

    const getQuiz = async() => {
        setIsLoading(true);
        const URL = url;
        const res = await fetch(URL);
        const data = await res.json();
        setQuestions(data.results);
        setOptions(generateOptionsAndShuffle(data.results[0]));
        setIsLoading(false);
    };

    useEffect(()=>{
        getQuiz();
    },[]);

    const handleNextPress = () => {
        setQues(ques+1);
        setOptions(generateOptionsAndShuffle(questions[ques+1]))
    }

    const generateOptionsAndShuffle = (_question) => {
        const options = [..._question.incorrect_answers];   //copy the incorrect answers in options-array
        options.push(_question.correct_answer);             //copy the correct answer as well in the array
        shuffleArray(options);  //shuffle the options randomly
        return options;
    }

    const handleSelectedOptions = (_option) => {
        if(_option===questions[ques].correct_answer) {
            setScore(score+10)
        }
        if(ques!==9) {
            handleNextPress();
        }
        if(ques==9) {
            handleShowResult();
        }
    }

    const handleShowResult = () => {
        navigation.navigate('Result',{
            score: score
        });
    }

    return (
        <View style={styles.container}>
            {isLoading ? <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: 20, color: 'white'}}>HOLD ON...</Text>
                </View> : questions && (
                <View style={styles.parent}>
                    <View style={styles.top}>
                        <Text style={styles.question}>Q. {decodeURIComponent(questions[ques].question)}</Text>
                    </View>

                    {/* Options View */}
                    <View style={styles.options}>
                        <TouchableOpacity onPress={()=>handleSelectedOptions(options[0])}
                            style={styles.optionButton}
                        >
                            <Text style={styles.option}>{decodeURIComponent(options[0])}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>handleSelectedOptions(options[1])}
                            style={styles.optionButton}
                        >
                            <Text style={styles.option}>{decodeURIComponent(options[1])}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>handleSelectedOptions(options[2])}
                            style={styles.optionButton}
                        >
                            <Text style={styles.option}>{decodeURIComponent(options[2])}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>handleSelectedOptions(options[3])}
                            style={styles.optionButton}
                        >
                            <Text style={styles.option}>{decodeURIComponent(options[3])}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottom}>
                        {/* <TouchableOpacity 
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>PREV</Text>
                        </TouchableOpacity> */}

                        { ques!==9 &&
                        <TouchableOpacity
                            onPress={handleNextPress}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>SKIP</Text>
                        </TouchableOpacity>}

                        {ques==9 &&
                        <TouchableOpacity
                            onPress={handleShowResult}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>SHOW RESULTS</Text>
                        </TouchableOpacity>}
                        
                    </View>
                </View> 
            )}

        </View>
    )
}

export default Quiz

const styles = StyleSheet.create({
    container: {
        padding: 12,
        paddingHorizontal: 20,
        height: '100%',
        backgroundColor: '#142850'
    },
    parent: {
        flex: 1,
        height: '100%'
    },
    top: {
        marginVertical: 16
    },
    options: {
        marginVertical: 16,
        flex: 1
    },
    bottom: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        backgroundColor: '#1A759F',
        padding: 16,
        width: '60%',
        paddingHorizontal: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 10
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        fontFamily: 'Ubuntu-Medium'
    },
    question: {
        fontSize: 24,
        color: 'white',
        fontFamily: 'Ubuntu-Medium'
    },
    option: {
        fontSize: 18,
        color: 'white',
        fontFamily: 'Ubuntu-Regular'
    },
    optionButton: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginVertical: 12,
        backgroundColor: '#34A0A4',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'white'
    },
})
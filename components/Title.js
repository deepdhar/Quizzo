import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Title = ({titleText}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{titleText}</Text>
        </View>
    )
}

export default Title

const styles = StyleSheet.create({
    container: {
        paddingTop: 35,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 40,
        fontWeight: '600',
        color: 'white',
        fontFamily: 'Pacifico_Regular',
    }
})
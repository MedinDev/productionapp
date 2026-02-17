import react from 'react'
import {View,StyleSheet} from "react-native";
import TaskManager from '../../components/TaskManager'

export default function HomeScreen (){
  return (
      <View style={styles.container}>
        <TaskManager />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal:16,
    backgroundColor:'#fff'
  },
})
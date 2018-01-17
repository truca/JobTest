import React from 'react';
import { DrawerNavigator, StackNavigator, SafeAreaView, DrawerItems } from 'react-navigation';
import { StyleSheet, View, TouchableOpacity, Icon, Text, ScrollView, Picker } from 'react-native'
import { Button } from 'native-base'
import { FontAwesome } from '@expo/vector-icons';
import R from 'ramda'
import NavigatorService from '../services/navigator';

import Map from '../screens/Map';

class BackButton extends React.Component {
  render() {
    return (
      <View>
        <FontAwesome name="chevron-left" style={{padding: 10, marginRight:10, fontSize: 20}} onPress={() => { this.props.goBack(null) }} /> 
      </ View>
    );
  }
} 

const AppNavigator = new StackNavigator({
	Map: { screen: Map, }
},{
  navigationOptions: ({ navigation }) => ({
    title: 'MapApp',
    headerLeft: <BackButton goBack={navigation.goBack} />,
  })
});

export default class RootNavigator extends React.Component {
  render() {
    return <AppNavigator ref={navigatorRef => {
      NavigatorService.setContainer(navigatorRef);
    }}/>;
  }
}

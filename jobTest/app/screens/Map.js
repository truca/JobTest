import React, { Component } from 'react'
import ClusteredMapView from 'react-native-maps-super-cluster'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Constants, Location, Permissions } from 'expo';
import Fetcher from '../services/fetcher.js'

import { Form, Input, Container, Button, Item, Text, Toast, } from 'native-base'
import {
  Platform,
  ScrollView, 
  Image,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { MapView } from 'expo';
import R from 'ramda'
import { connect } from 'react-redux'
import * as actions from '../redux/actions'
import serverURL from '../constants/Server'

const INIT_REGION = { 
  latitude: -33.4727879,
  longitude: -70.6298313,
  latitudeDelta: 0.2,
  longitudeDelta: 0.3421,
}

const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;

export function getRegion(latitude, longitude, latitudeDelta) {
  const LONGITUDE_DELTA = latitudeDelta * ASPECT_RATIO;

  return {
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: latitudeDelta,
      longitudeDelta: LONGITUDE_DELTA,
  };
}

class MyMarker extends MapView.Marker {
  onPress(){
    this.showCallout()
  }
  render(){
    return <MapView.Marker {...this.props} onPress={this.onPress.bind(this)} />
  }
} 

class Map extends Component {
  state = {
    location: null,
    errorMessage: null,
    data: null,
    region: null,
    checkForLocationinterval: null,
  }
  constructor(props){
    super(props)
    const region = getRegion(INIT_REGION.latitude, INIT_REGION.longitude, INIT_REGION.latitudeDelta);
    this.state = { region, data: [] }
    this.fetcher = new Fetcher(serverURL, this.props.getDispatch())
    this.fetcher.get('points', {}, this.props.setPoints)
  }
  getCenter(point){
    return getRegion(point.location.latitude, point.location.longitude, INIT_REGION.latitudeDelta)
  }
  componentWillReceiveProps(nextProps){
    /*if(!this.props.points.length && nextProps.points.length){
      let points = R.map(point => {
        point.location = point.coords[0]
        delete point.coords
        return point
      }, nextProps.points)
      console.log(points)
      this.setState({ data: points })
    }*/
  }
  renderMarker = (data) => {
    const { navigate } = this.props.navigation;
    return <MapView.Marker.Animated 
      key={data.id || Math.random()}
      coordinate={data.location}
      title={data.name}
      onCalloutPress={ () => this.state.user? navigate('Chat', { user: 'Lucy' }) : navigate('Login')}
      onPress={ () => this.handleMarkerPress(data.location) } 
    />
  }
  increment() {
    const region = getRegion(
      this.state.region.latitude,
      this.state.region.longitude,
      this.state.region.latitudeDelta * 0.5
    );

    this.setState({region});
  }
  decrement() {
    const region = getRegion(
      this.state.region.latitude,
      this.state.region.longitude,
      this.state.region.latitudeDelta / 0.5
    );
    this.setState({region});
  }
  center() {
    if(this.state.location){
      const region = getRegion(
        this.state.location.coords.latitude,
        this.state.location.coords.longitude,
        this.state.region.latitudeDelta
      );
      this.setState({region});
    }
  }
  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }
    let { locationServicesEnabled } = await Location.getProviderStatusAsync();
    if( locationServicesEnabled ){
      let location = await Location.getCurrentPositionAsync({});
      this.setState({ location });
    }else{
      Toast.show({ text: 'Please turn on the location services', 
        position: this.props.toastPosition, 
        buttonText: this.props.toastText, 
        duration: this.props.notificationDuration, })
      //  duration: 0.5*60*1000,
      //set watch to get user geolocation
      let checkForLocationinterval = setInterval(async () => {
        let { locationServicesEnabled } = await Location.getProviderStatusAsync();
        if( locationServicesEnabled ){
          let location = await Location.getCurrentPositionAsync({});
          clearInterval(this.state.checkForLocationinterval)
          this.setState({ location, checkForLocationinterval: null });
        }else{
          //Toast.show({ text: 'Please turn on the location services', position: this.props.toastPosition, duration: 2*1000, })
        }
      }, this.props.checkLocationInterval)
      this.setState({ checkForLocationinterval })
    }
  }
  componentWillUnmount(){
    if(this.state.checkForLocationinterval){
      clearInterval(this.state.checkForLocationinterval)
    }
  }
  handleMarkerPress = (location) => {
    this.mapMovement(location, this.state.region.latitudeDelta)
  }
  handleClusterPress = (location) => {
    this.mapMovement(location, this.state.region.latitudeDelta*0.5)
  }
  mapMovement = (location, latitudeDelta) => {
    const region = getRegion(
      location.latitude,
      location.longitude,
      latitudeDelta,
    );
    console.log('this.map', this.map)  
    this.setState({ region }) //: new MapView.AnimatedRegion({ region })
  }
  setRegion = (region) => {
    this.setState({region})
  }
  renderCluster = (cluster, onPress) => {
    const pointCount = cluster.pointCount,
          coordinate = cluster.coordinate,
          clusterId = cluster.clusterId

    // use pointCount to calculate cluster size scaling
    // and apply it to "style" prop below

    // eventually get clustered points by using
    // underlying SuperCluster instance
    // Methods ref: https://github.com/mapbox/supercluster
    //const clusteringEngine = this.map.getClusteringEngine(),
    //      clusteredPoints = clusteringEngine.getLeaves(clusterId, 100)
    return ( 
      <MapView.Marker coordinate={coordinate} 
        onPress={() => { this.handleClusterPress(coordinate) }}>
        <View style={styles.myClusterStyle}>
          <Text style={styles.myClusterTextStyle}>
            {pointCount}
          </Text>
        </View>
      </MapView.Marker>
    )
  }
  render() {
    const { location } = this.state
    const { navigate } = this.props.navigation;
    let text = 'Waiting..';
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) { 
      text = JSON.stringify(this.state.location);
    }
    //console.log('map', text)  
    return (
      <Container style={styles.container2} >
        <ClusteredMapView
          style={styles.map}
          data={this.state.data}
          region={this.state.region}
          renderMarker={this.renderMarker}
          renderCluster={this.renderCluster}
          textStyle={{ color: '#65bc46' }}
          moveOnMarkerPress={true} 
          //onRegionChange={this.setRegion} 
          onRegionChangeComplete={this.setRegion}
          containerStyle={{backgroundColor: 'white', borderColor: '#65bc46'}}>
        </ClusteredMapView> 

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => this.increment()} style={[styles.bubble, styles.button]} >
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.decrement()} style={[styles.bubble, styles.button]} >
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.center()} style={[styles.bubble, styles.button, { paddingVertical: 12, display: location? 'flex' : 'none' }]} > 
              <MaterialCommunityIcons style={{fontSize: 18, fontWeight: 'bold'}} name="map-marker-radius" />
          </TouchableOpacity>
        </View>
        <View style={styles.list}>
          <ScrollView>
            {this.props.points.map((point, i) => {
              return (
                <View key={i} style={styles.item}>
                  <Button onPress={ () => this.setState({ data: [point], region: this.getCenter(point) }) } style={styles.itemButton}><Text style={styles.itemText} >{point.name}</Text></Button>
                </View>
              )
            })}
          </ScrollView>
        </View>
      </Container>
    ) 
  }
}

const Connected = connect(
  state => ({
    points: R.map(point => {
      point.location = point.coords[0]
      delete point.coords
      return point
    }, state.points)
  }),
  dispatch => ({
    setPoints: (Points) => {
      console.log('Points', Points) 
      return actions.setPoints(Points.points)
    },
    getDispatch: () => dispatch
  })
)(Map)

export default Connected

const styles = StyleSheet.create({
  list: {
    backgroundColor: 'floralwhite',
    justifyContent: 'center',
    flexDirection: 'column',
    alignSelf: 'flex-start', 
    width: '100%',
    maxHeight: 120,
  },
  item: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: 5,
  },
  itemButton: {
    flex: 1,
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    color: 'white',
  },
  container: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      alignItems: 'center',
  },
  container2: { 
    justifyContent: 'flex-end', 
    flexDirection: 'column', 
    alignItems: 'flex-end',
    flex: 1,
    position: 'relative',
    backgroundColor: 'skyblue'
  },
  map: {
      ...StyleSheet.absoluteFillObject,
  },
  bubble: {
      backgroundColor: 'rgba(255,255,255,0.7)',
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 0,
  },
  latlng: {
      width: 200,
      alignItems: 'stretch',
  },
  button: {
      width: 50,
      paddingVertical: 8,
      alignItems: 'center',
      marginVertical: 5,
  },
  buttonContainer: {
      flexDirection: 'column',
      marginVertical: 20,
      backgroundColor: 'transparent',
      marginRight: 5, 
  },
});

import React from 'react';
import { MapView } from 'expo';

export default class Marker extends React.Component {
  render() {
    return (
      <MapView.Marker {...this.props} />
    ) 
  }
}
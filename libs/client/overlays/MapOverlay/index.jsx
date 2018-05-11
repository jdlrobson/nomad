import React from 'react';
import createReactClass from 'create-react-class';

import Map from './../../components/Map';

import Overlay from './../Overlay';

import './styles.less';

export default createReactClass( {
	render() {
		return (
      <Overlay {...this.props} className="map-overlay" isLightBox="1">
        <Map {...this.props}/>
      </Overlay>
		);
	}
} );

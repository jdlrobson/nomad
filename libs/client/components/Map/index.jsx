import React from 'react';
import { divIcon, icon } from 'leaflet';
import { Map, Marker, Popup, TileLayer, Polyline } from 'react-leaflet';
import { IntermediateState, Card } from 'wikipedia-react-components'
import createReactClass from 'create-react-class'

import calculateBoundsFromPages from './../../calculate-bounds-from-pages'

import './styles.less'
import 'leaflet/dist/leaflet.css'

function calculateDistance( from, to ) {
	var distance, a,
		toRadians = Math.PI / 180,
		deltaLat, deltaLng,
		startLat, endLat,
		haversinLat, haversinLng,
		radius = 6378.1; // radius of Earth in km

	if( from[0] === to[0] && from[1] === to[1] ) {
		distance = 0;
	} else {
		deltaLat = ( to[1] - from[1] ) * toRadians;
		deltaLng = ( to[0] - from[0] ) * toRadians;
		startLat = from[0] * toRadians;
		endLat = to[0] * toRadians;

		haversinLat = Math.sin( deltaLat / 2 ) * Math.sin( deltaLat / 2 );
		haversinLng = Math.sin( deltaLng / 2 ) * Math.sin( deltaLng / 2 );

		a = haversinLat + Math.cos( startLat ) * Math.cos( endLat ) * haversinLng;
		return 2 * radius * Math.asin( Math.sqrt( a ) );
	}
	return distance;
}

function param( args ) {
  var key,
    array = [];

  for( key in args ) {
     array.push( encodeURIComponent(key) + '=' + encodeURIComponent( args[key] ) );
  }
  return array.join( '&' );
}

export default createReactClass({
  getDefaultProps() {
    return {
      continue: false,
      initialised: false,
      explorable: true,
      zoom: 1
    }
  },
  getInitialState() {
    return {
      markers: [],
      titles: {}
    };
  },
  loadMarkers( pages ) {
    var self = this;
    var markers = this.state.markers || [];
    var titles = this.state.titles || {};
    var bounds = calculateBoundsFromPages( pages );

    pages.forEach( function ( page ) {
      var marker, size, iconSize;
      var c = page.coordinates;
      if ( c && !titles[page.title] ) {
        marker = {
          page: page,
          lat: c.lat,
          lng: c.lng || c.lon,
          label: <Card title={page.title} extracts={[ page.description ]}
            router={self.props.router}
            language_project={self.props.language_project}
            thumbnail={page.thumbnail} />
        };
        if ( page.category ) {
          marker.icon = divIcon({
            className: 'mw-ui-icon mw-ui-icon-element mw-ui-icon-' + page.category
          });
        } else {
          size = page.pageassessments && page.pageassessments.city && page.pageassessments.city.class || 'usable';
          if ( size === 'usable' ) {
            iconSize = [25, 41];
          } else if ( size === 'outline' ) {
            iconSize = [12, 20];
          } else {
            iconSize = [19, 30];
          }
          marker.icon = icon({
              iconUrl: '/marker-icon.png',
              iconSize: iconSize
          })
        }
        titles[page.title] = true;
        markers.push( marker );
      }
    } );
    if ( pages.length > 1 ) {
      self.setState( {
        bounds: bounds
      } );
    }
    self.setState( {
      titles: titles,
      markers: markers
    } );
  },
  componentDidMount() {
    var self = this;
    var props = this.props;
    var lat = props.lat;
    var lng = props.lon;

    // recursively load all items in collection
    function loadMarkersInCollection ( endpoint, continueArgs ) {
      endpoint = continueArgs ? endpoint + '?' + param( continueArgs ) : endpoint;
      props.api.fetch( endpoint )
        .then( ( collection ) => {
          self.loadMarkers( collection.pages )
          if ( collection.continue && props.continue ) {
            loadMarkersInCollection( endpoint, collection.continue );
          }
        } );
    }

    this.setState( {
      markers: [],
      lat: lat || 0,
      lon: lng || 0,
      zoom: this.props.zoom
    } );
    if ( this.props.title && this.props.lat ) {
      self.loadMarkers( [
        { title: props.title, coordinates: { lat: lat, lng: lng } }
      ] )
      this.props.api.getPage( this.props.title, this.props.language_project )
        .then( ( page ) => this.loadMarkers( page.vcards || [] ) );
    }
    if ( this.props.apiEndpoint ) {
      loadMarkersInCollection( this.props.apiEndpoint );
    }
  },
  loadNearby: function ( lat, lng ) {
    var props = this.props;
    props.api.fetch( '/api/nearby/' + props.lang + '/' + lat + ',' + lng )
      .then( res => this.loadMarkers( res.pages ) );
  },
  doDrag: function () {
    if ( this.props.explorable ) {
      // prevent bounds resetting
      this.setState( { initialised: true } );
      var center = this.L.getCenter();
      this.loadNearby( center.lat, center.lng );
    }
  },
  render: function () {
    var position, mapOptions;
    var state = this.state || {};
    var markers = state.markers || [];
    var lat = this.state.lat;
    var lng = this.state.lon;
    var bounds = this.state.bounds;

    if ( lat !== undefined && lng !== undefined ) {
      position = [lat, lng];
      mapOptions = {
        center: position,
        zoom: this.state.zoom,
        ref: (ref) => this.L = ref && ref.leafletElement,
        onDragend: this.doDrag,
        boundOptions: {padding: [50, 50]}
      };
      if ( bounds && markers.length && !this.state.initialised ) {
        mapOptions.bounds = [ bounds.southWest, bounds.northEast ];
      }

      var polyLines = [];

      var last;
      var lastPage;
      markers.forEach( function ( marker, i ) {
        var cur = [ marker.lat, marker.lon || marker.lng  ];
        if ( last ) {
          polyLines.push(
            <Polyline positions={[ last, cur ]} color='#00ab9f' weight={(i * 0.2)+1}>
              <Popup>
                  <Card title={`${lastPage.title} to ${marker.page.title}`}
                    extracts={[ Math.floor( calculateDistance(last, cur) ) + 'km' ]} url={'#'} />
              </Popup>
            </Polyline>
          );
        }
        lastPage = marker.page;
        last = cur;
      } );

      return (
        <Map {...mapOptions}>
          <TileLayer
            url='https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {
            markers.map( function ( marker, i ) {
              var popup;
              var markerProps = {
                key: 'marker-' + i,
                position: [marker.lat, marker.lon || marker.lng],
                options: {}
              };
              if ( marker.icon ) {
                markerProps.icon = marker.icon;
              }
              if ( marker.label ) {
                popup = <Popup>{marker.label}</Popup>;
              }
              return (
                <Marker {...markerProps}>{popup}</Marker>
              )
            } )
          }
          {polyLines}
        </Map>
      )
    } else {
      return <IntermediateState />;
    }
  }
} );

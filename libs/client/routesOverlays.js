import React from 'react'

import EditorOverlay from './overlays/EditorOverlay'
import CollectionEditorOverlay from './overlays/CollectionEditorOverlay'
import ImageOverlay from './overlays/ImageOverlay'
import SearchOverlay from './overlays/SearchOverlay'
import MapOverlay from './overlays/MapOverlay'
import CollectionDownloadOverlay from './overlays/CollectionDownloadOverlay'

export default [
  // Random map Overlay
  [
    /^#\/explore\/$/,
    function ( info, props ) {
      var lang = props.lang || 'en';
      var overlayProps = Object.assign( {}, props, {
        explorable: true,
        continue: false,
        apiEndpoint: '/api/random/' + lang
      } );
      return {
        overlay: React.createElement( MapOverlay, overlayProps )
      }
    }
  ],
  // Map Collection Overlay
  [
    /^#\/collection-map\/(.*)\/(.*)\/$/,
    function ( info, props ) {
      var lang = props.lang || 'en';
      var overlayProps = Object.assign( {}, props, {
        explorable: false,
        continue: true,
        apiEndpoint: '/api/' + lang + '/collection/by/' + info[1] + '/' + info[2]
      } );
      return {
        overlay: React.createElement( MapOverlay, overlayProps )
      }
    }
  ],
  // Map Overlay
  [
    /^#\/map\/(.*)\/(.*)\/(.*)\/$/,
    function ( info, props ) {
      var overlayProps = Object.assign( {}, props, {
        lat: parseFloat( info[1], 10 ),
        lon: parseFloat( info[2], 10 ),
        zoom: parseInt( info[3], 10 )
      } );
      return {
        overlay: React.createElement( MapOverlay, overlayProps )
      };
    }
  ],
  // Edit Overlay
  [
    /^#\/editor\/?([^\/]*)\/?(.*)$/,
    function ( info, props ) {
      var overlayProps = Object.assign( {}, props, {
        section: info[1]
      } );
      if ( info[2] ) {
        overlayProps.wikitext = atob( info[2] );
      }
      return {
        overlay: React.createElement( EditorOverlay, overlayProps )
      }
    }
  ],
  // Edit Overlay
  [
    /^#\/note-editor\/(.*)$/,
    function ( info, props ) {
      var wikitext;
      var title = props.title;
      if ( props.params ) {
        title += '/' + props.params;
      }
      if ( title.indexOf( 'Special:Collections' ) > -1 ) {
        wikitext = [
          '# Trip Checklist',
          '[] Booked flights',
          '[] Booked hotels',
          '[] Booked airport transfer',
          '[] Cards/money',
          '# Packed:',
          '[] travel pillow',
          '[] clothes',
          '[] toiletries',
          '[] electronics',
          '[] passport'
        ].join( '\n' );
      }
      var overlayProps = Object.assign( {}, props, {
        displayTitle: 'public note',
        wikitext: wikitext,
        editWarning: '<strong>Warning:</strong> You are about to make this content <strong>public</strong>. Please do not include any information such as ticket numbers, passport numbers or any other personal details.',
        editSummary: 'Made a note to self about upcoming trip',
        placeholder: 'Write down ideas, dates, todo\'s.\nAnything you write here is public.\nPlease don\'t share too much.',
        // Notes on subpages point to the main note
        title: decodeURIComponent( 'User:' + info[1] + '/notes/' + title.split( '%2F' )[0] ),
        section: 0
      } );
      return {
        overlay: React.createElement( EditorOverlay, overlayProps )
      }
    }
  ],
  // Image Overlay
  [
    /^#\/media\/(.*)$/,
    function ( info, props ) {
      var overlayProps = Object.assign( {}, props, {
        image: info[1]
      } );
      return {
        overlay: React.createElement( ImageOverlay, overlayProps )
      }
    }
  ],
  // Collection Download overlay
  [
    /^#\/collection-download\/(.*)\/(.*)$/,
    function ( info, props ) {
      var overlayProps = Object.assign( {}, props, {
        username: info[1],
        id: info[2]
      } );
      return {
        overlay: React.createElement( CollectionDownloadOverlay, overlayProps )
      }
    }
  ],
  // collections
  [
    /^#\/edit-collection\/(.*)\/(.*)$/,
    function ( info, props ) {
      var overlayProps = Object.assign( {}, props, {
        username: info[1],
        id: info[2]
      } );
      return {
        overlay: React.createElement( CollectionEditorOverlay, overlayProps )
      }
    }
  ],
  // Search Overlay
  [
    /^#\/search\/?(.*)$/,
    function ( info, props ) {
      return {
        overlay: React.createElement( SearchOverlay, Object.assign( props, { defaultValue: info[1] } ) )
      }
    }
  ]
];

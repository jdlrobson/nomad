import React from 'react'
import createReactClass from 'create-react-class'

import CardList from './../../components/CardList'

import Article from './../Article'
import PagePreviewOverlay from './../../overlays/PagePreviewOverlay'

import './styles.less'

function placeholders() {
  let arr = [];
  for ( let i = 0; i < 25; i++ ) {
    arr.push( {
      id: i,
      url: "",
      thumbnail: {}
    } );
  }
  return arr;
}
// Pages
export default createReactClass({
  getDefaultProps: function () {
    return {
      api: null,
      lang: 'en'
    };
  },
  getInitialState() {
    return {
      error: false,
      cards: null
    };
  },
  componentDidMount() {
    this.setState( { jsEnabled: true } );
    this.props.setBannerProps( { coordinates: { lat: 0, lon: 0 } } );
  },
  launchOverlay( ev, item ) {
    var props = this.props;
    ev.preventDefault();
    // Force retrieval of summary
    delete item.description;
    if ( item.url ) {
      this.props.showOverlay( <PagePreviewOverlay
        api={this.props.api}
        onClickInternalLink={props.onClickInternalLink}
        getLocalUrl={props.getLocalUrl} item={item} /> );
    }
  },
  render(){
    var searchUrl, exploreUrl;
    var cardUrl = '/api/random/' + this.props.lang;
    if ( this.state.jsEnabled ) {
      searchUrl = "#/search";
      exploreUrl = "#/explore/";
    }
    var body = [
      <CardList key="nomad-list" {...this.props} unordered="1" apiEndpoint={cardUrl}
        onCardClick={this.launchOverlay} pages={placeholders()} emptyMessage=""
        className="card-list-images" />,
    ];

    var lead = {
      maplink: exploreUrl,
      coordinates: { zoom: 1, lat: 0, lon: 0 }
    };

    return (
      <Article {...this.props} body={body} className="home"
        lead={lead} title="" />
    )
  }
})


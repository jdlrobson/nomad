import React from 'react'
import createReactClass from 'create-react-class'

import CardList from './../../components/CardList'

import Article from './../Article'
import PagePreviewOverlay from './../../overlays/PagePreviewOverlay'

import './styles.less'

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
  },
  launchOverlay( ev, item ) {
    var props = this.props;
    ev.preventDefault();
    this.props.showOverlay( <PagePreviewOverlay
      onClickInternalLink={props.onClickInternalLink}
      getLocalUrl={props.getLocalUrl} item={item} /> );
  },
  render(){
    var quote = "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover.";
    var searchUrl, exploreUrl;
    var cardUrl = '/api/random/' + this.props.lang;
    if ( this.state.jsEnabled ) {
      searchUrl = "#/search";
      exploreUrl = "#/explore/";
    }
    var body = [
      <div className="quote-box" key="home-quote">
        <blockquote>{quote}</blockquote>
        <span className="author">Mark Twain</span>
      </div>,
      <CardList key="nomad-list" {...this.props} unordered="1" apiEndpoint={cardUrl}
        onCardClick={this.launchOverlay}
        className="card-list-images" />,
    ];
    var tagline = (<span>Click the map or scroll to adventure.</span>)

    var lead = {
      maplink: exploreUrl,
      coordinates: { zoom: 1, lat: 0, lon: 0 }
    };
    return (
      <Article {...this.props} body={body} className="home"
        isBannerEnabled={true} lead={lead}
        title='Where do you want to go today?' tagline={tagline} />
    )
  }
})


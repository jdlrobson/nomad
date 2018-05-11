import React from 'react';
import createReactClass from 'create-react-class';
import { Icon } from 'wikipedia-react-components';
import Content from './../Content';

import './styles.less';

function mapo( coords, zoom, w, h ) {
	var lat = coords.lat,
		lon = coords.lon,
		src = 'https://maps.wikimedia.org/img/osm-intl,' + zoom + ',' + lat + ',' + lon + ',' + w + 'x' + h + '.png';

	return src;
}

export default createReactClass( {
	navigateTo: function ( ev ) {
		var props = this.props;
		const target = ev.target;
		const parentNode = target.parentNode;
		if ( target.tagName === 'A' ) {
			props.router.navigateTo( { pathname: target.getAttribute( 'href' ) } );
		} else if ( parentNode.tagName === 'A' ) {
			props.router.navigateTo( { pathname: parentNode.getAttribute( 'href' ) } );
		} else if ( this.state && this.state.link ) {
			props.router.navigateTo( this.state.link );
		}
		ev.stopPropagation();
		ev.preventDefault();
		return false;
	},
	componentDidMount() {
		this.updateMapImageAndLink( this.props );
	},
	componentWillReceiveProps( props ) {
		this.setState( { inSearchMode: false } );
		this.updateMapImageAndLink( props );
	},
	updateMapImageAndLink( props ) {
		const coords = props.coordinates;
		const zoom = props.zoom;
		const mapLink = coords ? '#/map/' + coords.lat + '/' + coords.lon + '/' + zoom + '/' : null;
		const link = props.maplink || mapLink;

		this.setState( { link: link } );
	},
	onCardClick( ev, item ) {
		const props = this.props;
		setTimeout( ()=> {
			props.router.navigateTo( { pathname: item.url } );
		}, 0 );
		ev.stopPropogation();
	},
	onExitSearch( ev ) {
		this.setState( { inSearchMode: false } );
		ev.stopPropagation();
		return false;
	},
	startSearch( ev ) {
		this.setState( { inSearchMode: true } );
		ev.stopPropagation();
		return false;
	},
	render: function () {
		var url = 'https://maps.wikimedia.org/img/osm-intl,1,0,0,1000x500.png';
		const state = this.state;
		var props = this.props;
		var title = props.title && props.title.replace( /_/g, ' ' );
		if ( props.coordinates ) {
			const coords = props.coordinates;

			if ( coords.lat !== undefined && coords.lon !== undefined ) {
				url = mapo( coords, 1, 1000, 500 );
			}
		}
		var leadBannerStyles = {
			backgroundImage: url ? 'url("' + url + '")' : 'none'
		};

		const titleClassName = props.title && props.title.length > 15 ? 'title-long' : '';

		const bannerClassName = state && state.inSearchMode ? ' banner-search-enabled' : '';
		return (
      <div className={'component-page-banner' + bannerClassName} onClick={this.navigateTo}>
        <div style={leadBannerStyles}>
          <img src="/marker-icon.png" className="map-marker" />
          <Content>
          <h1 className="site-title">
            <img src="/images/someday-map.png" alt={props.siteinfo.title} height="138" width="270" />
            </h1>
            <div className="subtitle">{props.slogan}</div>
            <div onClick={this.startSearch}>
              <h1 key="article-title" className={titleClassName}
                id="section_0"><a href="#/search/">{title}</a></h1>
              <Icon glyph="search" href="#/search/" />
            </div>
          </Content>
        </div>
      </div>
		);
	}
} );

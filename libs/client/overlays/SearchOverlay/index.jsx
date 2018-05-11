import React from 'react';
import createReactClass from 'create-react-class';
import { SearchForm } from 'wikipedia-react-components';

import CardList from './../../components/CardList';

import Overlay from './../Overlay';

import './styles.less';

export default createReactClass( {
	getInitialState() {
		return {
			isSearching: false,
			term: '',
			list: null
		};
	},
	getDefaultProps() {
		return {
			emptyMessage: '',
			loadingMessage: 'Searching',
			api: null,
			lang: 'en'
		};
	},
	showResults( endpoint, project ) {
		var self = this;
		var props = this.props;
		var noResults = (
      <div key="noresults" className="search-information">
        <p>I'm sorry. I can't find the place you are dreaming of.</p>
        <h2>Other options</h2>
        <ul>
          <li><a href="#/explore/">Find on map</a></li>
          <li><a href="/en.wikivoyage/Special:Collections">Browse trips</a></li>
          <li><a onClick={props.closeOverlay}>Never mind</a></li>
        </ul>
      </div>
    );
		var language_proj = this.props.lang + '.' + project;
		clearTimeout( this._timeout );
    // account for fast key presses before firing off an api request
		this._timeout = setTimeout( function () {
			props.api.fetch( endpoint ).then( function ( data ) {
				self.setState( {
					noResults: data.pages.length === 0,
					list: <CardList {...props} language_project={language_proj}
            key="search-overlay-results"
            emptyMessage={noResults}
            apiEndpoint={endpoint} infiniteScroll={false} />
				} );
			} );
		}, 200 );
	},
	onSearch( term ) {
		var endpoint, lowerTerm;
		var lang = this.props.lang;
		var project = this.props.siteinfo.defaultProject;
		this.setState( { term: term } );

		if ( term ) {
			this.setState( { isSearching: true } );
			lowerTerm = term.toLowerCase();
			if ( lowerTerm.indexOf( 'define:' ) === 0 ) {
				project = 'wiktionary';
				term = lowerTerm.split( ':' )[ 1 ];
			}
			endpoint = '/api/search/' + lang + '.' + project + '/' + encodeURIComponent( term );
			this.showResults( endpoint, project );
      // causes redraw of overlay breaking it
      // this.props.router.navigateTo( null, '#/search/' + term, true );
		} else {
			this.setState( { cards: [] } );
		}
	},
	componentDidMount() {
		document.querySelector( '#mw-mf-page-center' ).scrollTop = 0;
	},
	render() {
		var results = this.state && this.state.list ? this.state.list :
      <div key="search-overlay-results" className="search-information">
        <p>Let's find a place that will blow your mind!</p>
      </div>;

		var props = this.props;
		var search = <SearchForm key="search-overlay-input-form"
      placeholder={props.msg( 'search' )}
      defaultValue={props.defaultValue}
      onSearch={this.onSearch} focusOnRender="1" />;

    // FIXME: search-overlay class is added only for consistency with MobileFrontend
		return (
      <Overlay router={props.router}
        siteinfo={props.siteinfo}
        onExit={props.onExit}
        primaryIcon={false}
        fixed={false}
        header={search}
        siteoptions={props.siteoptions}
        className="component-search-overlay search-overlay">
        <div className="overlay-content" key="search-overlay-content">
          {results}
        </div>
      </Overlay>
		);
	}
} );

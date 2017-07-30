import React from 'react'
import ReactDOM from 'react-dom'
import { Icon, SearchForm } from 'wikipedia-react-components'
import createReactClass from 'create-react-class'

import './styles.less'
import './icons.less'

import ChromeHeader from './../ChromeHeader'

import Toast from './../../overlays/Toast'

import initOffline from './../../offline'

const APP_SESSION_KEY = 'app-session'

var globalSession;

// Main component
export default createReactClass({
  getInitialState() {
    return {
      pageviews: 0,
      notification: '',
      checkedLoginStatus: false,
      offlineEnabled: false,
      lang: 'en',
      session: null,
      isOverlayFullScreen: true,
      isOverlayEnabled: false
    }
  },
  getDefaultProps() {
    return {
      lang: 'en',
      isOverlayFullScreen: true,
      isOverlayEnabled: false
    };
  },
  hijackLinks( container ){
    container = container || ReactDOM.findDOMNode( this );

    var links = container.querySelectorAll( 'a' );
    var self = this;

    function navigateTo( ev ) {
      self.onClickInternalLink( ev );
    }

    container.setAttribute( 'data-hijacked-prev', 1 );
    Array.prototype.forEach.call( links, function ( link ) {
      link.addEventListener( 'click', navigateTo );
    } );
  },
  mountOverlay( props ) {
    this.setState( {
      overlay: props.overlay ? React.cloneElement( props.overlay, {
        showNotification: this.showNotification,
        closeOverlay: this.closeOverlay
      } ) : null,
      isOverlayEnabled: props.overlay,
      session: this.state.session,
      isOverlayFullScreen: props.isOverlayFullScreen
    } );
  },
  mountChildren( props, session ) {
    // clone each child and pass them the notifier
    var childProps = typeof document !== 'undefined' ? {
      showNotification: this.showNotification,
      showOverlay: this.showOverlay,
      getLocalUrl: this.getLocalUrl,
      closeOverlay: this.closeOverlay,
      hijackLinks: this.hijackLinks,
      offlineEnabled: this.state.offlineEnabled,
      session: session || this.state.session,
      onClickInternalLink: this.onClickInternalLink
    } : {};
    if ( this.state.pageviews === 0 ) {
      Object.assign( childProps, props.fallbackProps || {} );
    }

    var children = React.Children.map( props.children, ( child ) => React.cloneElement( child, childProps ) );
    this.setState( { children: children, pageviews: this.state.pageviews + 1 } );
  },
  getLocalSession() {
    var localSession = this.props.storage.get( APP_SESSION_KEY );
    localSession = localSession === 'false' ? null : JSON.parse( localSession );
    if ( localSession && localSession.timestamp ) {
      // is it greater than 1 hours old?
      if ( ( new Date() - new Date( localSession.timestamp ) ) / 1000 > 60 * 60 ) {
        localSession = null;
      }
    } else if ( localSession && !localSession.timestamp ) {
      localSession = null;
    }
    return localSession;
  },
  mount( props ) {
    if ( typeof document !== 'undefined' ) {
      this.mountOverlay( props );

      var localSession = this.getLocalSession();
      if ( !this.state.session ) {
        if ( localSession ) {
          // load session from local storage
          this.setState( { session: localSession } );
          this.mountChildren( props, localSession );
        } else {
          this.login().then(()=>this.mountChildren( props ));
        }
      } else {
        this.mountChildren( props );
      }
    } else {
      this.mountChildren( props );
    }
  },
  componentWillReceiveProps( nextProps ) {
    this.mount( nextProps );
  },
  componentWillMount() {
    this.mount( this.props );
  },
  login() {
    var self = this;
    if ( !globalSession ) {
      globalSession = this.props.api.fetch( '/auth/whoamithistime', {
          credentials: 'include'
      } );
    }
    return globalSession.then( function ( session ) {
      // cache for next session
      session.timestamp = new Date();
      self.props.storage.set( APP_SESSION_KEY, JSON.stringify( session ) );
      self.setState( { session: session } );
    } ).catch( function () {
      self.props.storage.set( APP_SESSION_KEY, 'false' );
      self.setState( { session: false } );
    } );
  },
  clearSession() {
    this.props.storage.remove( APP_SESSION_KEY );
  },
  renderCurrentRoute() {
    var path = window.location.pathname;
    var hash = window.location.hash;
    var route = this.props.router.matchRoute( path, hash,
      Object.assign( {}, this.props ) );
    this.mount( route );
  },
  componentDidMount() {
    var showNotification = this.showNotification;
    var props = this.props;
    var msg = this.props.msg;
    var self = this;

    if ( this.props.offlineVersion ) {
      initOffline( function ( updateFound ) {
        self.setState( { offlineEnabled: true } );
        if ( updateFound ) {
          showNotification( msg( 'offline-ready' ) );
        }
      } );
    }
    if ( 'onpopstate' in window ) {
      window.onpopstate = this.renderCurrentRoute;
      props.router.on( 'onpushstate', this.renderCurrentRoute );
      props.router.on( 'onreplacestate', this.renderCurrentRoute );
    }
  },
  showOverlay( overlay ) {
    this.setState( {
      overlay: overlay,
      isOverlayEnabled: true,
      isOverlayFullScreen: false
    } );
  },
  onClickInternalLink( ev ) {
    var href, parts, match, title, path;
    var link = ev.currentTarget;
    var childNode = link.firstChild;
    var props = this.props;
    var allowForeignProjects = props.siteoptions.allowForeignProjects;

    if ( childNode && childNode.nodeName === 'IMG' ) {
      href = link.getAttribute( 'href' ) || '';
      match = href.match( /\.\/File\:(.*)|^File\:(.*)$/ );
      if ( match ) {
        ev.preventDefault();
        ev.stopPropagation();
        path = match[1] || match[2];
        props.router.navigateTo( { hash: '#/media/' + path } );
      }
    } else {
      href = link.getAttribute( 'href' ) || '';
      title = link.getAttribute( 'title' ) || '';

      if ( href.substr( 0, 5 ) !== '/auth' ) {
        if ( href.indexOf( '//' ) === -1 ) {
          parts = href.split( '?' );
          props.router.navigateTo( {
            pathname: parts[0],
            search: parts[1]
          }, title );
          ev.preventDefault();
        } else if ( allowForeignProjects ){
          props.supportedProjects.forEach( function( project ) {
            var reg = new RegExp( '\/\/([a-z\-]*)\.' + project + '\.org\/wiki\/(.*)|\/\/' + project + '\.wikimedia\.org\/wiki\/(.*)|\/\/' );
            var m = href.match( reg );
            if ( m && m[1] && m[2] ) {
              props.router.navigateTo( {
                pathname: '/' + m[1] + '.' + project + '/' + m[2]
              }, m[2] );
              ev.preventDefault();
            } else if ( m && m[3] ) {
              props.router.navigateTo( {
                pathname: '/' + props.lang + '.' + project + '/' + m[3]
              }, m[2] );
              ev.preventDefault();
            }
          } );
        }
      }
    }
  },
  closeOverlay() {
    // If an overlay is open
    if ( this.state.isOverlayEnabled ) {
      this.setState( { isOverlayEnabled: false } );
      if ( window.location.hash && window.location.hash !== '#' ) {
        window.location.hash = '#';
      }
    }
    this.setState( { notification: null } );
  },
  closePrimaryNav(){
    this.closeOverlay();
  },
  showNotification( msg ) {
    var self = this;
    this.setState( {
      notification: msg
    } );
    clearTimeout( this.pendingToast );
    this.pendingToast = setTimeout( function () {
      self.setState( {
        notification: null
      } );
    }, 5000 );
  },
  onClickSearch(){
    this.props.router.navigateTo( '#/search' );
  },
  getLocalUrl( title, params ) {
    var source = this.props.language_project || this.props.lang + '/wiki';
    title = title ? encodeURIComponent( title ).replace( '%3A', ':' ) : '';
    params = params ? '/' + encodeURIComponent( params ).replace( /%2F/g, '/' ) : '';

    return '/' + source + '/' + title + params;
  },
  render(){
    var props = this.props;
    var state = this.state;
    var session = this.state.session;
    var username = session ? session.username : '~your device';
    var search = (<SearchForm msg={this.props.msg}
      placeholder={props.msg( 'search' )} key="chrome-search-form"
      language_project={props.language_project}
      onClickSearch={this.onClickSearch} />);

    var navigationClasses = this.state.isMenuOpen ?
      'primary-navigation-enabled navigation-enabled' : '';

    var toast, secondaryIcon,
      overlay = this.state.isOverlayEnabled ? this.state.overlay : null;

    if ( overlay ) {
      navigationClasses += this.state.isOverlayFullScreen ? 'overlay-enabled' : '';
    }

    if ( this.state.notification ) {
     toast = <Toast>{this.state.notification}</Toast>;
    }

    secondaryIcon = [
      <Icon glyph="search" onClick={this.onClickSearch}/>,
      secondaryIcon
    ];

    if ( state.offlineEnabled ) {
      secondaryIcon.push(
        <Icon glyph='mf-collections' key="offline-icon"
          onClick={this.onClickInternalLink}
          href={'/' + props.language_project + '/Special:Collections/by/' + username}/>
      );
    } else if ( secondaryIcon.length === 0 ) {
      secondaryIcon = null;
    }

    return (
      <div id="mw-mf-viewport" className={navigationClasses}
        lang={this.props.lang} dir='ltr'>
        <div id="mw-mf-page-center" onClick={this.closePrimaryNav}>
          <ChromeHeader {...props}
            includeSiteBranding={true}
            search={search} secondaryIcon={secondaryIcon}/>
          {this.state.children}
        </div>
        { overlay }
        { toast }
        <svg>
          <filter id="filter-normal-icon" colorInterpolationFilters="sRGB"
            x="0" y="0" height="100%" width="100%">
            <feColorMatrix type="matrix"
              values="0.33 0    0    0 0
                      0    0.35 0    0 0
                      0    0    0.36 0 0
                      0    0    0    1   0" />
          </filter>
          <filter id="filter-progressive-icon" colorInterpolationFilters="sRGB"
            x="0" y="0" height="100%" width="100%">
            <feColorMatrix type="matrix"
              values="0.2 0   0   0 0
                      0   0.4 0   0 0
                      0   0   0.8 0 0
                              0   0   0   1   0" />
          </filter>
        </svg>
      </div>
    )
  }
} );

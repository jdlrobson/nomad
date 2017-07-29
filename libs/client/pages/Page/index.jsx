import React from 'react'
import createReactClass from 'create-react-class'

import { Button, ErrorBox, IntermediateState } from 'wikipedia-react-components';

import TableOfContents from './TableOfContents'

import ImageSlideshow from './../../components/ImageSlideshow'
import ThreeColumnLayout from './../../components/ThreeColumnLayout';
import ImageBubbles from './../../components/ImageBubbles'
import Climate from './../../components/Climate'
import CardList from './../../components/CardList'
import Infobox from './../../components/Infobox'

import GoNext from './../../components/GoNext'

import Content from './../../components/Content'

import PagePreviewOverlay from './../../overlays/PagePreviewOverlay'

import WikiPage from './../WikiPage'
import UserPage from './../UserPage'

import { getSections } from './../../react-helpers'

import './styles.less'
import './tablet.less'

const OFFLINE_ERROR_MESSAGE = 'You need an internet connection to view this page';
const NOT_FOUND_MESSAGE = 'This page does not exist.';

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
      jsEnabled: false,
      fragment: null,
      action: 'view',
      isExpanded: false,
      lead: null,
      orientation: [],
      vcards: [],
      user: {},
      errorMsg: NOT_FOUND_MESSAGE,
      error: false,
      remaining: null
    };
  },
  launchOverlay( ev, item ) {
    var props = this.props;
    ev.preventDefault();
    this.props.showOverlay( <PagePreviewOverlay
      api={props.api}
      language_project={props.language_project}
      onClickInternalLink={props.onClickInternalLink}
      getLocalUrl={props.getLocalUrl} item={item} /> );
  },
  // You want to load subscriptions not only when the component update but also when it gets mounted.
  componentDidMount(){
    var fragment = window.location.hash;
    this.load();
    if ( fragment ) {
      this.setState( { fragment: fragment.replace(/ /i, '_' ).substr( 1 ) } );
    }
    this.setState( { jsEnabled: true } );
  },
  componentWillUnmount() {
    this.setState( { lead: null } );
  },
  componentWillMount() {
    this.setState( this.props );
    this.checkExpandedState();
  },
  componentWillReceiveProps(nextProps){
    this.load( nextProps.title, nextProps.lang, nextProps.revision );
    this.setState( { action: nextProps.query ? nextProps.query.action : 'view' } );
  },
  checkExpandedState() {
    var expandQuery = this.props.query && this.props.query.expanded;
    if ( expandQuery || this.props.siteoptions.expandArticlesByDefault ) {
      this.setState( { isExpanded: true } );
    }
  },
  load( title, lang, revision ) {
    var source, project,
      rev = revision || this.props.revision,
      self = this;

    title = title || this.props.title;
    lang = lang || this.props.lang;
    project = this.props.project;
    source = project ? lang + '.' + project : lang;

    this.setState( { action: this.props.action || 'view' } );
    this.checkExpandedState();
    this.props.api.getPage( title, source, null, rev ).then( function ( data ) {
      self.setState(data);
      self.setMap();
    } ).catch( function ( error ) {
      var msg = error.message.toString();
      if ( msg.indexOf( 'Failed to fetch' ) > -1 ) {
        msg = OFFLINE_ERROR_MESSAGE;
      } else if ( msg.indexOf( 'Not Found' ) > -1 ) {
        msg = NOT_FOUND_MESSAGE;
      }
      self.setState({ error: true, errorMsg: msg });
    } );
  },
  expand() {
    var qs = window.location.search;
    qs = !qs ? qs + '?expanded=1' : qs + '&expanded=1';
    this.props.router.navigateTo( {
      pathname: window.location.pathname,
      search: qs
    }, '', true );
    this.setState({
      isExpanded: true
    } );
  },
  getSections() {
    var props = this.props;
    var remaining = this.state.remaining || this.props.remaining || {};
    var allSections = remaining.sections || [];
    if ( this.isOrientationView() ) {
      allSections = this.state.orientation || [];
    } else if ( this.isLogisticsView() ) {
      allSections = this.state.logistics || [];
    }

    var sections = getSections( allSections, props, this.state.fragment );

    return sections;
  },
  getPageAction() {
    return this.state.action || this.props.action;
  },
  isOrientationView() {
    return this.getPageAction() === 'orientation';
  },
  isLogisticsView() {
    return this.getPageAction() === 'logistics';
  },
  switchView( ev ) {
    var action = ev.currentTarget.getAttribute( 'data-action' );
    this.setState( { action: action } );
    this.props.router.navigateTo( {
      pathname: window.location.pathname,
      search: 'action=' + action
    }, this.props.title + ' (' + action + ')', true );
    ev.preventDefault();
  },
  isDefaultView() {
    const isOrientationView = this.isOrientationView();
    const isLogisticsView = this.isLogisticsView();
    return !isOrientationView && !isLogisticsView;
  },
  getTabs( lead ){
    var tabs;
    var props = this.props,
      isOrientationView = this.isOrientationView(),
      isLogisticsView = this.isLogisticsView(),
      isDefaultView = this.isDefaultView(),
      baseUrl = props.getLocalUrl();

    const blankPage = ( !lead && ( !lead.text && !lead.paragraph) );

    if ( isDefaultView && blankPage ) {
      return [];
    }

    // Tabs are not shown on content from wikipedia
    if ( lead.project_source ) {
      tabs = [];
    } else {
      tabs = [
        <a href={baseUrl + props.title }
          key="tab-default"
          className={isDefaultView ? 'active' : '' }
          data-action="view"
          onClick={this.switchView}>1</a>,
        <a href={baseUrl + props.title + '?action=logistics'}
          key="tab-logistics"
          className={isLogisticsView ? 'active' : '' }
          data-action="logistics"
          onClick={this.switchView}>2</a>,
        <a href={baseUrl + props.title + '?action=orientation'}
          key="tab-orientation"
          className={isOrientationView ? 'active' : '' }
          data-action="orientation"
          onClick={this.switchView}>3</a>
      ];
    }

    return tabs;
  },
  getFooter() {
    return null;
  },
  getBlankLeadSection( lead ) {
    return Object.assign( {}, lead, {
      text: '',
      paragraph: ''
    });
  },
  guessZoom(lead) {
    var zoom = lead.infobox ? 4 : 12;
    var desc = lead.description || '';
    
    if ( typeof desc === 'string' ) {
      if ( desc.indexOf( 'continent' ) > -1 || desc.indexOf( 'region' ) > -1 ) {
        zoom = 2;
      } else if ( desc.indexOf( 'autonomous community' ) > -1 ) {
        zoom = 6;
      } else if ( desc.indexOf( 'archipelago' ) > -1 ) {
        zoom = 10;
      } else if ( desc.indexOf( 'city' ) > -1 ) {
        zoom = 12;
      }
    }
    return zoom;
  },
  setMap(){
    const props = this.props;
    const lead = this.state.lead;
    const coords = lead && lead.coordinates || {};
    this.props.setBannerProps( {
      coordinates: coords,
      maplink: lead.maplink,
      zoom: coords.zoom ? coords.zoom : lead ? this.guessZoom(lead) : 1,
      displaytitle: lead.displaytitle,
      slogan: props.slogan || 'We will see'
    })
  },
  render(){
    var lead = this.state.lead || this.props.lead || {};
    if ( this.state && this.state.error ) {
      const error = <ErrorBox key="article-error" msg={this.state.errorMsg} />;
      return (
        <ThreeColumnLayout col2={error} />
      );
    } else if ( !lead || !lead.sections ) {
      const loader = (
        <Content>
          <IntermediateState key="article-loading" msg="Loading page"/>
        </Content>
      );
      return (
        <WikiPage {...this.props} body={loader}/>
      );
    } else {
      return this.renderPage();
    }
  },
  getGoNextSections(lead, session, foreign) {
    const col1 = [];
    const props = this.props;
    const coords = lead.coordinates || {};
    const lang = props.lang;
    const title = props.title;
    let endpoint;
    let page = this;

    if ( lead.destinations && lead.destinations.length ) {
      lead.destinations.forEach( function ( section ) {
        let editDestinationsLink;
        const id = section.id;
        if ( session && !foreign ) {
          editDestinationsLink = <a key={"editor-link-" + id}
            className="editor-link" href={"#/editor/"+ id}>Edit original source</a>
        }
        col1.push(
          <div key={'page-destinations-div-' + id}>
            <h2
            dangerouslySetInnerHTML={ {__html: section.line }} key={"section-heading-" + id}></h2>
            <CardList key={"page-destinations-" + id }
              {...props} pages={section.destinations} onCardClick={page.launchOverlay} />
            {editDestinationsLink}
          </div>
        );
      } );
    } else {
      if ( coords && !lead.isRegion && !lead.isCountry && !lead.isSubPage &&
        // Don't show Nearby on sights..
        !foreign
      ) {
        endpoint = '/api/voyager/nearby/' + props.language_project + '/' + coords.lat + ',' + coords.lon + '/exclude/' + title;
        col1.push(
          <h2 key="nearby-widget-heading">Nearby</h2>
        );
        col1.push(
          <GoNext apiEndpoint={endpoint} api={props.api} lang={lang}
            session={session}
            language_project={props.language_project}
            foreign={lead.project_source}
            onCardClick={this.launchOverlay}
            key="nearby-widget-card-list" section={lead.destinations_id}
            router={props.router} />
        );
      }
    }
    return col1;
  },
  renderPage(){
    var leadHtml, toc,
      wikiPageProps = {},
      isRegion,
      props = this.props,
      session = props.session,
      siteOptions = props.siteoptions,
      sections = [],
      secondaryActions = [],
      title = this.props.title,
      lead = Object.assign( {}, this.state.lead || this.props.lead || {} ),
      ns = lead && lead.ns || 0,
      sights = lead.sights ? lead.sights : [],
      foreign = lead.project_source,
      footer = this.getFooter( lead ),
      remainingSections = this.getSections();

    leadHtml = lead.sections && lead.sections.length ? lead.sections[0].text : undefined;
    lead.text = leadHtml;
    if ( !lead.displaytitle ) {
      lead.displaytitle = decodeURIComponent( title.replace( /_/gi, ' ' ) );
    }

    if ( leadHtml !== undefined ) {
      if ( this.state.isExpanded ) {
        toc = <TableOfContents sections={remainingSections} />;
        if ( remainingSections.length && siteOptions.includeTableOfContents ) {
          sections.push( toc );
        }
        sections = sections.concat( remainingSections );
      } else {
        sections.push(<Button key="article-expand" label="Expand" onClick={this.expand} />);
      }
    } else {
      if ( this.state.error ) {
        sections.push( <ErrorBox msg={this.state.errorMsg} key="article-error" /> );
        sections.push( (
          <p key="404-search">Why not search for <a
            onClick={this.props.onClickInternalLink}
            href={props.getLocalUrl( 'Special:Search', title )}>{title}</a>?</p>
        ) );
      } else {
        sections.push( <IntermediateState key="article-loading" /> );
      }
    }

    var col1 = [];
    var col3 = [];
    if ( lead ) {
      col3 = [];
    }

    if ( lead && lead.images && lead.images.length ) {
      col3.push( <ImageSlideshow images={lead.images} router={this.props.router} key="image-slideshow" /> );
    }

    if ( this.isDefaultView() ) {
      if ( lead.infobox ) {
        col3.push( <Infobox {...this.props} text={lead.infobox} key="page-infobox" /> );
      }
      if ( lead.climate ) {
        col3.push( <Climate key="page-climate" climate={lead.climate} /> );
      }
    }

    if ( this.isDefaultView() ) {
      col1 = col1.concat( this.getGoNextSections( lead, session, foreign ) );
    }

    lead.text = leadHtml;
    isRegion = lead.isRegion;

    if ( this.isOrientationView() ) {
      lead = this.getBlankLeadSection( lead );
      if ( lead.maps && lead.maps.length ) {
        col3.push(
          <div>
            <h2 key="map-images-section-heading">Maps</h2>
            <ImageBubbles images={lead.maps} router={props.router} key="map-images-bubbles" />
          </div>
        );
      }
    } else if ( this.isLogisticsView() ) {
      lead = this.getBlankLeadSection( lead );
    }

    // Show sights on both orientation and plan view
    if ( !this.isLogisticsView() ) {
      if ( sights.length ) {
        col1.push(
          <div key="page-sights">
            <h2 key="sights-section-heading">Sights</h2>
            <CardList key="page-sights"
              {...props} pages={sights} language_project={'en.wikipedia'} onCardClick={this.launchOverlay} />
          </div>
        );
      }
    } else {
      if ( lead.airports.length ) {
        col1.push(
          <div>
            <h2 key="airport-section-heading">Airports</h2>
            <ul className="get-around" key="get-around-airport-list">{
              lead.airports.map( function ( code, i ) {
                return (
                  <li key={'airport-'+i}>
                    <a href={'https://www.kayak.com/explore/' + code}
                      className="external">{code}</a></li>
                );
              } )
            }</ul>
          </div>
        )
      }
    }

    if ( !this.isDefaultView() ) {
      if ( lead.transitLinks.length ) {
        col3.push(
          <div>
            <h2 key="transit-section-heading">Get around</h2>
            <ul className="get-around" key="get-around-list">{
              lead.transitLinks.map( function ( link, i ) {
                return (
                  <li key={'transit-'+i}><a href={link.href} className="external">{link.text}</a></li>
                );
              } )
            }</ul>
          </div>
        )
      }
    }

    if ( sections.length === 0 && !lead.text && !lead.paragraph ) {
      sections = [
        <div key="page-stub" className="lead-paragraph">We don't have any information for this place.</div>
      ];
    } else {
      const projectLabel = foreign ? 'Wikipedia' : 'Wikivoyage';
      const license = props.siteinfo.license || {};
      sections.push(
        <footer key="license" className="license">Content derived from <a href={this.props.desktopUrl}>the {projectLabel} article</a> which is available under <a className="external" rel="nofollow" href={license.url}>{license.name}</a> unless otherwise noted.</footer>
      )
    }

    wikiPageProps = Object.assign( {}, this.props, {
      lead: lead,
      toc: toc,
      body: sections,
      secondaryActions: secondaryActions,
      footer: footer
    } );

    if ( ns === 2 ) {
      return <UserPage {...wikiPageProps} />;
    } else {
      Object.assign( wikiPageProps, {
        className: `view-${this.getPageAction()}`,
        tabs: this.getTabs(lead),
        column_one: col1,
        column_three: col3,
        key: 'article-tab-' + this.getPageAction()
      } );
      return (
        <WikiPage {...wikiPageProps}/>
      );
    }
  }
} );

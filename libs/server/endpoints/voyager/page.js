import domino from 'domino'

import page from './../page'
import mwApi from './../mwApi';
import addProps from './../prop-enricher'

import cleanVcards from './clean-vcards'
import extractSightsFromText from './extract-sights-from-text'
import { extractElements, isNodeEmpty, cleanupScrubbedLists, extractText, cleanupEmptyNodes } from './domino-utils'
import extractDestinations from './extract-destinations'
import extractImages from './extract-images'
import climateExtraction from './extract-climate'
import flattenElements from './flatten-elements'
import addSights from './add-sights'
import thumbnailFromTitle from './../collection/thumbnail-from-title'
import undoLinkFlatten from './undo-link-flatten'
import extractAirports from './extract-airports'

const ITEMS_TO_DELETE = [
  // should be handled upstream (https://gerrit.wikimedia.org/r/370371)
  '.dablink',
  '.mw-kartographer-maplink',
  '.pp_infobox',
  '.listing-metadata',
  // otherwise you'll have destination links from the outline box.
  // e.g. https://en.wikivoyage.org/wiki/Dudinka
  '.article-status',
  '.noprint',
  '.ambox',
  '.mbox-image',
  // Hatnotes - haven't worked a better way to deal with them yet.
  'dl',
  '.mbox-text',
  '.scribunto-error',
  '.mw-kartographer-container'
];

// Haven't worked out what to do with these yet.
const sectionBlacklist = [ 'Learn', 'Work', 'Stay safe', 'Stay healthy',
  'Cope', 'Respect', 'Connect',
  // Relying on our climate widget. For countries e.g. New Zealand
  // let's try and pull out key words.
  'Climate',
  // TODO: Extract dates and show per month e.g. New Zealand
  'Holidays',
  // TMI. e.g. New Zealand
  'People',
  'Time zones',
  'Politics',
  'History' ];

const TITLE_BLACKLIST = [ 'Travel topics' ];

function flattenLinksInHtml( html ) {
  const window = domino.createWindow( html );
  flattenElements( window.document, 'a' );
  return window.document.body.innerHTML;
}

function removeNodes( html, selector ) {
  html = cleanupEmptyNodes( html );
  var ext = extractElements( html, selector );
  return cleanupScrubbedLists( ext.html );
}

export default function ( title, lang, project, revision ) {
  project = 'wikivoyage';
  const warnings = [];

  // FIXME: This can be done in mobile content service
  function addBannerAndCoords( data ) {
    var width;
    var params = {
      redirects: '',
      prop: 'coordinates|pageprops|pageassessments',
      pageprops: 'wpb_banner',
      titles: title
    };
    return mwApi( lang, params, data.lead.project_source || project ).then( function ( propData ) {
      var page = propData.pages[0];
      var title;

      if ( page && page.coordinates ) {
        data.lead.coordinates = page.coordinates.length ? page.coordinates[0] : page.coordinates;
      } else if ( page && page.pageassessments && ( page.pageassessments.topic || page.pageassessments.phrasebook ) ) {
        throw new Error( '404EXCLUDE: This is a topic/phrasebook and not supported by the app.' );
      } else if ( TITLE_BLACKLIST.indexOf( page.title ) > -1 ) {
        throw new Error( '404EXCLUDE: Blacklisted page' );
      }

      data.lead.images = [];
      if ( page && page.pageprops ) {
        title = page.pageprops.wpb_banner;
        const lcBannerTitle = title && title.toLowerCase();
        width = 800;
        if ( title && lcBannerTitle.indexOf( ' default banner' ) === -1 &&
          lcBannerTitle.indexOf( 'pagebanner default.jpg' ) === -1
        ) {
          data.lead.images = [{
            caption: '',
            isBanner: true,
            href: './File:' + title,
            width: width,
            height: width / 7,
            src: thumbnailFromTitle( title, width )
          }];
          data.lead.media.unshift( 'File:' + title );
        }
      }
      return data;
    } );
  }

  function addNextCards( data, pages, isRegion ) {
    var props = [ 'pageimages', 'pageterms' ];
    if ( !isRegion ) {
      props.push( 'coordinates' );
    }
    return addProps( pages.slice( 0, 50 ), props,
      lang, project,
      { codistancefrompage: data.lead.normalizedtitle || data.lead.displaytitle || title }
    ).then( function () {
        var destinations = [];
        data.remaining.sections.forEach( function ( section ) {
          if ( section.destinations && section.destinations.length ) {
            destinations.push( Object.assign( {}, section, { text: '' } ) );
          }
          delete section.destinations;
        } );
        data.lead.destinations = destinations;
        return data;
      } );
  }

  function extractWarnings( section ) {
    var ext = extractElements( section.text, '.pp_warningbox' );
    if ( ext.extracted.length ) {
      section.warnings = '<table> ' + ext.extracted[0].innerHTML + '</table>';
    }
    section.text = ext.html;
    return section;
  }

  function extractWarningsAndInfobox( section ) {
    extractWarnings( section )
    var ext = extractElements( section.text, 'table' );
    if ( ext.extracted.length ) {
      section.infobox = flattenLinksInHtml( `<table>${ext.extracted[0].innerHTML}</table>` );
    }
    section.text = ext.html;
    return section;
  }

  function isSectionEmpty( section ) {
    var window = domino.createWindow( '<div>' + section.text + '</div>' ),
      document = window.document;

    return isNodeEmpty( document.body );
  }

  function extractMaps( section ) {
    var map;
    var ext = extractElements( section.text, '.mw-kartographer-map' );
    if ( ext.extracted[0] ) {
      map = ext.extracted[0];
      section.text = ext.html;
      section.map = {
        lat: map.getAttribute( 'data-lat' ),
        lon: map.getAttribute( 'data-lon' ),
        overlays: map.getAttribute( 'data-overlays' )
      };
    }

    return section;
  }

  function isEmptySectionArray( sections ) {
    var isEmpty = true;
    sections.forEach( function ( section ) {
      if ( !section.isEmpty ) {
        isEmpty = false;
      }
    } );
    return isEmpty;
  }

  function cleanup( section ) {
    section.text = cleanVcards( removeNodes( section.text, ITEMS_TO_DELETE.join( ',' ) ) );
    return section;
  }

  function voyager( data ) {
    return addBannerAndCoords( data ).then( function ( data ) {
      var newSection, climate;
      var isRegion = false;
      var isCountry = false;
      var sections = [];
      var isSubPage = data.lead.displaytitle.indexOf( '/' ) > -1;
      var cardSectionTocLevel;
      var blacklist = [];
      var allImages = [];
      var logistics = [];
      var sights = [];
      var allDestinations = [];
      var allMaps = [];
      var curSectionLine;
      var lcCurSectionLine;
      var curSectionSubheadingLine;
      var orientation = [];
      var itineraries = [];
      const transitLinks = [];
      const _seen = {};
      let climateSection;
      let understandSection;
      let airports = [];

      const SIGHT_HEADINGS = [ 'See', 'See & Do', 'Do' ];
      const DESTINATION_BLACKLIST = [ 'Understand', 'Talk', 'See' ];
      const EXPLORE_HEADINGS = [ 'Regions', 'Districts', 'Countries', 'Get around', 'Listen',
        'Eat and drink', 'Counties', 'Prefectures', 'Fees/Permits', 'See',
        'Buy', 'Eat', 'Drink', 'Do', 'Smoke' ];

      const TRANSIT_LINK_HEADINGS = [ 'by train', 'by bus', 'by boat' ];
      const COUNTRY_SECTION_HEADINGS = [ 'regions' ];
      const REGION_SECTION_HEADINGS = [ 'cities', 'other destinations', 'cities and towns',
        'towns & villages', 'towns &amp; villages', 'the islands', 'islands',
        'cities / villages', 'nearby islands',
        'destinations', 'towns', 'countries and territories' ];

      var p = { text: data.lead.paragraph };
      cleanup( p );
      data.lead.paragraph = p.text;
      data.lead.paragraph_text = extractText( p.text );
      newSection = cleanup( data.lead.sections[0] );
      newSection = extractImages( newSection );
      newSection = extractMaps( newSection );
      newSection = extractWarningsAndInfobox( newSection );
      allImages = allImages.concat( newSection.images );
      allMaps = allMaps.concat( newSection.maps );
      // promote infobox upwards
      data.lead.warnings = newSection.warnings;
      if ( !data.lead.infobox ) {
        data.lead.infobox = newSection.infobox;
      }
      delete newSection.infobox;
      delete newSection.warnings;
      delete newSection.images;
      delete newSection.maps;

      data.lead.sections[0].text = cleanupEmptyNodes( data.lead.sections[0].text );
      data.remaining.sections.forEach( function ( section ) {
        section = extractWarnings( section );
        // reset Go next section
        if ( cardSectionTocLevel !== undefined && section.toclevel <= cardSectionTocLevel ) {
          cardSectionTocLevel = undefined;
        }
        if ( section.toclevel === 1 ) {
          curSectionLine = section.line;
          lcCurSectionLine = curSectionLine.toLowerCase();
          curSectionSubheadingLine  = undefined;
        }
        if ( section.toclevel === 2 ) {
          curSectionSubheadingLine = section.line;
        }

        if ( [ 'Itineraries' ].indexOf( section.line ) > -1 ) {
          itineraries = section;
          return;
        }

        var lcLine = section.line.toLowerCase();
        if ( lcCurSectionLine === 'get in' ) {
          airports = airports.concat( extractAirports( section.text ) );
        }
        if ( SIGHT_HEADINGS.indexOf( curSectionLine ) > -1 ) {
          const doc = domino.createDocument( section.text );
          sights = sights.concat( extractSightsFromText( doc ) );
          section.text = doc.body.innerHTML;
          if ( SIGHT_HEADINGS.indexOf( section.line ) === -1 ) {
            // Maybe the heading itself is a place. e.g. Dali
            sights.push( { name: section.line } );
          }
        }

        if ( TRANSIT_LINK_HEADINGS.indexOf( lcLine ) > -1 ) {
          extractElements( section.text, 'a.external', true ).extracted.forEach( ( a ) => {
            const href = a.getAttribute( 'href' );
            // only list URLs
            if ( href.indexOf( 'http' ) > -1 && !_seen[href] ) {
              _seen[href] = true;
              transitLinks.push( {
                href: href,
                text: a.textContent || href.replace( 'www.', '' ).replace( /https?:\/\/([^\.]*).*/, '$1' )
              } );
            }
          } );
        }

        if ( REGION_SECTION_HEADINGS.indexOf( lcLine ) > -1  ) {
          isRegion = true;
        }
        if ( COUNTRY_SECTION_HEADINGS.indexOf( lcLine ) > -1 ) {
          isCountry = true;
        }
        if (
          ( isRegion || lcLine === 'go next' ) &&
          ( section.toclevel === 1 || section.toclevel === 2 )
        ) {
          data.lead.destinations_id = section.id;
          cardSectionTocLevel = section.toclevel;
        }

        if ( blacklist.indexOf( section.line ) === -1 ) {
          section = cleanup( section );

          // Images are vital in these sections so do not pull them out
          if ( [ 'Regions', 'Districts' ].indexOf( section.line ) === -1 ) {
            section = extractImages( section );
            allImages = allImages.concat( section.images );
            section = extractMaps( section );
            allMaps = allMaps.concat( section.maps );
            delete section.images;
            delete section.maps;
          }

          if ( lcLine === 'get in' ) {
            airports = airports.concat( extractAirports( section.text ) );
          }

          section = climateExtraction( section );
          if ( lcLine === 'climate' ) {
            climateSection = section.id;
          }
          if ( lcLine === 'understand' ) {
            understandSection = section.id;
          }
          if ( section.climate ) {
            climate = section.climate;
            delete section.climate;
          }

          if ( cardSectionTocLevel !== undefined && !isSubPage ) {
            if ( DESTINATION_BLACKLIST.indexOf( curSectionLine ) === -1 ) {
              section.text = undoLinkFlatten( section.text );
              section = extractDestinations( section, title );

              if ( section.destinations ) {
                if ( section.line !== curSectionLine && curSectionLine === 'Go next' ) {
                  // On pages like Wellington, go next has subheadings
                  section.line = `${curSectionLine} (${section.line})`
                }
                allDestinations = allDestinations.concat( section.destinations );
              }
            }
          }

          section.text = cleanupEmptyNodes( section.text );
          if ( SIGHT_HEADINGS.concat( [ 'Sleep', 'Get in', 'Go next' ] ).indexOf( curSectionLine ) > -1 ) {
            // Don't list things here.
            // We will list them in a separate widget
            section.text = removeNodes( section.text, 'ul,ol' );
          }

          if ( EXPLORE_HEADINGS.indexOf( curSectionLine ) > -1 ) {
            // Don't list things here. You're not Tripadvisor/Foursquare/Yelp
            if ( ['Eat', 'Drink', 'Buy'].indexOf( curSectionLine ) > -1 ) {
              section.text = removeNodes( section.text, 'ul,ol' );
            }
            orientation.push( section );
          } else if ( [
            'Get in', 'Sleep', 'Talk' ].indexOf( curSectionLine ) > -1
          ) {
            logistics.push( section );
          } else if ( sectionBlacklist.indexOf( curSectionLine ) === -1 &&
            sectionBlacklist.indexOf( curSectionSubheadingLine ) === -1
          ) {
            sections.push( section );
          }
        }
        section.line = flattenLinksInHtml( section.line );
        section.isEmpty = isSectionEmpty( section );
        if ( section.isEmpty ) {
          section.text = '';
        }
      } );
      // if we think it's a country it's not a region.
      // Pages like Panama may have false positives.
      if ( isCountry ) {
        isRegion = false;
      }
      data.remaining.sections = sections;
      data.lead.images = data.lead.images.concat( allImages );
      data.lead.maps = allMaps;

      data.lead.climate = climate;
      data.lead.isRegion = isRegion;
      data.lead.isCountry = isCountry;
      data.lead.airports = airports;
      data.lead.climateSection = climateSection || understandSection;
      data.lead.transitLinks = transitLinks;
      data.itineraries = itineraries;
      if ( !isRegion ) {
        data.lead.sights = sights;
      }
      data.lead.isSubPage = isSubPage;

      if ( !isEmptySectionArray( logistics ) ) {
        data.logistics = logistics;
      }

      // this is inferior and provided by mcs
      delete data.lead.geo;

      if ( !isEmptySectionArray( orientation ) ) {
        data.orientation = orientation;
      }

      // add warnings
      data.warnings = warnings;

      if ( allDestinations.length || sights.length ) {
        return addNextCards( data, allDestinations, isRegion )
          .then( ( data ) => {
            // Values for country based on China.
            // Note this will give false positives for countries.
            // e.g. Kaliningrad will not show up for Russia
            // Cathedral of Notre Dame will show up for Luxembourg
            // Ideally we'd be able to verify the parent country
            return addSights( data, isCountry ? 8000 : 140 );
          } );
      } else {
        return data;
      }
    } );
  }

  function transform( json ) {
    if ( json.code ) {
      return json;
    } else if ( json.lead && json.lead.ns > 0 ) {
      return json;
    } else {
      return voyager( json );
    }
  }
  return page( title, lang, project, false, revision ).then( transform )
    .then( function ( page ) {
      if ( !page.code ) {
        const coords = page.lead.coordinates;
        if ( page.lead.images.length < 6 ) {
          var params = {
            prop: 'pageimages',
            generator: 'geosearch',
            ggsradius: '10000',
            ggsnamespace: 6,
            pithumbsize: 400,
            ggslimit: 50,
            ggscoord: `${coords.lat}|${coords.lon}`
          };
          return mwApi( 'en', params, 'commons' ).then( ( query ) => {
            page.lead.images = page.lead.images.concat(
              query.pages.map( ( page ) => {
                const thumb = page.thumbnail;
                return {
                  caption: '',
                  href: `./${page.title.replace( / /g, '_' )}`,
                  src: thumb.source,
                  width: thumb.width,
                  height: thumb.height
                }
              } )
            );
            page.lead.media = page.lead.media.concat(
              query.pages.map( ( page ) => {
                return page.title;
              } )
            );
            return page;
          } ).catch( ()=> {
            return page;
          } )
        }
      }
      return page;
    } )
    .catch( function ( err ) {
    var msg = err && err.msg && err.msg;
    if ( !msg ) {
      msg = err.toString();
    }

    if ( msg && msg.indexOf( '404EXCLUDE' ) > -1 ) {
      throw new Error( '404' );
    // Any other 404s we'll route via wikipedia.org
    } else if ( msg && msg.indexOf( '404' ) === -1 ) {
      throw err;
    }
    return page( title, lang, 'wikipedia' ).then( function ( json ) {
      json.remaining = { sections: [] };
      if ( json.lead ) {
        json.lead.project_source = 'wikipedia';
        // Flatten links to avoid exploration of pages we don't know are relevant
        // to travel.
        json.lead.paragraph = flattenLinksInHtml( json.lead.paragraph );
        json.lead.sections = json.lead.sections.map( ( section ) => {
          section.text = cleanupEmptyNodes( flattenLinksInHtml( section.text ) );
          return section;
        } );
      }
      // Limit to locations otherwise all sorts of subjects will show up from wikipedia.
      // e.g. http://localhost:8142/en.wikivoyage/Love
      if ( !json.code && !json.lead && !json.lead.coordinates ) {
        throw '404';
      }
      return transform( json );
    } );
  } );
}

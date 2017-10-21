import addProps from './../prop-enricher'
import calculateDistance from './calculate-distance'

const aliases = {};

function addAliases( sights ) {
  const numPossibleSights = sights.length;

  sights.forEach( ( sightObj, i ) => {
    const sight = sightObj.name;
    const words = sight.split( ' ' );
    const segments = sight.split( / - / );
    const theLessSight = sight.replace( /[Tt]he /, '' );

    if ( i < numPossibleSights && words.length === 2 ) {
      // if 2 words we also switch them
      // e.g. Castle Coole may be Coole Castle.
      aliases[words[1] + ' ' + words[0]] = sight;
    }
    // e.g. The Eastern States Exposition - "The Big E"
    // on Springfield%20(Massachusetts)
    if ( segments.length === 2 ) {
      aliases[segments[0]] = sight;
      aliases[segments[1]] = sight;
    }
    if ( sight.indexOf( '(' ) > -1 ) {
      aliases[sight.replace( /\(.*\)/, '' ).trim()] = sight;
    }
    if ( theLessSight !== sight ) {
      aliases[theLessSight] = sight;
    }
  } );

  return sights.map( ( sight ) => {
    return sight.name;
  } ).concat( Object.keys( aliases ) );
}
/**
 * @param {Object} data
 * @param {Integer} distance in km to filter by
 */
function addSights( data, distance ) {
  var props = [ 'pageimages', 'pageterms', 'pageprops', 'coordinates' ];
  var landmark = data.lead.coordinates;
  if ( data.lead.sights && landmark ) {
    const lookup = {};
    data.lead.sights.forEach( ( sight ) => {
      lookup[sight.name] = sight;
    } );
    var sights = addAliases( data.lead.sights );
    // dedupe
    const matches = {};
    sights = sights.filter( function ( item ) {
      const key = item.toLowerCase();
      const matched = matches[key];
      matches[key] = true;
      return !matched;
    } );

    return addProps( sights.slice( 0, 50 ), props, 'en', 'wikipedia', {
      ppprop: 'disambiguation'
    } )
      .then( ( sightPages ) => {
        const sightWarnings = {};

        data.lead.sights = sightPages.filter(
          ( page ) => {
            const distFromLandmark = page.coordinates && calculateDistance( page.coordinates, landmark );
            const originalSight = aliases[page.title] || page.title;
            let warnings = sightWarnings[originalSight];
            var isDisambiguation = page.pageprops && page.pageprops.disambiguation !== undefined;
            if ( warnings === undefined ) {
              warnings = [];
            }

            if ( page.missing && warnings ) {
              warnings.push( `sight ${page.title} is missing` );
            } else if ( !distFromLandmark && warnings ) {
              warnings.push( `sight ${page.title} is missing coordinates` );
            } else if ( distFromLandmark > distance && warnings ) {
              warnings.push( `sight ${page.title} is ${distFromLandmark} away` );
            } else if ( isDisambiguation && warnings ) {
              warnings.push( `sight ${page.title} needs disambiguating` );
            } else {
              warnings = false;
            }
            sightWarnings[originalSight] = warnings;
            return !page.missing && !isDisambiguation && page.coordinates &&
              // possibily too generous.. but check how many km away the sight is
              distFromLandmark < distance;
          }
        ).map( ( page ) => {
          const item = lookup[page.title];
          if ( item && item.description ) {
            page.description = item.description;
          }
          return page;
        } )
        // filter all the sights which we found something for
        data.warnings = Object.keys( sightWarnings ).filter( ( key ) => {
          return sightWarnings[key];
        } ).map( ( key ) => {
          return sightWarnings[key];
        } );
        return data;
      } );
  } else {
    return data;
  }
}

export default addSights;

import addProps from './../prop-enricher'
import calculateDistance from './calculate-distance'

/**
 * @param {Object} data
 * @param {Integer} distance in km to filter by
 */
function addSights( data, distance ) {
  const warnings = data.warnings;
  var props = [ 'pageimages', 'pageterms', 'pageprops', 'coordinates' ];
  var landmark = data.lead.coordinates;
  if ( data.lead.sights && landmark ) {
    return addProps( data.lead.sights.slice( 0, 50 ), props, 'en', 'wikipedia', {
      ppprop: 'disambiguation'
    } )
      .then( ( sightPages ) => {
        data.lead.sights = sightPages.filter(
          ( page ) => {
            const distFromLandmark = page.coordinates && calculateDistance( page.coordinates, landmark );
            var isDisambiguation = page.pageprops && page.pageprops.disambiguation !== undefined;
            if ( page.missing ) {
              warnings.push( `sight ${page.title} is missing` );
            } else if ( !distFromLandmark ) {
              warnings.push( `sight ${page.title} is missing coordinates` );
            } else if ( distFromLandmark > distance ) {
              warnings.push( `sight ${page.title} is ${distFromLandmark} away` );
            } else if ( isDisambiguation ) {
              warnings.push( `sight ${page.title} needs disambiguating` );
            }
            return !page.missing && !isDisambiguation && page.coordinates &&
              // possibily too generous.. but check how many km away the sight is
              distFromLandmark < distance;
          }
        );
        return data;
      } );
  } else {
    return data;
  }
}

export default addSights;

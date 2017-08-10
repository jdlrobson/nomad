import extractBoldItems from './extract-bold-items'
import { extractElements, extractElementsTextContent } from './domino-utils'

export default function ( text ) {
  var sights = extractBoldItems( text );
  // sister site links e.g. Panama City
  const sisterSiteLink = extractElements( text, '.listing-sister a', true )
  if ( sisterSiteLink.extracted.length ) {
    sisterSiteLink.extracted.forEach( ( sister ) => {
      sights.push( sister.getAttribute( 'href' ).replace( './W:', '' ).replace( /_/g, ' ' ) );
    } );
  }
  sights = sights.concat(
    extractElementsTextContent( extractElements( text, 'a', true ).extracted )
  );
  return sights;
}

import extractBoldItems from './extract-bold-items'
import { extractElements, extractElementsTextContent } from './domino-utils'
import getParentWithTag from './get-parent-with-tag'

export default function ( doc ) {
  let text = doc.body.innerHTML;
  let sights = [];
  // sister site links e.g. Panama City
  const sisterSiteLink = doc.querySelectorAll( '.listing-sister a' );
  if ( sisterSiteLink.length ) {
    sisterSiteLink.forEach( ( sister ) => {
      sights.push( sister.getAttribute( 'href' ).replace( './W:', '' ).replace( /_/g, ' ' ) );
      const listItem = getParentWithTag( sister, 'LI' );
      if ( listItem && listItem.parentNode ) {
        listItem.parentNode.removeChild( listItem );
      }
    } );
  }

  text = doc.body.innerHTML;
  sights = sights.concat(
    extractBoldItems( text )
  ).concat(
    extractElementsTextContent( extractElements( text, 'a', true ).extracted )
  );
  return sights;
}

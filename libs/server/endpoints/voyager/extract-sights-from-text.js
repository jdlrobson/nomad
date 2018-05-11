import extractBoldItems from './extract-bold-items';
import { extractElements, extractElementsTextContent } from './domino-utils';
import getParentWithTag from './get-parent-with-tag';

export default function ( doc ) {
	let text = doc.body.innerHTML;
	let sights = [];
  // sister site links e.g. Panama City
	const sisterSiteLink = doc.querySelectorAll( '.listing-sister a' );
	if ( sisterSiteLink.length ) {
		sisterSiteLink.forEach( ( sister ) => {
			const listItem = getParentWithTag( sister, 'LI' );
			const summaryItems = listItem ? listItem.querySelectorAll( '.vcard .listing-content' ) : [];

			sights.push( {
				description: summaryItems.length ? summaryItems[ 0 ].textContent : '',
				name: sister.getAttribute( 'href' ).replace( './W:', '' ).replace( /_/g, ' ' )
			} );
			if ( listItem && listItem.parentNode ) {
				listItem.parentNode.removeChild( listItem );
			}
		} );
	}

	const nameToObj = ( name ) => {
		return {
			name
		};
	};
	text = doc.body.innerHTML;
	sights = sights.concat(
    extractBoldItems( text ).map( nameToObj )
  ).concat(
    extractElementsTextContent( extractElements( text, 'a', true ).extracted ).map( nameToObj )
  );
	return sights;
}

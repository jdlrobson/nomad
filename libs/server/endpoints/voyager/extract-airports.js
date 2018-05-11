import { extractElements } from './domino-utils';

function extractAirports( html ) {
	let airports = [];
	let sups = extractElements( html, 'sup', true );

	sups.extracted.forEach( ( sup ) => {
		let links = sup.querySelectorAll( 'a' );
		if ( links.length === 1 ) {
			if ( links[ 0 ].textContent.trim() === 'IATA' ) {
				let prev = sup.previousSibling;
        // ignore any text nodes.
				while ( prev && prev.nodeType === 3 ) {
					prev = prev.previousSibling;
				}
				if ( prev && airports.indexOf( prev.textContent ) === -1 ) {
					airports.push( prev.textContent );
				}
			}
		}
	} );
	return airports;
}

export default extractAirports;

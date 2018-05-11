import { extractElements, extractElementsTextContent } from './domino-utils';

function extractBoldItems( html ) {
	var ext = extractElements( html, 'li b:first-child' );
	var items = extractElementsTextContent( ext.extracted );
	if ( items.length === 0 ) {
		ext = extractElements( html, 'p b' );
		items = extractElementsTextContent( ext.extracted );
	}
	return items;
}

export default extractBoldItems;

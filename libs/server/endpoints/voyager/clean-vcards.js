import domino from 'domino';
import { cleanStrayPunctuation } from './domino-utils';

function cleanVCards( html ) {
	let window = domino.createWindow( html );
	var document = window.document;
	var body = document.body;
	var vcards = document.querySelectorAll( '.vcard' );

	Array.prototype.forEach.call( vcards, ( vcard ) => {
		cleanStrayPunctuation( vcard );
	} );

	return body.innerHTML;
}

export default cleanVCards;

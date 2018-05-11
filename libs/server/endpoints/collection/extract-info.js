import thumbFromTitle from './thumbnail-from-title.js';

function info( pageTitle, body, timestamp, image ) {
	var title, coordinates,
		lines = body.split( '\n' ),
		m = lines[ 0 ].match( /'''(.*)'''/ ),
		args = pageTitle.split( '/' );

	if ( m ) {
		title = m[ 1 ];
	} else {
		title = 'Unnamed collection';
	}

	m = body.match( /\{\{\#coordinates:([0-9\.\-]*)\|([0-9\.\-]*)}}/ );
	if ( m ) {
		coordinates = {
			lat: parseFloat( m[ 1 ], 10 ),
			lon: parseFloat( m[ 2 ], 10 )
		};
	} else {
		coordinates = { lat: 0,
			lon: 0 };
	}
	const owner = args[ 0 ].split( ':' )[ 1 ];
	const id = parseInt( args[ 2 ], 10 );
	return {
		coordinates,
		updated: timestamp,
		id: id,
		title: title,
		url: '/en.wikivoyage/Special:Collections/by/' + owner + '/' + id,
		thumbnail: image ? {
			title: image,
			source: thumbFromTitle( image.split( ':' )[ 1 ], 200 )
		} : image,
		owner: owner,
		description: lines[ 2 ]
	};
}

export default info;

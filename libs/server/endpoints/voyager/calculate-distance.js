// haversine formula ( http://en.wikipedia.org/wiki/Haversine_formula )
function calculateDistance( from, to ) {
	var distance, a,
		toRadians = Math.PI / 180,
		deltaLat, deltaLng,
		startLat, endLat,
		haversinLat, haversinLng,
		radius = 6371.01; // radius of Earth in km

	if ( from.lat === to.lat && from.lon === to.lon ) {
		distance = 0;
	} else {
		deltaLat = ( to.lon - from.lon ) * toRadians;
		deltaLng = ( to.lat - from.lat ) * toRadians;
		startLat = from.lat * toRadians;
		endLat = to.lat * toRadians;

		haversinLat = Math.sin( deltaLat / 2 ) * Math.sin( deltaLat / 2 );
		haversinLng = Math.sin( deltaLng / 2 ) * Math.sin( deltaLng / 2 );

		a = haversinLat + Math.cos( startLat ) * Math.cos( endLat ) * haversinLng;
		return 2 * radius * Math.asin( Math.sqrt( a ) );
	}
	return distance;
}
export default calculateDistance;

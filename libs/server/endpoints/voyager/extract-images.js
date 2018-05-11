import { extractElements } from './domino-utils';

function extractTitle( src ) {
	return src.split( 'px-' )[ 1 ];
}

function extractImages( section ) {
	var ext = extractElements( section.text, 'figure, .gallerybox' );
	var maps = [];
	var images = [];
	Array.prototype.forEach.call( ext.extracted, function ( node ) {
		var img = node.querySelector( 'img' );
		var caption = node.querySelector( 'figcaption' );
		var link = node.querySelector( 'a.image' );
		var src = img.getAttribute( 'src' );

		var imgData = {
			href: link ? link.getAttribute( 'href' ) : extractTitle( src ),
			caption: caption ? caption.textContent : '',
			src: src,
			srcset: img.getAttribute( 'srcset' ),
			height: img.getAttribute( 'height' ),
			width: img.getAttribute( 'width' )
		};
		var captionLc = imgData.caption.toLowerCase();
		if ( imgData.href.toLowerCase().indexOf( 'map' ) > -1 ||
      captionLc.indexOf( 'visa policy' ) > -1 ||
      captionLc.indexOf( 'metro lines' ) > -1 ||
      captionLc.indexOf( 'tube lines' ) > -1 ||
      captionLc.indexOf( 'map' ) > -1 ||
      captionLc.indexOf( 'worldwide' ) > -1 ||
      captionLc.indexOf( 'region' ) > -1
    ) {
			maps.push( imgData );
		} else {
			images.push( imgData );
		}
	} );
	section.maps = maps;
	section.images = images;
	section.text = ext.html;
	return section;
}

export default extractImages;

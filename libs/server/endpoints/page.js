import fetch from 'isomorphic-fetch';
import domino from 'domino';

import { SPECIAL_PROJECTS, HOST_SUFFIX, SITE_HOME } from './../config';

function getMedia( sections ) {
	var html = '';
	sections.forEach( function ( section ) {
		if ( section.text ) {
			html += section.text;
		}
	} );
	var doc = domino.createDocument( html );
	var imageNodes = doc.querySelectorAll( '.mw-default-size a > img, figure a > img' );
	var images = [];
	Array.prototype.forEach.call( imageNodes, function ( imageNode ) {
		var href = imageNode.parentNode.getAttribute( 'href' ).split( '/' );
		images.push( href[ href.length - 1 ] );
	} );
	return images;
}
function extractLeadParagraph( doc ) {
	var p = '';
	var node = doc.querySelector( 'p' );
	if ( node ) {
		p = node.innerHTML;
    // delete it
		node.parentNode.removeChild( node );
	}
	return p;
}
function extractHatnote( doc ) {
  // Workaround for https://phabricator.wikimedia.org/T143739
  // Do not remove it from the DOM has a reminder this is not fixed.
	var hatnoteNodes = doc.querySelectorAll( '.hatnote,.noexcerpt' );
	var hatnote;
	if ( hatnoteNodes.length ) {
		hatnote = '';
		Array.prototype.forEach.call( hatnoteNodes, function ( hatnoteNode ) {
			hatnote += hatnoteNode.innerHTML + '<br/>';
			hatnoteNode.parentNode.removeChild( hatnoteNode );
		} );
	}
	return hatnote;
}
function extractInfobox( doc ) {
	var infobox;
	var node = doc.querySelector( '.infobox' );
	if ( node ) {
		infobox = '<table class="' + node.getAttribute( 'class' ) + '">' + node.innerHTML + '</table>';
    // delete it
		node.parentNode.removeChild( node );
	}
	return infobox;
}

// Can be removed when https://gerrit.wikimedia.org/r/309191 deployed
function extractPageIssues( doc ) {
	var nodesToDelete;
	var issues = false;
	var nodes = doc.querySelectorAll( '.ambox-multiple_issues table .mbox-text-span' );
  // If no nodes found proceed to look for single page issues.
	nodes = nodes.length ? nodes : doc.querySelectorAll( '.ambox .mbox-text-span' );
	if ( nodes.length ) {
		issues = Array.prototype.map.call( nodes, function ( span ) {
			return {
				text: span.innerHTML
			};
		} );

    // delete all the nodes we found.
		nodesToDelete = doc.querySelectorAll( '.ambox-multiple_issues,.ambox' );
		Array.prototype.forEach.call( nodesToDelete, function ( node ) {
			node.parentNode.removeChild( node );
		} );
	}
	return issues;
}

// Undo the work in mobile-content-service (https://phabricator.wikimedia.org/T147043)
function undoLinkRewrite( doc ) {
	var idx = 0;
	var sp;
	var ps = doc.querySelectorAll( 'a' ) || [],
		value;
	for ( idx = 0; idx < ps.length; idx++ ) {
		var node = ps[ idx ];
		value = node.getAttribute( 'href' );
		if ( value ) {
      // replace all subpages with encoded '/'
			value = value.replace( /^\/wiki\//, './' );
			if ( value.substr( 0, 2 ) === './' ) {
				sp = value.substr( 2 );
				sp = sp.replace( /\//g, '%2F' );
				value = './' + sp;
			}
			node.setAttribute( 'href', value );
		}
	}
}
function markReferenceSections( sections, removeText ) {
	var topHeadingLevel = sections[ 0 ] ? sections[ 0 ].toclevel : 2;
	var lastTopLevelSection,
		isReferenceSection = false;

	function mark( from, to ) {
		if ( isReferenceSection && from !== undefined ) {
      // Mark all the sections between the last heading and this one as reference sections
			sections.slice( from, to ).forEach( function ( section ) {
				section.isReferenceSection = true;
				if ( removeText ) {
					delete section.text;
				}
			} );
		}
	}

	sections.forEach( function ( section, i ) {
		var text = section.text;
		if ( section.toclevel === topHeadingLevel ) {
			mark( lastTopLevelSection, i );
      // reset the top level section and begin the hunt for references again.
			lastTopLevelSection = i;
			isReferenceSection = false;
		}
		if ( text.indexOf( 'class="mw-references' ) > -1 || text.indexOf( 'class="refbegin' ) > -1 ) {
			isReferenceSection = true;
		}
	} );
  // the last section may have been a reference section
	mark( lastTopLevelSection, sections.length );
}

function getBaseHost( lang, project ) {
	if ( SPECIAL_PROJECTS.indexOf( project ) > -1 ) {
		return project + '.wikimedia';
	} else {
		return lang + '.' + project;
	}
}


function parsoidHTMLToJSON( html ) {
	var doc = domino.createDocument( html );
	const sections = Array.from( doc.querySelectorAll( 'section' ) ).map( ( secEl ) => {
		let toclevel;
		const h2 = secEl.querySelectorAll( 'h2,h3,h4,h5,h6' )[0];
		const line = h2 ? h2.textContent : undefined;
		const id = secEl.getAttribute( 'data-mw-section-id' );
		const anchor = h2 ? h2.getAttribute( 'id' ) : 0;
		// drop h2
		if ( h2 ) {
			h2.parentNode.removeChild( h2 );
			// @todo 2 is not correct
			switch ( h2.tagName ) {
				case 'H6':
					toclevel = 5;
					break;
				case 'H5':
					toclevel = 4;
					break;
				case 'H4':
					toclevel = 3;
					break;
				case 'H3':
					toclevel = 2;
					break;
				default:
					toclevel = 1;
					break;
			}
		}
		return {
			toclevel,
			anchor,
			id,
			line,
			text: secEl.innerHTML
		};
	});

	return {
		lead: {
			displaytitle: doc.querySelector( 'head title' ).textContent,
			sections: sections.slice( 0, 1 )
		},
		remaining: {
			sections: sections.slice( 1 )
		}
	};
}

export default function ( title, lang, project, includeReferences, revision ) {
	const host = getBaseHost( lang, project ) + HOST_SUFFIX;
	const path = '/api/rest_v1/page/html/';
	const suffix = revision ? '/' + revision : '';
	if ( title.substr( 0, 6 ) === 'Media:' ) {
		title = title.replace( 'Media:', 'File:' );
	}
  // FIXME: Handle this better please. Use better API.
	var url = 'https://' + host + path +
    encodeURIComponent( title ) + suffix;

	return fetch( url, { redirect: 'manual' } )
    .then( function ( resp ) {
	if ( [ 301, 302 ].indexOf( resp.status ) > -1 ) {
		var redirectUrl = resp.headers.get( 'Location' );
		if ( redirectUrl.indexOf( host ) > -1 ) {
			return {
				code: 301,
				title: redirectUrl.replace( host, '' )
              .replace( 'commons.wikimedia.org', '' )
              .replace( path, '' ).replace( /https?\:\/\//, '' )
			};
		} else if ( redirectUrl.indexOf( 'commons.wikimedia.org' ) > -1 ) {
          // Workaround for https://github.com/jdlrobson/weekipedia/issues/139
			return {
				code: 301,
				project: 'en.commons',
				title: redirectUrl
              .replace( 'commons.wikimedia.org', '' )
              .replace( path, '' ).replace( /https?\:\/\//, '' )
			};
		}
	} else if ( resp.status === 200 ) {
		return resp.text().then(parsoidHTMLToJSON);
	}
} )
.then( function ( json ) {
	if ( !json ) {
		throw '404: Bad title given';
	}
	if ( json.code ) {
		return json;
	}
      // mark references sections with a flag
	if ( json.remaining.sections ) {
		markReferenceSections( json.remaining.sections, !includeReferences );
	}

	json.remaining.sections.forEach( function ( section ) {
		if ( section.text ) {
			var doc = domino.createDocument( section.text );
			undoLinkRewrite( doc );
			section.text = doc.body.innerHTML;
		}
	} );

      // Workaround for https://phabricator.wikimedia.org/T145034
	var doc = domino.createDocument( json.lead.sections.length && json.lead.sections[ 0 ] && json.lead.sections[ 0 ].text );
	json.lead.media = getMedia( json.lead.sections.concat( json.remaining.sections ) );
	if ( doc ) {
        // See https://github.com/jdlrobson/weekipedia/issues/99 - preserve links in main page
		if ( SITE_HOME.replace( /_/g, ' ' ) !== title.replace( /_/g, ' ' ) ) {
			undoLinkRewrite( doc );
		}
		var infobox = extractInfobox( doc );
		if ( !json.lead.mainpage ) {
			var leadParagraph = extractLeadParagraph( doc );
			json.lead.paragraph = leadParagraph;
		}
		var issues = extractPageIssues( doc );
		json.lead.issues = issues;
		json.lead.infobox = infobox;
		json.lead.hatnote = extractHatnote( doc );
		json.lead.sections[ 0 ].text = doc.body.innerHTML;
	}
	return json;
} );
}

import domino from 'domino';

function isNodeEmpty( node ) {
	return node.textContent.replace( /[↵ \n\t]/gi, '' ).length === 0;
}

function cleanStrayPunctuation( node ) {
	var children = node.childNodes;
	Array.prototype.forEach.call( children, ( child ) => {
		if ( child.childNodes.length ) {
			cleanStrayPunctuation( child );
		} else {
			if ( !child.textContent.replace( /[\.\, ]*/g, '' ).length ) {
				child.parentNode.removeChild( child );
			}
		}
	} );
	return node.innerHTML;
}

function mergeAdjacentLists( list ) {
	var nextSibling;
	if ( list && list.parentNode ) {
		nextSibling = list.nextSibling;
		while ( nextSibling && nextSibling.nodeType === 3 ) {
			nextSibling = nextSibling.nextSibling;
		}
		if ( nextSibling && nextSibling.tagName === 'UL' ) {
      // move all the children of the list that follows on to this one
			Array.prototype.forEach.call( nextSibling.childNodes, function ( item ) {
				list.appendChild( item );
			} );
      // and remove that list.
			list.parentNode.removeChild( nextSibling );
      // try again until it has no more siblings that are not UL tags
			if ( list.nextSibling ) {
				mergeAdjacentLists( list );
			}
		}
	}
}

function cleanupEmptyNodes( text ) {
	var window = domino.createWindow( text ),
		document = window.document;

	Array.prototype.forEach.call( document.body.childNodes, function ( node ) {
		if ( node && isNodeEmpty( node ) ) {
			node.parentNode.removeChild( node );
		}
	} );
	return document.body.innerHTML;
}

function cleanupScrubbedLists( text ) {
	var ext = extractElements( text, 'ul,dl', true );
	Array.prototype.forEach.call( ext.extracted, function ( listNode ) {
		if ( listNode && isNodeEmpty( listNode ) ) {
			var prevSibling = listNode.previousSibling;

      // find a paragraph that appears before the list and remove it.
			if ( listNode.previousSibling ) {
				while ( prevSibling && isNodeEmpty( prevSibling ) ) {
					prevSibling = prevSibling.previousSibling;
				}
				if ( prevSibling && prevSibling.tagName === 'P' ) {
					prevSibling.parentNode.removeChild( prevSibling );
				}
			}

      // and remove the list we just scraped
			listNode.parentNode.removeChild( listNode );
		}
	} );

  // there may be one lone paragraph or list item or definition which introduces it
	ext = extractElements( ext.document.body.innerHTML, 'p,dd,li', true );
	if ( ext.extracted.length === 1 ) {
		var paragraph = ext.extracted[ 0 ];
		var p = paragraph.textContent.trim();
		if ( p.substr( p.length - 1 ) === ':' ) {
			paragraph.parentNode.removeChild( paragraph );
		}
	}

	var lists = ext.document.querySelectorAll( 'ul' );
	Array.prototype.forEach.call( lists, function ( list ) {
		mergeAdjacentLists( list );
	} );
  // update now we have merged lists

	return ext.document.body.innerHTML;
}

function extractElements( html, selector, doNotRemove ) {
	var extracted = [],
		window = domino.createWindow( html ),
		document = window.document;

	Array.prototype.forEach.call( document.querySelectorAll( selector ), function ( node ) {
		var parentNode = node.parentNode;
		extracted.push( node );
		if ( !doNotRemove ) {
			parentNode.removeChild( node );
			if ( isNodeEmpty( parentNode ) && parentNode.parentNode ) {
				parentNode.parentNode.removeChild( parentNode );
			}
		}
	} );
	return {
		extracted: extracted,
		document: document,
    // if body is empty it will also be removed!
		html: document.body ? document.body.innerHTML : ''
	};
}

function extractElementsTextContent( nodes ) {
	var items = [];
	Array.prototype.forEach.call( nodes, function ( item ) {
		var text = item.textContent;
    // drop any lower case items
    // e.g. http://localhost:8142/wiki/Santiago%20de%20Chile?action=orientation
    // central university building..
		if ( text.match( /^[A-Z]/ ) ) {
			items.push( text );
		}
	} );
	return items;
}

function extractText( html ) {
	var window = domino.createWindow( '<div>' + html + '</div>' );
	return window.document.body.textContent;
}

export { isNodeEmpty, extractElements, extractText, cleanupScrubbedLists,
  cleanupEmptyNodes, extractElementsTextContent, cleanStrayPunctuation };

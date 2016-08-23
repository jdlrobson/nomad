import mwApi from './mwApi'
import domino from 'domino'
import htmlHelper from 'mediawiki-html-construction-helper'

let jsdiff = require( 'diff' );

function getText( html ) {
  var window = domino.createWindow( '<div>' + html + '</div>' ),
    document = window.document;
  return htmlHelper.escape( document.documentElement.textContent );
}

function transform( body ) {
  var newDiff = '',
    window = domino.createWindow( '<table>' + body + '</table>' ),
    document = window.document,
    trs = document.querySelectorAll( 'tr' );

  Array.prototype.forEach.call( trs, function ( row ) {
    var added, removed, context, charDiff,
      children = row.querySelectorAll( 'td' ),
      charDiffVal = '';

    Array.prototype.forEach.call( children, function ( col ) {
      var html = col.innerHTML || '&nbsp;';
      if ( col.className === 'diff-lineno' && newDiff ) {
        newDiff += '<br />';
      } else if ( col.className === 'diff-context' ) {
        context = html;
      } else if ( col.className === 'diff-addedline' ) {
        added = html;
      } else if ( col.className ===  'diff-deletedline' ) {
        removed = html;
      }
    } );
    if ( context ) {
      newDiff += '<div>' + context + '</div>'; 
    }
    if ( removed && !added ) {
      newDiff += '<div class="diff-deletedline">' + removed + '</div>';
    } else if ( added && !removed ) {
      newDiff += '<div class="diff-addedline">' + added + '</div>'; 
    } else if ( added && removed ) {
      charDiff = jsdiff.diffWords( getText( removed ), getText( added ) );
      charDiff.forEach( function ( change ) {
        if ( change.added ) {
          charDiffVal += '<ins>'
        }
        if ( change.removed ) {
          charDiffVal += '<del>'
        }
        charDiffVal += change.value;
        if ( change.added ) {
          charDiffVal += '</ins>'
        }
        if ( change.removed ) {
          charDiffVal += '</del>'
        }
      } )
      newDiff += '<div>' + charDiffVal + '</div>';
    }
  } );
  return '<div>' + newDiff + '</div>';
}

export default function ( lang, revId, project ) {
  var params = {
    prop: 'revisions',
    revids: revId,
    rvprop: 'ids|timestamp|comment|size|flags|sizediff|user',
    rvdiffto: 'prev'
  };

  return mwApi( lang, params, project ).then( function ( data ) {
    var page, rev, body,
      pages = data.pages;

    if ( pages[0] && pages[0].revisions ) {
      page = pages[0];
      rev = page.revisions[0];
      body = transform( rev.diff.body );
      delete rev.diff;

      return Object.assign( rev, {
        title: page.title,
        comment: rev.comment,
        user: rev.user,
        parent: rev.parentid,
        body: body,
        timestamp: rev.timestamp
      } );
    }
    throw new Error( 'Unable to load diff.' );
  } );
}

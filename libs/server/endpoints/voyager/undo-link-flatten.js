import domino from 'domino'

export default function ( text ) {
  const doc = domino.createDocument( text );
  const elements = doc.querySelectorAll( '.new' );
  for ( let i = 0; i < elements.length; i++ ) {
    const element = elements[i];
    const replacement = doc.createElement( 'a' );
    replacement.innerHTML = element.innerHTML;
    if ( element.getAttribute( 'class' ) ) {
      replacement.setAttribute( 'class', element.getAttribute( 'class' ) );
    }
    replacement.setAttribute('href', './' + encodeURIComponent( element.textContent ) );
    element.parentNode.replaceChild( replacement, element );
  }
  return doc.body.innerHTML;
}


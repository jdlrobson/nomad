function getParentWithTag( node, tag ) {
	if ( !node ) {
		return false;
	} else if ( node.tagName === tag ) {
		return node;
	} else {
		return getParentWithTag( node.parentNode, tag );
	}
}

export default getParentWithTag;

import React from 'react';
import ReactDOM from 'react-dom';

import './styles.less';

import { IntermediateState } from 'wikipedia-react-components';

import Overlay from './../Overlay';

class PagePreviewOverlay extends Overlay {
	componentDidMount() {
		var node = ReactDOM.findDOMNode( this );
		setTimeout( function () {
			node.className += ' visible';
		}, 0 );
		this.loadSummary();
	}
	loadSummary() {
		const props = this.props;
		const item = props.item;
		const self = this;

		if ( item.description ) {
			self.setState( { summary: item.description } );
		} else {
			props.api.fetch( `/api/en.wikivoyage.org/rest_v1/page/summary/${encodeURIComponent( item.title )}` )
        .then( function ( json ) {
	self.setState( { summary: json.extract } );
} );
		}
	}
	render() {
		var props = this.props;
		var img;
		var item = props.item;
		if ( item.thumbnail ) {
			var thumb = item.thumbnail;
			img = <img src={thumb.source} height={thumb.height} width={thumb.width} alt={item.title}
        key="p-p-img" />;
		}
		const desc = this.state ? <div key="page-preview-loader"
      className="description">{this.state.summary}</div> : <IntermediateState key="page-preview-loader" />;
		var url = props.getLocalUrl( item.title, '', item.source );
		var hello = [
			<h2 key="p-p-h">{item.title}</h2>,
			img,
			desc,
			<a key="p-p-link" onClick={props.onClickInternalLink}
        href={url}>View destination</a>
		];
		return <Overlay children={hello} {...this.props} className="page-preview-overlay" />;
	}
}
PagePreviewOverlay.defaultProps = {
	isLightBox: false,
	isDrawer: true
};

export default PagePreviewOverlay;

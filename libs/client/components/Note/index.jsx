import React from 'react';
import { IntermediateState } from 'wikipedia-react-components';
import createReactClass from 'create-react-class';

import MakeNote from './../../components/MakeNote';

import './styles.less';

export default createReactClass( {
	getInitialState() {
		return { loading: true };
	},
  // You want to load subscriptions not only when the component update but also when it gets mounted.
	componentDidMount() {
		this.load();
	},
	load() {
		var props = this.props;
		var self = this;
		var user = props.session && props.session.username;
		if ( user ) {
			props.api.fetch( '/api/wikitext/en.wikivoyage/User%3A' + user + '%2Fnotes%2F' + props.title )
        .then( ( json ) => {
	if ( json && json.pages && json.pages.length && !json.pages[ 0 ].missing ) {
		self.setState( { text: json.pages[ 0 ].revisions[ 0 ].content, loading: false } );
	} else {
		self.setState( { text: '', loading: false } );
	}
} );
		}
	},
	render: function () {
		var className = 'note';
		var text, icon;
		var props = this.props;

		if ( !this.state.loading ) {
			text = this.state.text || 'Want to capture some thoughts?\n\nClick the add note icon.';
			if ( this.props.session ) {
				icon = <MakeNote {...this.props} id={null} className="" title={props.title}
          session={this.props.session} key="article-make-note" />;
			}
			return (
        <div className={className}>
          <pre>{text}</pre>
          {icon}
        </div>
			);
		} else {
			return (
        <div className={className}>
          <IntermediateState className={className} />
        </div>
			);
		}
	}
} );

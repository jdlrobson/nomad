import React, { Component } from 'react';

import { HorizontalList, Icon } from 'wikipedia-react-components';

import SectionContent from './../../components/SectionContent';
import ThreeColumnLayout from './../../components/ThreeColumnLayout';
import EditorLink from './../../components/EditorLink';
import Content from './../../components/Content';
import WatchIcon from './../../components/WatchIcon';
import MakeNote from './../../components/MakeNote';

import './styles.less';

// Main component
class Article extends Component {
	componentDidUpdate() {
		var node;

		if ( window.location.hash && window.location.hash !== '#' ) {
			try {
				node = document.querySelector( window.location.hash );
				node.scrollIntoView();
			} catch ( e ) {}
		} else if ( this.props.scrollY ) {
			window.scrollTo( 0, this.props.scrollY );
		}
	}
	getNoteAction() {
		const props = this.props;
		return <MakeNote {...props} id={null} className="" title={props.title}
        session={props.session} key="article-make-note" />;
	}
	getWatchAction() {
		const props = this.props;
		const lead = props.lead || {};
		const isWatchablePage = props.isWikiPage && lead && lead.id;
		const contentProps = Object.assign( {}, this.props, { id: undefined, className: undefined } );

		if ( isWatchablePage ) {
			return <WatchIcon {...contentProps} key="article-watch"
        title={lead.displaytitle} />;
		} else {
			return <Icon key="article-watch" />;
		}
	}
	getTabs() {
		const props = this.props;
		let tabs;
		if ( props.tabs && props.tabs.length ) {
			tabs = ( <HorizontalList className="tabs"
        key="article-header-tabs">{props.tabs.concat()}</HorizontalList> );
		}

		return tabs;
	}
	getColumnTwo() {
		const props = this.props;
		const lead = this.props.lead || {};
		let editLink;
		const content = [];

		if ( lead.paragraph ) {
			content.push( <SectionContent {...this.props}
        key="article-header-paragraph"
        className="lead-paragraph" text={lead.paragraph} /> );
		}

		if ( lead.text && !lead.project_source ) {
			editLink = <EditorLink key="header-lead-edit" section={0} session={props.session} />;
		}

		var leadSection;
		if ( lead.text ) {
			leadSection = (
        <SectionContent {...this.props} className="lead-section"
          text={lead.text} key="header-lead" />
      );
		}

		return [
			<div className="article-lead" key="article-col-2-0">
          {content}
          {leadSection}
          {editLink}
        </div>,
			<div className="article-body" key="article-col-2-1">
          {this.props.body}
        </div>
		];
	}
	getColumnOne() {
		return this.props.column_one;
	}
	render() {
		let headingHolder;
		let noteAction;
		let watchAction;
		const tabs = this.getTabs();
		let actions = tabs ? [ tabs ] : [];
		if ( !this.props.isSpecialPage ) {
			noteAction = this.getNoteAction();
			watchAction = this.getWatchAction();
			if ( noteAction ) {
				actions.unshift( noteAction );
			}
			if ( watchAction ) {
				actions.push( watchAction );
			}
		}
		if ( actions.length ) {
			headingHolder = <div className="heading-holder" key="heading-holder">{actions}</div>;
		}
		return (
        <Content className={this.props.className}>
          {headingHolder}
          <ThreeColumnLayout
            col1={this.getColumnOne()}
            col2={this.getColumnTwo()}
            col3={this.props.column_three} />
        </Content>
		);
	}
}
Article.props = {
	tagline: '',
	lead: '',
	body: [],
	tabs: [],
	actions: [],
	secondaryActions: []
};

export default Article;

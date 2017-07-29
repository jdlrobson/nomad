import React, { Component } from 'react'

import { HorizontalList } from 'wikipedia-react-components'

import Content from './../../components/Content'

// Main component
class ArticleFooter extends Component {
  render(){
    var wordmark, places = [],
      props = this.props,
      footerClass = props.className ? props.className + ' ' : '',
      siteinfo = this.props.siteinfo || {},
      license = siteinfo.license || {};

    wordmark = siteinfo.wordmark ? <h2><img src={siteinfo.wordmark} alt={siteinfo.title} height="15" /></h2>
      : <h2>{siteinfo.title}</h2>;

    if ( siteinfo.termsUrl ) {
      places.push(
        <a key="article-footer-terms-url" href={siteinfo.termsUrl}>Terms of Use</a>
      );
    }

    if ( siteinfo.privacyUrl ) {
      places.push(
        <a key="article-footer-privacy-url" href={siteinfo.privacyUrl}>Privacy</a>
      );
    }

    return (
      <footer key="footer" className={"post-content footer " + footerClass}>
        {this.props.footer}
        <Content className="footer-info">
          {wordmark}
          <div className="license">Content derived from <a href={this.props.desktopUrl}>the Wikivoyage article</a> which is available under <a className="external" rel="nofollow" href={license.url}>{license.name}</a> unless otherwise noted.</div>
          <span>v. {this.props.offlineVersion}</span>
          <HorizontalList isSeparated="1">{places}</HorizontalList>
        </Content>
      </footer>
    )
  }
}

export default ArticleFooter
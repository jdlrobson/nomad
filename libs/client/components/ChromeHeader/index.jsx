import React, { Component } from 'react'

import Header from './../../components/Header'
import { HorizontalList } from 'wikipedia-react-components'

import './styles.less'

class ChromeHeader extends Component {
  componentDidMount() {
    // cache the request so it doesn't get requested multiple times.
    new Image( this.props.siteinfo.wordmark );
  }
  render(){
    var main, loginLogout, helloMsg, listLink;
    var props = this.props;
    var session = props.session;
    const title = props.title;
    const loginUrl = "/wiki/Special:UserLogin?returnto=" + encodeURIComponent( title );

    if ( session && session.username ) {
      helloMsg = <span key="chrome-header-hello">Welcome back, <strong>{session.username}</strong></span>;
      listLink = <a href={"/wiki/Special:Collections/by/" + session.username}
        onClick={props.onClickInternalLink}
        key="chrome-header-trips">My trips</a>;
      loginLogout = <a href="/auth/logout" key="chrome-header-login"
          onClick={this.onClickLogout}>Logout</a>;
    } else {
      helloMsg = <span key="chrome-header-hello">Hello stranger!</span>;
      loginLogout = <a href={loginUrl}
        key="chrome-header-login">Sign in</a>;
      listLink = <a href="/wiki/Special:Collections" onClick={props.onClickInternalLink}
        key="chrome-header-trips">Our trips</a>;
    }
    main = [
        <HorizontalList key="chrome-menu">
          <a href="/" onClick={props.onClickInternalLink}>Home</a>
          {helloMsg}
          {loginLogout}
          {listLink}
        </HorizontalList>
    ];

    return <Header key="header-bar" className="chrome-header"
      fixed={props.fixed}
      main={main}></Header>
  }
}

export default ChromeHeader

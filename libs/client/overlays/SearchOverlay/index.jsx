import React, { Component } from 'react'

import Overlay from './../../containers/Overlay'
import Content from './../../containers/Content'
import CardList from './../../containers/CardList'

import Card from './../../components/Card'
import IntermediateState from './../../components/IntermediateState';
import SearchForm from './../../components/SearchForm'

export default React.createClass({
  getInitialState() {
    return {
      isSearching: false,
      term: '',
      cards: []
    }
  },
  getDefaultProps() {
    return {
      api: null,
      lang: 'en'
    }
  },
  onSearch( term ){
    var self = this;
    if ( term ) {
      this.setState( { isSearching: true } );
      this.props.api.fetch( '/api/search/' + this.props.lang + '/' + encodeURIComponent( term ) ).then( function ( data ) {
        var cards = [];
        data.forEach( function ( item ) {
          item.key = item.pageid;
          item.wiki = self.props.lang;
          cards.push( React.createElement( Card, Object.assign( {}, self.props, item ) ) );
        } );
        self.setState({
          cards: cards
        });
        self.setState( { isSearching: false } );
      } );
    } else {
      this.setState( { cards: [] } );
    }
  },
  render(){
    var main = <SearchForm
      onSearch={this.onSearch} focusOnRender="1"></SearchForm>;

    var state = this.state;
    var content = state.isSearching ? <IntermediateState msg="Searching" />
      : <CardList cards={state.cards} />;
    return (
      <Overlay router={this.props.router} header={main}>
        <Content className="overlay-content">{content}</Content>
      </Overlay>
    )
  }
} );
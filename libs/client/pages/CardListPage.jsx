import React from 'react'

import CardList from './../components/CardList'
import PreviewCard from './../components/PreviewCard'
import EmptyList from './../components/EmptyList'

import Article from './../containers/Article'
// Pages
export default React.createClass({
  getDefaultProps: function () {
    return {
      CardClass: PreviewCard,
      api: null,
      apiEndpoint: null,
      title: null,
      tagline: null,
      lang: 'en'
    };
  },
  onEmpty() {
    this.setState( { isEmpty: true } );
  },
  getInitialState() {
    return {
      isEmpty: false,
      errorMsg: 'Something went wrong when trying to render the list. Please refresh and try again.',
      error: false,
      list: null
    };
  },
  render(){
    var props = this.props;
    // api endpoint may change...
    var key = 'card-list-page-card-list-' + props.language_project + '-' + props.apiEndpoint;
    var body = [ <CardList key={key} {...props}
      title={undefined}
      onEmpty={this.onEmpty}/> ]
      .concat( props.children );

    if ( this.state.isEmpty ) {
      body = <EmptyList {...props} {...props.emptyProps} />
    }
    return (
      <Article {...this.props} isSpecialPage="1" body={body} />
    )
  }
})


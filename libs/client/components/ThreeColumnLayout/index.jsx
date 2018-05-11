import React from 'react';

import Content from './../Content';

import './styles.less';

const ThreeColumnLayout = function ( props ) {
	return (
    <Content>
      <div className="flex-box">
        <div className="column-one">
          {props.col1}
        </div>
        <div className="column-two">
          {props.col2}
        </div>
        <div className="column-three">
          {props.col3}
        </div>
      </div>
    </Content>
	);
};

export default ThreeColumnLayout;

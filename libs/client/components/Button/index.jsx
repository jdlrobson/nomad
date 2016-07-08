import './mediawiki-ui-button.css'
import React, { Component } from 'react'

const Button = (props) => {
  var modifiers = props.isPrimary ? 'mw-ui-button-primary' : '';
  modifiers += props.isQuiet ? 'mw-ui-quiet' : '';

  return <a className={'mw-ui-button' + modifiers}
    onClick={props.onClick} href={props.href}>{props.label}</a>
}

export default Button

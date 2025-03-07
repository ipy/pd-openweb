import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { RichText } from 'ming-ui';
import { browserIsMobile } from 'src/util';
import autoSize from 'ming-ui/decorators/autoSize';
@autoSize
export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      width: props.width,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.width !== this.props.width) {
      this.setState({
        width: nextProps.width,
      });
    }
  }

  onChange = value => {
    this.props.onChange(value);
  };

  render() {
    const { disabled, value, type, flag } = this.props;

    return (
      <RichText
        maxWidth={this.state.width}
        id={flag}
        data={value || ''}
        className={cx('customFormItemControl', { remarkControl: type === 10010, richTextForM: browserIsMobile() })}
        disabled={disabled}
        onActualSave={this.onChange}
      />
    );
  }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import CellControl from 'src/pages/worksheet/components/CellControls';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import './RecordCard.less';

const FROMS = {
  RECORDDETAIL: 1,
  SELECT_RECORD_DIALOG: 2,
  MOBILE: 3,
};

function getKeyOfFrom(from) {
  return Object.keys(FROMS)[from - 1] || '';
}

function getCoverControlData(data) {
  return _.find(data, file => File.isPicture(file.ext));
}

export default class RecordCard extends Component {
  static propTypes = {
    from: PropTypes.number,
    disabled: PropTypes.bool,
    selected: PropTypes.bool,
    coverCid: PropTypes.string,
    showControls: PropTypes.arrayOf(PropTypes.string),
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    data: PropTypes.shape({}),
    onClick: PropTypes.func,
    onDelete: PropTypes.func,
  };
  static defaultProps = {
    from: 1,
  };
  @autobind
  handleCoverClick(e) {
    const { from = 1 } = this.props;
    const { cover } = this;
    const isMobile = from === FROMS.MOBILE;
    if (isMobile) {
      return;
    }
    previewQiniuUrl(cover.previewUrl.replace(/\?(.*)/, ''));
    e.stopPropagation();
  }
  get cover() {
    const { coverCid, data } = this.props;
    if (!coverCid) {
      return null;
    }
    let coverControlData;
    try {
      coverControlData = getCoverControlData(JSON.parse(data[coverCid]) || []);
    } catch (err) {
      return null;
    }
    return coverControlData;
  }
  get cardControls() {
    const { controls, showControls } = this.props;
    const allControls = [
      { controlId: 'ownerid', controlName: _l('拥有者'), type: 26 },
      { controlId: 'caid', controlName: _l('创建人'), type: 26 },
      { controlId: 'ctime', controlName: _l('创建时间'), type: 16 },
      { controlId: 'utime', controlName: _l('最近修改时间'), type: 16 },
    ].concat(controls);
    return showControls.map(scid => _.find(allControls, c => c.controlId === scid)).filter(c => c && c.attribute !== 1);
  }
  render() {
    const {
      from = 1,
      disabled,
      selected,
      controls,
      data,
      onDelete,
      onClick,
      coverCid,
      sourceEntityName,
      viewId,
    } = this.props;
    const { cover, cardControls } = this;
    const titleText = data.rowid ? getTitleTextFromControls(controls, data) : _l('关联当前%0', sourceEntityName);
    return (
      <div
        className={cx('worksheetRecordCard', getKeyOfFrom(from).toLowerCase(), {
          selected,
          noControls: !cardControls.length,
          withoutCover: !coverCid,
        })}
        onClick={onClick}
      >
        {!disabled && (
          <span
            className="deleteRecord"
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <i className="icon icon-minus-square"></i>
          </span>
        )}
        <span className={cx('selectedIcon', { hide: !selected })}>
          <i className="icon icon-ok"></i>
        </span>
        <p className="titleText ellipsis">{titleText}</p>
        <div className="visibleControls flexRow">
          {cardControls.slice(0, from === FROMS.SELECT_RECORD_DIALOG ? 6 : 3).map((visibleControl, i) => (
            <div className="visibleControl flex" key={i}>
              <div className="controlName ellipsis">{visibleControl.controlName}</div>
              <div className="controlContent">
                {data[visibleControl.controlId] ? (
                  <CellControl
                    cell={Object.assign({}, visibleControl, { value: data[visibleControl.controlId] })}
                    from={4}
                    viewId={viewId}
                  />
                ) : (
                  <div className="emptyTag"></div>
                )}
              </div>
            </div>
          ))}
        </div>
        {cover && cover.previewUrl && (
          <img
            className="cover thumbnail"
            role="presentation"
            onClick={this.handleCoverClick}
            src={
              cover.previewUrl.slice(0, cover.previewUrl.indexOf('?')) +
              '?imageMogr2/auto-orient|imageView2/1/w/76/h/76/q/90'
            }
          />
        )}
      </div>
    );
  }
}

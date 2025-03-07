import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import Icon from 'ming-ui/components/Icon';
import Popup from 'ming-ui/components/Popup';
import { renameFile, saveToKnowlwdge, replaceAttachment, updateAllowDownload } from '../actions/action';
import UploadNewVersion from '../../../components/UploadNewVersion';
import { validateFileName } from '../../../utils';
import * as previewUtil from '../constant/util';
import { PREVIEW_TYPE, LOADED_STATUS } from '../constant/enum';
import EditableBlock from '../editableBlock';
const VersionList = require('../versionList');

class PreviewHeader extends React.Component {
  static propTypes = {
    attachment: PropTypes.object,
    onClose: PropTypes.func,
    renameFile: PropTypes.func,
    saveToKnowlwdge: PropTypes.func,
    replaceAttachment: PropTypes.func,
    index: PropTypes.number,
    performUpdateItem: PropTypes.func,
    performRemoveItems: PropTypes.func,
    updateAllowDownload: PropTypes.func,
    className: PropTypes.string,
    hideFunctions: PropTypes.array,
    fromType: PropTypes.number,
    error: PropTypes.bool,
  };

  state = {
    attachment: this.props.attachment,
  };

  handleShareNode = attachment => {
    const attachmentType =
      attachment.previewAttachmentType === 'KC' ? 2 : attachment.previewAttachmentType === 'QINIU' ? 0 : 1;
    import('src/components/shareAttachment/shareAttachment').then(share => {
      const params = {
        attachmentType,
      };
      const sourceNode = attachment.sourceNode;
      const isPicture = attachment.previewType === PREVIEW_TYPE.PICTURE;
      if (attachment.previewAttachmentType === 'KC') {
        params.id = sourceNode.id;
        params.name = sourceNode.name;
        params.ext = '.' + sourceNode.ext;
        params.size = sourceNode.size;
        params.imgSrc = isPicture ? `${attachment.viewUrl}|imageView2/2/w/490` : undefined;
        params.node = sourceNode;
      } else if (attachment.previewAttachmentType === 'COMMON') {
        params.id = sourceNode.fileID;
        params.name = sourceNode.originalFilename;
        params.ext = sourceNode.ext;
        params.size = sourceNode.filesize;
        params.imgSrc = isPicture ? `${attachment.viewUrl}|imageView2/2/w/490` : undefined;
        params.node = '';
      } else if (attachment.previewAttachmentType === 'QINIU') {
        params.name = attachment.name;
        params.ext = attachment.ext;
        params.size = sourceNode.size || 0;
        params.imgSrc = isPicture ? `${attachment.viewUrl}|imageView2/2/w/490` : undefined;
        params.qiniuPath = sourceNode.path;
        params.node = sourceNode;
      }
      share.default(params, {
        performUpdateItem: visibleType => {
          if (visibleType) {
            sourceNode.visibleType = visibleType;
            this.props.performUpdateItem(sourceNode);
          }
        },
      });
    });
  };

  handleLogin = () => {
    require(['mdDialog'], () => {
      const dialog = $.DialogLayer({
        container: {
          header: _l('保存到'),
          content: _l('请先登录'),
          yesText: _l('登录'),
          yesFn: () => {
            window.location = '/login.htm?ReturnUrl=' + encodeURIComponent(window.location.href);
          },
        },
      });
    });
  };

  downloadAttachment = () => {
    const { attachment } = this.props;
    const { canDownload } = previewUtil.getPermission(attachment, {
      hideFunctions: this.props.hideFunctions,
      fromType: this.props.fromType,
    });
    if (canDownload) {
      window.open(previewUtil.getDownloadUrl(attachment, this.props.extra));
    } else {
      alert(_l('您权限不足，无法下载或保存。请联系文件夹管理员或文件上传者'), 3);
    }
  };

  render() {
    const { attachment, fromType, hideFunctions, className, error, extra } = this.props;
    const { name, ext, previewType } = attachment;
    const deleted = error.status === LOADED_STATUS.DELETED;
    const {
      canEditFileName,
      showSaveToKnowlege,
      showShare,
      canSaveToKnowlege,
      canDownload,
      showDownload,
      showKcVersionPanel,
    } = deleted
      ? {}
      : previewUtil.getPermission(attachment, {
          deleteFunction: extra.deleteFunction,
          hideFunctions,
          fromType,
        });
    return (
      <div className={cx('previewHeader flexRow', className)}>
        <div className="flexRow Width500">
          <EditableBlock
            onChange={value => {
              this.props.renameFile(value);
            }}
            validateFileName={value => validateFileName(value, true, {}, { extLength: ext.length })}
            ext={'.' + ext}
            className="editName"
            value={name}
            canEdit={canEditFileName}
          />
          {showKcVersionPanel && (
            <div className="historyPanel historyVersion relative">
              <span className="normal" data-tip={_l('查看历史版本')}>
                <Icon
                  icon="restore2"
                  className="Hand Font16"
                  ref={list => {
                    this.eleKcVersionList = list;
                  }}
                  onClick={() => {
                    this.setState({ showKcVersionList: !this.state.showKcVersionList });
                  }}
                />
              </span>
              {this.state.showKcVersionList && (
                <Popup
                  withMask
                  style={{ left: -36, top: 54 }}
                  onClickAwayExceptions={[this.eleKcVersionList]}
                  onClickAway={() => {
                    this.setState({ showKcVersionList: false });
                  }}
                >
                  <div className="versionListCon">
                    <VersionList
                      attachment={attachment.sourceNode}
                      download={this.downloadAttachment}
                      callback={item => {
                        this.props.replaceAttachment(item, this.props.index, 'kc');
                        this.setState({ showKcVersionList: false });
                      }}
                      onClose={this.props.onClose}
                      performRemoveItems={this.props.performRemoveItems}
                      replaceAttachment={(item, outerItem) => {
                        this.props.replaceAttachment(item, this.props.index, 'kc');
                        if (outerItem) {
                          this.props.performUpdateItem(outerItem);
                        }
                      }}
                    />
                  </div>
                </Popup>
              )}
            </div>
          )}
        </div>
        <div className="flexRow flex newVersion">
          {showKcVersionPanel && attachment.sourceNode.canEdit && (
            <div className="viewHistory relative historyPanel Hand valignWrapper big">
              <UploadNewVersion
                item={attachment.sourceNode}
                callback={item => {
                  this.props.replaceAttachment(item, this.props.index, 'kc');
                  this.props.performUpdateItem(item);
                  const mdReplaceAttachment = this.props.extra.mdReplaceAttachment;
                  if (typeof mdReplaceAttachment === 'function') {
                    const originAttachment = this.props.originAttachments[this.props.index];
                    if (originAttachment) {
                      mdReplaceAttachment(
                        Object.assign({}, originAttachment, {
                          originalFilename: item.name,
                          filesize: item.size,
                          downloadUrl: item.downloadUrl,
                        }),
                      );
                    }
                  }
                }}
              />
              <Icon icon="knowledge-upload" />
              <span>{_l('上传新版本')}</span>
            </div>
          )}
        </div>
        <div className="flexRow Width500 btns">
          {showSaveToKnowlege && (
            <Trigger
              popupVisible={this.state.showSaveTo}
              onPopupVisibleChange={visible => {
                this.setState({
                  showSaveTo: visible,
                });
              }}
              action={['click']}
              popupClassName="DropdownPanelTrigger"
              popupPlacement="bottom"
              builtinPlacements={{
                bottom: {
                  points: ['tc', 'bc'],
                },
              }}
              popup={
                <Menu className="selectOptions" width={{ width: 120 }}>
                  <MenuItem
                    icon={<Icon icon="attachment" />}
                    onClick={() => {
                      this.setState({ showSaveTo: false });
                      if (!md.global.Account || !md.global.Account.accountId) {
                        this.handleLogin();
                        return;
                      }
                      if (canSaveToKnowlege) {
                        this.props.saveToKnowlwdge(1);
                      } else {
                        alert(_l('您权限不足，无法下载或保存。请联系文件夹管理员或文件上传者'), 3);
                      }
                    }}
                  >
                    {_l('我的文件')}
                  </MenuItem>
                  <MenuItem
                    icon={<Icon icon="task-folder-solid" />}
                    onClick={() => {
                      this.setState({ showSaveTo: false });
                      if (!md.global.Account || !md.global.Account.accountId) {
                        this.handleLogin();
                        return;
                      }
                      if (canSaveToKnowlege) {
                        this.props.saveToKnowlwdge(2);
                      } else {
                        alert(_l('您权限不足，无法下载或保存。请联系文件夹管理员或文件上传者'), 3);
                      }
                    }}
                  >
                    {_l('选择文件夹')}
                  </MenuItem>
                </Menu>
              }
              popupAlign={{ offset: [-80, -5] }}
            >
              <div className="saveTo">
                <span className="normal" data-tip={_l('添加到知识文件')}>
                  <Icon
                    icon="add-files"
                    className="Hand"
                    onClick={() => {
                      this.setState({
                        showSaveTo: !this.state.showSaveTo,
                      });
                    }}
                  />
                </span>
              </div>
            </Trigger>
          )}
          {canDownload && showShare && (
            <div className="shareNode">
              <span className="normal" data-tip={_l('分享')}>
                <i
                  className="icon-share Hand"
                  onClick={() => {
                    this.handleShareNode(attachment);
                  }}
                />
              </span>
            </div>
          )}
          {!deleted && showDownload && (
            <div className="download relative Hand" onClick={this.downloadAttachment} data-tip={_l('下载')}>
              <Icon icon="download" className="valignWrapper mTop1" />
            </div>
          )}
          {this.props.onClose && (
            <div
              className="close Hand"
              onClick={evt => {
                evt.nativeEvent.stopImmediatePropagation();
                this.props.onClose();
              }}
            >
              <span className="normal" data-tip={_l('关闭')}>
                <i className="icon-delete" />
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    attachment: state.attachments[state.index],
    originAttachments: state.originAttachments,
    index: state.index,
    error: state.error,
    extra: state.extra,
    performUpdateItem: state.extra.performUpdateItem || (() => {}),
    performRemoveItems: state.performRemoveItems,
    hideFunctions: state.hideFunctions,
    fromType: state.fromType,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    renameFile: bindActionCreators(renameFile, dispatch),
    saveToKnowlwdge: bindActionCreators(saveToKnowlwdge, dispatch),
    replaceAttachment: bindActionCreators(replaceAttachment, dispatch),
    updateAllowDownload: bindActionCreators(updateAllowDownload, dispatch),
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(PreviewHeader);

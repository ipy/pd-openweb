import React, { Component, Fragment } from 'react';
import { number, string, arrayOf, shape } from 'prop-types';
import cx from 'classnames';
import { Icon, Button, Menu, MenuItem } from 'ming-ui';
import { FLOW_NODE_TYPE_STATUS } from 'src/pages/workflow/MyProcess/config';
import { ACTION_LIST, OPERATION_LIST, SELECT_USER_TITLE, ACTION_TO_METHOD, OPERATION_TYPE } from './config';
import SvgIcon from 'src/components/SvgIcon';
import OtherAction from './OtherAction';
import AddApproveWay from './AddApproveWay';
import 'dialogSelectUser';
import instance from '../../api/instance';
import { add } from 'src/api/webCache';

export default class Header extends Component {
  static propTypes = {
    projectId: string,
    data: shape({
      flowNode: shape({ name: string, type: number }),
      operationTypeList: arrayOf(arrayOf(number)),
    }),
    currentWorkItem: shape({ operationTime: string }),
    errorMsg: string,
  };

  static defaultProps = {
    projectId: '',
    data: {},
    currentWorkItem: {},
    errorMsg: '',
  };

  state = {
    action: '',
    moreOperationVisible: false,
    addApproveWayVisible: false,
    otherActionVisible: false,
    selectedUser: {},
    selectedUsers: [],
    isRequest: false,
  };

  /**
   * 切换状态
   */
  switchStatus = (field, status) => {
    this.setState({
      [field]: status !== undefined ? status : !this.state[field],
    });
  };

  /**
   * 头部更多操作的处理逻辑
   */
  handleMoreOperation = action => {
    const { projectId, id, workId, onSubmit } = this.props;

    this.setState({ action });

    if (action === 'sign') {
      this.switchStatus('addApproveWayVisible', true);
    }

    if (action === 'print') {
      window.localStorage.setItem('plus_projectId', projectId);
      let printId = '';
      let isDefault = true;
      let printData = {
        printId,
        isDefault, // 系统打印模板
        worksheetId: '',
        projectId,
        id,
        rowId: '',
        getType: 1,
        viewId: '',
        appId: '',
        workId,
      };
      let printKey = Math.random()
        .toString(36)
        .substring(2);
      add({
        key: `${printKey}`,
        value: JSON.stringify(printData),
      });
      window.open(`/printForm/workflow/new/print/${printKey}`);
    }

    if (action === 'transferApprove' || action === 'transfer') {
      $({}).dialogSelectUser({
        title: SELECT_USER_TITLE[action],
        showMoreInvite: false,
        SelectUserSettings: {
          projectId,
          filterAll: true,
          filterFriend: true,
          filterOthers: true,
          filterOtherProject: true,
          filterAccountIds: [md.global.Account.accountId],
          unique: true,
          callback: user => {
            const selectedUser = user[0];
            this.setState({
              selectedUser,
              otherActionVisible: true,
            });
          },
        },
      });
    }

    if (action === 'addApprove') {
      $({}).dialogSelectUser({
        title: SELECT_USER_TITLE[action],
        showMoreInvite: false,
        SelectUserSettings: {
          projectId,
          filterAll: true,
          filterFriend: true,
          filterOthers: true,
          filterOtherProject: true,
          filterAccountIds: [md.global.Account.accountId],
          callback: selectedUsers => {
            this.setState({
              selectedUsers,
              otherActionVisible: true,
            });
          },
        },
      });
    }
  };

  handleClick = id => {
    const { onSubmit } = this.props;
    /**
     * 填写节点的提交点击后直接提交,不需要出备注弹层
     */
    if (id === 'submit') {
      this.request('submit');
      return;
    }

    /**
     * 撤回直接提交,不需要出备注弹层
     */
    if (id === 'revoke') {
      this.request('revoke');
      return;
    }

    if (onSubmit({ noSave: true })) {
      this.setState({ action: id, otherActionVisible: true });
    }
  };

  handleAction = ({ action, content, userId, backNodeId, signature }) => {
    content = content.trim();
    /**
     * 加签
     */
    if (_.includes(['before', 'after'], action)) {
      this.request(
        ACTION_TO_METHOD[action],
        { before: action === 'before', opinion: content, forwardAccountId: userId },
        action === 'before',
      );
    }

    /**
     * 转审或转交
     */
    if (_.includes(['transferApprove', 'transfer'], action)) {
      this.request(ACTION_TO_METHOD[action], { opinion: content, forwardAccountId: userId }, true);
    }

    /**
     * 通过或拒绝审批
     */
    if (_.includes(['pass', 'overrule'], action)) {
      this.request(ACTION_TO_METHOD[action], { opinion: content, backNodeId, signature });
    }

    /**
     * 添加审批人
     */
    if (_.includes(['addApprove'], action)) {
      this.request(
        'operation',
        { opinion: content, forwardAccountId: userId, operationType: OPERATION_TYPE[action] },
        true,
      );
    }
  };

  /**
   * 请求后台接口，因参数一致故统一处理
   */
  request = (action, restPara = {}, noSave = false) => {
    const { id, workId, onSave, onClose, onSubmit } = this.props;
    const { isRequest } = this.state;
    const saveFunction = error => {
      if (error) {
        this.setState({ isRequest: false });
      } else {
        instance[action]({ id, workId, ...restPara }).then(() => {
          onSave();
          onClose();
        });
      }
    };

    if (isRequest) {
      return;
    }

    this.setState({ isRequest: true, action });

    if (noSave) {
      saveFunction();
    } else {
      onSubmit({ callback: saveFunction });
    }
  };

  render() {
    const { projectId, currentWorkItem, data, errorMsg, id, workId, onSubmit } = this.props;
    const { flowNode, operationTypeList, btnMap = {}, app, processName } = data;
    const {
      moreOperationVisible,
      addApproveWayVisible,
      otherActionVisible,
      selectedUser,
      selectedUsers,
      action,
      isRequest,
    } = this.state;

    if (errorMsg) {
      return (
        <header className="flexRow workflowStepHeader">
          <div className="stepTitle flexRow errorHeader Gray_9e">
            <Icon icon="Import-failure" className="Font18" />
            <span className="Font14 ellipsis mLeft6">{errorMsg || 'text'}</span>
          </div>
        </header>
      );
    }

    if (flowNode) {
      const { text, color } =
        currentWorkItem.type !== 0 ? FLOW_NODE_TYPE_STATUS[currentWorkItem.type][currentWorkItem.operationType] : {};

      return (
        <Fragment>
          <header className="flexRow workflowStepHeader">
            <div className="workflowStepIcon" style={{ background: app.iconColor }}>
              <SvgIcon url={app.iconUrl} fill="#fff" size={20} addClassName="mTop1" />
            </div>
            <div className="flex mLeft10 mRight30 Font17 bold overflow_ellipsis" title={`${app.name} · ${processName}`}>
              {`${app.name} · ${processName}`}
            </div>

            {currentWorkItem.operationTime && !operationTypeList[0].length ? (
              <div className="operationTime flexRow Gray_9e Font14">
                {createTimeSpan(currentWorkItem.operationTime)}
                {text && (
                  <span className="mLeft5" style={{ color }}>
                    {text}
                  </span>
                )}
              </div>
            ) : (
              <div className="operation flexRow">
                {operationTypeList[0].map(item => {
                  let { id, text } = ACTION_LIST[item];
                  return (
                    <Button
                      disabled={isRequest && id === action}
                      key={id}
                      size={'tiny'}
                      onClick={() => this.handleClick(id)}
                      className={cx('headerBtn mLeft16', id)}
                    >
                      {isRequest && id === action ? _l('处理中...') : btnMap[item] || text}
                    </Button>
                  );
                })}
              </div>
            )}

            <div
              className="more flexRow tip-bottom mLeft30"
              onClick={() => this.setState({ moreOperationVisible: !moreOperationVisible })}
            >
              <div className="iconWrap flexRow" data-tip="更多操作">
                <Icon icon="more_horiz Gray_9e ThemeHoverColor3" />
              </div>

              {moreOperationVisible && (
                <Menu className="moreOperation" onClickAway={() => this.setState({ moreOperationVisible: false })}>
                  {operationTypeList[1].map((item, index) => (
                    <MenuItem key={index} onClick={() => this.handleMoreOperation(OPERATION_LIST[item].id)}>
                      <Icon icon={OPERATION_LIST[item].icon} />
                      <span className="actionText">{OPERATION_LIST[item].text}</span>
                    </MenuItem>
                  ))}

                  <MenuItem onClick={() => window.open(`/app/${app.id}/workflow/record/${id}/${workId}`)}>
                    <Icon icon="launch" />
                    <span className="actionText">{_l('新页面打开')}</span>
                  </MenuItem>
                </Menu>
              )}
            </div>
          </header>

          {addApproveWayVisible && (
            <AddApproveWay
              projectId={projectId}
              onOk={this.handleAction}
              onCancel={() => this.switchStatus('addApproveWayVisible', false)}
              onSubmit={onSubmit}
            />
          )}

          {otherActionVisible && (
            <OtherAction
              selectedUser={selectedUser}
              selectedUsers={selectedUsers}
              workId={workId}
              data={data}
              action={action}
              onOk={this.handleAction}
              onCancel={() => this.switchStatus('otherActionVisible', false)}
            />
          )}
        </Fragment>
      );
    }

    return null;
  }
}

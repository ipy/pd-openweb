import React, { Component, Fragment } from 'react';
import account from 'src/api/account';
import { encrypt, htmlEncodeReg } from 'src/util';
import './index.less';

export default class ExitDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
    };
  }

  handleSelct() {
    var $this = $(this);
    $this.dialogSelectUser({
      title: _l('指定管理员'),
      zIndex: 100,
      showMoreInvite: false,
      SelectUserSettings: {
        projectId: this.props.projectId,
        filterAll: true,
        filterFriend: true,
        filterOtherProject: true,
        filterAccountIds: [md.global.Account.accountId],
        unique: true,
        callback: userInfo => {
          this.setState({
            userInfo: userInfo[0],
          });
        },
      },
    });
  }

  handleExit() {
    var accountId = this.state.userInfo.accountId
    var $btn = $("#submitBtn");
    $btn
      .removeClass('Button--primary')
      .addClass('Button--disabled')
      .prop('disabled', true);
    account
      .exitProject({
        projectId: this.props.projectId,
        password: encrypt(this.props.password),
        newAdminAccountId: accountId,
      })
      .done(result => {
        switch (result) {
          case 1:
            alert(_l('退出成功'));
            this.props.closeDialog();
            this.props.getData();
            break;
          case 3:
            this.props.transferAdminProject(this.props.projectId, this.props.companyName, thi.props.password, result);
            break;
          case 4:
            alert(_l('您是该组织唯一成员，无法退出，请联系客服'), 3);
            break;
          case 0:
          default:
            alert(_l('操作失败'));
        }
      })
      .always(function() {
        $btn
          .addClass('Button--primary')
          .removeClass('Button--disabled')
          .prop('disabled', false);
      });
  }

  render() {
    const { needTransfer, companyName } = this.props;
    const { userInfo } = this.state;
    return (
      <Fragment>
        {needTransfer ? (
          <div className="mTop15 mBottom20 borderBox">
            <p>{_l('你是该组织唯一管理员，需要先移交管理身份再退出')}</p>
            <p>{_l('退出后，管理员可以在后台交接或分配您负责的剩余工作')}</p>
            <div>
              <span
                className="icon-addapplication Font32 ThemeColor3 ThemeHoverColor2 TxtMiddle Hand"
                onClick={() => this.handleSelct()}
              ></span>
              {userInfo.accountId ? (
                <span className="userTag TxtMiddle">
                  <span className="user" data-accountid={userInfo.accountId}>
                    <img src={userInfo.avatar} />
                    <span className="userfullname">{htmlEncodeReg(userInfo.fullname)}</span>
                  </span>
                </span>
              ) : (
                <span className="userTag TxtMiddle">{_l('未指定')}</span>
              )}
            </div>
            <button
              type="button"
              className="ming Button Button--primary Button--medium w100 exitProject"
              onClick={() => this.handleExit()}
            >
              {_l('确定')}
            </button>
          </div>
        ) : (
          <div className="mTop15 mBottom20 borderBox">
            <p>{_l('你确认要退出：%0 ?', companyName)}</p>
            <p>{_l('退出后，管理员可以在后台交接或分配您负责的剩余工作')}</p>
            <button
              type="button"
              id="submitBtn"
              className="ming Button Button--primary Button--medium w100 exitProject"
              onClick={() => this.handleExit()}
            >
              {_l('确定')}
            </button>
          </div>
        )}
      </Fragment>
    );
  }
}

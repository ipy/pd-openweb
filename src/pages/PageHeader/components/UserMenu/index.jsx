import React, { useState } from 'react';
import './index.less';
import login from 'src/api/login';
import { navigateTo } from 'src/router/navigateTo';
import MdFunction from 'mdFunction';
import { Support, Tooltip } from 'ming-ui';
import { removePssId } from 'src/util/pssId';
import cx from 'classnames';
const {
  app: {
    userMenu: { usersetcenter },
  },
} = window.private;

export default function UserMenu(props) {
  const [userVisible, handleChangeVisible] = useState(false);
  const logout = () => {
    window.currentLeave = true;

    login.loginOut().then(data => {
      if (data) {
        removePssId();
        window.localStorage.removeItem('LoginCheckList'); // accountId 和 encryptPassword 清理掉
        location.href = data.redirectUrl || '/network';
      }
    });
  };

  const renderTooltipText = () => {
    return (
      <div
        className="userSetTool"
        onMouseOver={() => {
          $('#userSet #userSetItem').addClass('active');
        }}
        onMouseLeave={() => {
          $('#userSet #userSetItem').removeClass('active');
        }}
      >
        <ul className="userSetTooltip">
          {_.map(md.global.Account.projects, project => {
            return (
              <li
                className="ThemeBGColor3"
                key={project.projectId}
                onClick={() => {
                  props.handleUserVisibleChange(false);
                  handleChangeVisible(false);
                  navigateTo(`/admin/home/${project.projectId}`);
                }}
              >
                <span>{project.companyName}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const projectLength = md.global.Account.projects.length;
  const isAccount = md.global.Account.guideSettings.accountMobilePhone || md.global.Account.guideSettings.accountEmail;

  return (
    <div id="userSet">
      <ul className="userSetUL">
        <li className="ThemeBGColor3" data-tag="account">
          <a href="/personal?type=information" className="Relative">
            <span className="icon icon-task-select-other" />
            {_l('个人账户')}
            {isAccount && <span class="warnLight warnLightUserSetPosition"></span>}
          </a>
        </li>

        {md.global.Account.superAdmin && (
          <li className="ThemeBGColor3" data-tag="privateDeployment">
            <a href="/privateDeployment">
              <span className="icon icon-settings Font16" />
              {_l('系统配置')}
            </a>
          </li>
        )}

        {projectLength ? (
          <li
            className="ThemeBGColor3"
            id="userSetItem"
            onClick={() => {
              projectLength === 1
                ? navigateTo(`/admin/home/${md.global.Account.projects[0].projectId}`)
                : null;
            }}
          >
            <Tooltip
              popupAlign={{
                points: ['tr', 'tl'],
                offset: [-2, -8],
                overflow: { adjustX: 0, adjustY: 5 },
              }}
              onPopupVisibleChange={userVisible => {
                handleChangeVisible(userVisible);
              }}
              action={['hover']}
              popup={renderTooltipText()}
              popupVisible={projectLength > 1 && userVisible}
            >
              <a className="Hand clearfix">
                <span className="icon icon-company" />
                {_l('组织管理')}
                {projectLength > 1 && <span className="Right icon-arrow-right font10 LineHeight36" />}
              </a>
            </Tooltip>
          </li>
        ) : (
          <li className="createCompany" data-tag="createCompany">
            <a href="/personal?type=enterprise" target="_blank">
              <span className="pAll5">{_l('全组织使用')}</span>
            </a>
          </li>
        )}
      </ul>
      <ul className={cx('userSetUL', { Hidden: usersetcenter })}>
        <li className="ThemeBGColor3">
          <a href="/mobile.htm" target="_blank">
            <span className="icon icon-phonelink" />
            {_l('App和客户端')}
          </a>
        </li>
        <li
          className="ThemeBGColor3"
          onClick={() => {
            require(['src/components/common/function'], mdFunction => {
              mdFunction.showFollowWeixinDialog();
            });
          }}
        >
          <a className="Hand">
            <span className="icon icon-weixin" />
            {_l('微信服务号')}
          </a>
        </li>
        <li className="ThemeBGColor3">
          <Support className="support" type={2} href="https://help.mingdao.com" text={_l('使用帮助')} />
        </li>
        <li className="ThemeBGColor3">
          <a href="https://learn.mingdao.net" target="_blank">
            <span className="icon icon-sidebar_video_tutorial" />
            {_l('视频教程')}
          </a>
        </li>
        <li className="ThemeBGColor3">
          <a href="http://blog.mingdao.com/" target="_blank">
            <span className="icon icon-blogs" />
            {_l('博客')}
          </a>
        </li>
      </ul>

      {md.global.Config.IsLocal && !md.global.SysSettings.hideDownloadApp && (
        <ul className="pTop5 pBottom5">
          <li className="ThemeBGColor3" data-tag="appInstallSetting">
            <a href="/appInstallSetting">
              <span className="icon icon-phonelink Font16" />
              {_l('App下载与设置')}
            </a>
          </li>
        </ul>
      )}

      <ul className="pTop5 pBottom5">
        <li className="ThemeBGColor3">
          <a onClick={logout} rel="external">
            <span className="icon icon-exit" />
            {_l('安全退出')}
          </a>
        </li>
      </ul>
    </div>
  );
}

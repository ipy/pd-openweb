import React, { Component } from 'react';
import SetInfoDialog from '../modules/SetInfoDialog';
import Config from '../../config';
import LoadDiv from 'ming-ui/components/LoadDiv';
import './index.less';

import projectController from 'src/api/project';
import projectSettingController from 'src/api/projectSetting';
import fixeddataController from 'src/api/fixedData';
import ClipboardButton from 'react-clipboard.js';
import cx from 'classnames';
import AdminCommon from 'src/pages/Admin/common/common';
import 'uploadAttachment';

const { admin: {commonInfo: {subDomainTotal,workPlace, closeNet}} } = window.private

export default class CommonInfo extends Component {
  constructor(props) {
    super(props);
    this.industries = [];
    this.state = {
      logo: '', //logo图片
      code: '', // 组织id
      homeImage: '',
      subDomain: '',
      companyDisplayName: '', //简称
      companyName: '', //全称
      companyNameEnglish: '', //英文名称
      industryId: '', //行业
      industryName: '',
      geographyName: '',
      geographyId: '', //所在地
      visibleType: 0,
      isLogOff: false,
      isUploading: false,
      isLoading: false,
      uploadLoading: false,
    };
  }

  componentDidMount() {
    this.getAllData();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.level !== this.props.level) {
      this.getAllData();
    }
  }

  getAllData() {
    this.setState({ isLoading: true });
    $.when(
      this.getCompanyCode(),
      this.getSysColor(),
      this.getSubDomainInfo(),
      this.getCommonInfo(),
      this.getIndustryList(),
      this.getLicenseType(),
    ).then(
      (
        code,
        { homeImage, logo },
        res,
        { companyDisplayName, companyName, companyNameEnglish, geographyId, industryId },
        { industries = [] },
        { logoffs },
      ) => {
        this.industries = industries;
        const current_industry = _.find(industries, item => item.id === industryId.toString()) || {};
        const industryName = current_industry.name;
        //获取地址
        if (geographyId) {
          fixeddataController.loadCityCountyById({ id: geographyId }).then(res => {
            this.setState({
              geographyName: _.get(res.values, 'displayText'),
            });
          });
        }
        // logoff
        const firstList = logoffs[0] || {};
        this.setState(
          {
            code,
            homeImage: `${homeImage}?imageView2/2/w/194/h/52/q/90`,
            logo,
            subDomain: (res && res.subDomain) || '',
            companyDisplayName,
            companyName,
            companyNameEnglish,
            geographyId,
            industryId,
            industryName,
            isLogOff: firstList.type === 1,
            isLoading: false,
          },
          () => {
            if (Config.project.licenseType === 0) {
              return;
            }
            this.postUploader();
          },
        );
      },
    );
  }

  //获取当前注销状态
  getLicenseType() {
    return projectController.getProjectLogOff({
      projectId: Config.projectId,
    });
  }

  //获取企业号
  getCompanyCode() {
    return Config.AdminController.corporateIdentity({
      projectId: Config.projectId,
    });
  }

  // 获取图片信息
  getSysColor() {
    return projectSettingController.getSysColor({
      projectId: Config.projectId,
    });
  }

  // 二级域名
  getSubDomainInfo() {
    return projectSettingController.getSubDomain({
      projectId: Config.projectId,
    });
  }

  //获取其他基本信息
  getCommonInfo() {
    return projectController.getProjectInfo({
      projectId: Config.projectId,
    });
  }

  //获取行业列表
  getIndustryList() {
    return fixeddataController.loadIndustry({});
  }

  //切换二级组件
  toggleComp(level) {
    this.props.setLevel(level);
  }

  //获取设置后的值并隐藏dialog
  updateValue(value) {
    this.setState({
      ...value,
      visibleType: 0,
    });
  }

  // 1: 名称, 2: 所在地，3: 行业
  updateVisible(visibleType) {
    this.setState({ visibleType });
  }

  postUploader() {
    if (this.state.uploadLoading) {
      return;
    }
    const _this = this;
    $('#hideUploadImage').uploadAttachment({
      filterExtensions: 'gif,png,jpg,jpeg,bmp',
      pluploadID: '#upload_image',
      multiSelection: false,
      maxTotalSize: 4,
      folder: 'ProjectLogo',
      onlyFolder: true,
      onlyOne: true,
      styleType: '0',
      tokenType: 4, //网络logo
      checkProjectLimitFileSizeUrl: '',
      filesAdded: function () {
        _this.setState({ uploadLoading: true });
      },
      callback: function (attachments) {
        if (attachments.length > 0) {
          const attachment = attachments[0];
          const fullFilePath = attachment.serverName + attachment.filePath + attachment.fileName + attachment.fileExt;
          const logoName = attachment.fileName + attachment.fileExt;
          _this.setLogo(fullFilePath, logoName);
        }
      },
    });
  }

  setLogo(fullFilePath, logoName) {
    projectSettingController
      .setLogo({
        logoName: logoName,
        projectId: Config.projectId,
      })
      .then(result => {
        if (result) {
          this.setState({
            logo: fullFilePath,
            uploadLoading: false,
          });
        } else {
          this.setState({
            uploadLoading: false,
          });
          alert(_l('保存失败'), 2);
        }
      });
  }

  handleCopyTextSuccess() {
    alert(_l('复制成功'));
  }

  render() {
    const {
      logo,
      companyDisplayName,
      companyName,
      companyNameEnglish,
      geographyId,
      industryId,
      industryName,
      geographyName,
      visibleType,
      subDomain,
      homeImage,
      code,
      isLogOff,
      isLoading,
    } = this.state;
    const showInfo = [1, 2, 3].indexOf(visibleType) > -1;
    return (
      <div className="system-set-box">
        <div className="system-set-header">
          <span className="Font17">{_l('组织信息')}</span>
        </div>
        <div className="system-set-content">
          {isLoading ? (
            <LoadDiv />
          ) : (
            <div className="common-info">
              {showInfo && (
                <SetInfoDialog
                  projectId={Config.projectId}
                  visibleType={visibleType}
                  companyDisplayName={companyDisplayName}
                  companyName={companyName}
                  companyNameEnglish={companyNameEnglish}
                  geographyId={geographyId}
                  geographyName={geographyName}
                  industryName={industryName}
                  industryId={industryId}
                  industries={this.industries}
                  updateValue={this.updateValue.bind(this)}
                />
              )}

              <div className="common-info-row">
                <div className="common-info-row-label">{_l('组织LOGO')}</div>
                <div className="common-info-row-content">
                  <div className="Hand">
                    <input id="hideUploadImage" type="file" className="Hidden" />
                    <div className="logoBoxBorder">
                      <img src={logo} alt="avatar" />
                      <div
                        className="logoIconBox"
                        id="upload_image"
                        onClick={() => {
                          if (Config.project.licenseType === 0) {
                            AdminCommon.freeUpdateDialog();
                            return;
                          }
                        }}
                      >
                        <span className="Font15 icon-upload_pictures"></span>
                      </div>
                    </div>
                  </div>
                  <div className="set-describe mTop10">{_l('推荐尺寸 400*180 px，显示在打印、分享和企业域名页面')}</div>
                </div>
                {/** 上传图片 */}
              </div>
              <div className="common-info-row mTop24">
                <div className="common-info-row-label">{_l('组织名称')}</div>
                {companyName && <span className="mRight16">{_l(`${companyName}`)}</span>}
                <button
                  type="button"
                  className="ming Button Button--link ThemeColor3 adminHoverColor"
                  onClick={this.updateVisible.bind(this, 1)}
                >
                  {_l('修改')}
                </button>
              </div>
              <div className="common-info-row mTop24">
                <div className="common-info-row-label">{_l('组织ID')}</div>
                <div className="common-info-row-content">
                  <ClipboardButton
                    className="adminHoverColor Hand"
                    component="span"
                    data-clipboard-text={code}
                    onSuccess={this.handleCopyTextSuccess.bind(this)}
                  >
                    <span>{code}</span>
                    <span className="icon-content-copy Font12 mLeft5"></span>
                  </ClipboardButton>
                  <div className="set-describe mTop4">{_l('成员可输入组织ID加入组织')}</div>
                </div>
              </div>
              <div className="common-info-row mTop24">
                <div className="common-info-row-label">{_l('组织编号')}</div>
                <div className="common-info-row-content">
                  <ClipboardButton
                    className="adminHoverColor Hand"
                    component="span"
                    data-clipboard-text={Config.projectId}
                    onSuccess={this.handleCopyTextSuccess.bind(this)}
                  >
                    <span>{Config.projectId}</span>
                    <span className="icon-content-copy Font12 mLeft5"></span>
                  </ClipboardButton>
                  <div className="set-describe mTop4">{_l('组织唯一身份编号，用于沟通反馈问题时使用')}</div>
                </div>
              </div>

              <div className="split-line"></div>

              <div className="common-info-row">
                <div className="common-info-row-label">{_l('所在地')}</div>
                {geographyName && <span className="mRight16">{geographyName}</span>}
                <button
                  type="button"
                  className="ming Button Button--link ThemeColor3 adminHoverColor"
                  onClick={this.updateVisible.bind(this, 2)}
                >
                  {geographyId ? _l('修改') : _l('设置')}
                </button>
              </div>
              <div className="common-info-row mTop24">
                <div className="common-info-row-label">{_l('所在行业')}</div>
                {industryName && <span className="mRight16">{industryName}</span>}
                <button
                  type="button"
                  className="ming Button Button--link ThemeColor3 adminHoverColor"
                  onClick={this.updateVisible.bind(this, 3)}
                >
                  {industryId ? _l('修改') : _l('设置')}
                </button>
              </div>
              <div className={cx("common-info-row mTop24", {Hidden: subDomainTotal})}>
                <div className="common-info-row-label">{_l('扩展信息')}</div>
                <div className="common-info-row-content">
                  <div>
                    {subDomain ? (
                      <span className="Font13">{subDomain}</span>
                    ) : (
                      <span className="set-describe">{_l('可自定义组织别名和登录背景图片')}</span>
                    )}
                    <button
                      type="button"
                      className="ming Button Button--link mLeft12 ThemeColor3 adminHoverColor"
                      onClick={() => {
                        if (Config.project.licenseType === 0) {
                          AdminCommon.freeUpdateDialog();
                          return;
                        }
                        this.toggleComp(2);
                      }}
                    >
                      {_l('设置')}
                    </button>
                  </div>
                  {homeImage && <img src={homeImage} className="domain-review" />}
                </div>
              </div>
              <div className={cx("common-info-row mTop24", {Hidden: workPlace})}>
                <div className="common-info-row-label">{_l('工作地点')}</div>
                <button
                  type="button"
                  className="ming Button Button--link ThemeColor3 adminHoverColor"
                  onClick={this.toggleComp.bind(this, 3)}
                >
                  {_l('设置')}
                </button>
              </div>

              {!closeNet&&<div className="split-line"></div>}

              <div className={cx("common-info-row", {Hidden: closeNet})}>
                <div className="common-info-row-label">{_l('注销组织')}</div>
                {isLogOff ? (
                  <div>
                    {_l('已申请注销')}
                    <button
                      type="button"
                      className="ming Button Button--link ThemeColor3 mLeft16"
                      onClick={() => this.props.setLevel(4)}
                    >
                      {_l('查看详情')}
                    </button>
                  </div>
                ) : (
                  <span className="Hand adminHoverDeleteColor" onClick={() => this.props.setLevel(4)}>
                    {_l('注销')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

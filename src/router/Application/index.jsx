import React, { Component } from 'react';
import { Switch } from 'react-router-dom';
import genRouteComponent from '../genRouteComponent';
import ROUTE_CONFIG from './config';
import ajaxRequest from 'src/api/homeApp';
import { LoadDiv } from 'ming-ui';
import UnusualContent from './UnusualContent';
import './index.less';
import { getIds } from '../../pages/PageHeader/util';
import { connect } from 'react-redux';
import { setAppStatus } from '../../pages/PageHeader/redux/action';

@connect(
  undefined,
  dispatch => ({ setAppStatus: status => dispatch(setAppStatus(status)) })
)
export default class Application extends Component {
  constructor(props) {
    super(props);
    this.genRouteComponent = genRouteComponent();
    this.state = {
      status: 0, // 0: 加载中 1:正常 2:关闭 3:删除 4:不是应用成员 5:是应用成员但未分配视图
    };
  }

  componentDidMount() {
    const { appId, worksheetId } = this.props.match.params;

    if (appId) {
      this.checkApp(appId);
    }

    // 老路由 先补齐参数
    if (worksheetId) {
      this.compatibleWorksheetRoute(worksheetId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.appId !== this.props.match.params.appId) {
      this.checkApp(nextProps.match.params.appId);
    }
  }

  /**
   * 检测应用有效性
   */
  checkApp(appId) {
    ajaxRequest
      .checkApp({ appId }, { silent: true })
      .then(status => {
        this.setState({ status });
        this.props.setAppStatus(status);
      })
      .fail(() => {
        this.setState({ status: 3 });
        this.props.setAppStatus({ status: 3 });
      });
  }

  /**
   * 兼容老路由补齐参数
   */
  compatibleWorksheetRoute(worksheetId) {
    ajaxRequest
      .getAppSimpleInfo({ workSheetId: worksheetId }, { silent: true })
      .then(result => {
        const { appId, appSectionId } = result;

        if (!appId || !appSectionId) {
          this.setState({ status: 3 });
        }
      })
      .fail(() => {
        this.setState({ status: 3 });
      });
  }

  render() {
    let { status } = this.state;
    const {
      location: { pathname },
    } = this.props;
    const { appId } = getIds(this.props);
    if (status === 0) {
      return <LoadDiv />;
    }
    if (_.includes([1], status) || (status === 5 && _.includes(pathname, 'role'))) {
      return <Switch>{this.genRouteComponent(ROUTE_CONFIG)}</Switch>;
    }
    return <UnusualContent status={status} appId={appId} />;
  }
}

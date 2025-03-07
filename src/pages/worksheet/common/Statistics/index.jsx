import React, { Component } from 'react';
import ReactDOM, { render } from 'react-dom';
import cx from 'classnames';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Icon, LoadDiv, Button, ScrollView } from 'ming-ui';
import { Tooltip } from 'antd';
import Card from './Card';
import ChartDialog from './ChartDialog';
import PageMove from './components/PageMove';
import reportConfig from './api/reportConfig';
import report from './api/report';
import reportSort from './api/reportSort';
import { reportTypes } from 'src/pages/worksheet/common/Statistics/Charts/common';
import './index.less';
const ClickAwayable = createDecoratedComponent(withClickAway);

const exceptions = [
  '.mui-dialog-container',
  '.GlobalStatisticsPanel',
  '.dropdownTrigger',
  '.openStatisticsBtn',
  '.selectUserBox',
  '.mdAlertDialog',
  '.PositionContainer-active',
  '.addFilterPopup',
  '#dialogBoxSelectUser_container',
  '#dialogSelectDept_container',
  '.ant-tooltip',
  '.ant-cascader-menus',
  '.ant-tree-select-dropdown',
  '.CityPickerPanelTrigger',
  '.ant-modal-mask',
  '.ant-modal-wrap',
  '.ant-select-dropdown',
  '.ant-dropdown',
  '.ant-dropdown-menu',
  '.ant-picker-dropdown',
];

const SortableItem = SortableElement(({ item, ...other }) => {
  return (
    <div className="StatisticsPanel-wrapper">
      <Card report={item} {...other} />
    </div>
  );
});

const SortableList = SortableContainer(({ list, width, ...other }) => {
  const emptys = Array.from({ length: 6 });
  return (
    <div className="StatisticsPanel-cards" style={{ width }}>
      {list.map((item, index) => (
        <SortableItem key={item.id} index={index} item={item} {...other} />
      ))}
      {width
        ? emptys.map((item, index) => (
            <div key={index} className="StatisticsPanel-wrapper statisticsCard-empty">
              <div className="statisticsCard" />
            </div>
          ))
        : null}
    </div>
  );
});

export default class Statistics extends Component {
  constructor(props) {
    super();
    this.state = {
      ownerId: '',
      dialogVisible: false,
      loading: true,
      reports: [],
      newReport: { name: _l('未命名') },
      roleType: 1,
      chartWidth: 0,
      pageIndex: 1,
      pageLoading: false,
      showPageMove: false,
      currentReportId: '',
    };
  }
  componentDidMount() {
    setTimeout(this.getReportConfigList.bind(this), 250);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      chartWidth: window.innerWidth - 230 - 120,
    });
  }
  componentWillUnmount() {
    const el = document.querySelector('.GlobalStatisticsPanel');
    if (!el) return;
    ReactDOM.unmountComponentAtNode(el);
    $(el).remove();
    $(window).off('resize', window.statisticsResize);
  }
  handleScrollEnd() {
    this.getReportConfigList();
  }
  getReportConfigList() {
    const { activeSheetId } = this.props;
    const { ownerId, pageIndex, reports, pageLoading, loading } = this.state;
    const loadingKey = pageIndex > 1 ? 'pageLoading' : 'loading';
    if ((pageIndex > 1 ? pageLoading : false) || !pageIndex) {
      return;
    }
    this.setState({
      [loadingKey]: true,
    });
    if (this.request && this.request.state() === 'pending') {
      this.request.abort();
    }
    this.request = report.list(
      {
        appId: activeSheetId,
        isOwner: !!ownerId,
        pageIndex,
        pageSize: 10,
      },
      { fireImmediately: false },
    );
    this.request.then(result => {
      this.setState({
        pageIndex: result.reports.length >= 10 ? pageIndex + 1 : 0,
        roleType: result.roleType,
        reports: reports.concat(result.reports),
        [loadingKey]: false,
        chartWidth: window.innerWidth - 230 - 120,
      });
    });
  }
  handleSwitchView(ownerId = this.state.ownerId) {
    this.setState(
      {
        ownerId,
        pageIndex: 1,
        reports: [],
        loading: false,
      },
      this.getReportConfigList,
    );
  }
  handleUpdateOwnerId({ id }) {
    const { ownerId, reports } = this.state;
    reportConfig
      .updateOwnerId({
        ownerId: ownerId ? '' : md.global.Account.accountId,
        reportId: id,
      })
      .then(result => {
        if (result) {
          alert(_l('移出成功'));
          this.setState({
            reports: reports.filter(item => item.id !== id),
          });
        }
      });
  }
  handleChangeCopyCustomPageVisible({ id }) {
    this.setState({
      currentReportId: id,
      showPageMove: true,
    });
  }
  handleCopyCustomPage(pageId) {
    const { currentReportId } = this.state;
    reportConfig
      .copyReport({
        reportId: currentReportId,
        sourceType: 1,
        pageId,
      })
      .then(result => {
        alert(_l('操作成功'));
      });
  }
  handleUpdateName(id, name) {
    const { ownerId, reports } = this.state;
    const newReports = reports.map(item => {
      if (item.id === id) {
        item.name = name;
      }
      return item;
    });
    this.setState({
      reports: newReports,
    });
  }
  handleDelete(reportId) {
    const { reports } = this.state;
    reportConfig
      .deleteReport({
        reportId,
      })
      .then(result => {
        this.setState({
          reports: reports.filter(item => item.id !== reportId),
        });
      });
  }

  handleOpenGlobalStatisticsPanel() {
    const { isFullScreen, activeSheetId } = this.props;
    const props = {
      activeSheetId,
      isFullScreen: true,
      onClose: _.noop,
    };
    if (isFullScreen) {
      const el = document.querySelector('.GlobalStatisticsPanel');
      ReactDOM.unmountComponentAtNode(el);
      $(el).remove();
      $(window).off('resize', window.statisticsResize);
    } else {
      const div = document.createElement('DIV');
      div.className = 'GlobalStatisticsPanel';
      $('#container').append(div);
      render(<Statistics {...props} />, document.querySelector('.GlobalStatisticsPanel'));
      window.statisticsResize = _.debounce(() => {
        render(<Statistics {...props} />, document.querySelector('.GlobalStatisticsPanel'));
      }, 200);
      $(window).on('resize', window.statisticsResize);
    }
  }
  handleSortEnd({ oldIndex, newIndex }) {
    if (oldIndex === newIndex) return;
    const { activeSheetId } = this.props;
    const { reports, ownerId } = this.state;
    const newReports = arrayMove(reports, oldIndex, newIndex);
    this.setState({
      reports: newReports,
    });
    reportSort
      .updateReportSort({
        appId: activeSheetId,
        isOwner: !!ownerId,
        reportIds: newReports.map(item => item.id),
      })
      .then(
        result => {},
        error => {
          this.setState({
            reports,
          });
        },
      );
  }
  handleUpdateDialogVisible({ dialogVisible, isRequest }) {
    this.setState({
      dialogVisible,
      newReport: { name: _l('未命名') },
    });
    if (isRequest) {
      this.handleSwitchView();
    }
  }
  shouldCancelStart({ target }) {
    return !target.classList.contains('icon-drag');
  }
  handleBlur(event) {
    const { value } = event.target;
    this.setState({
      newReport: { name: value },
    });
  }
  renderDialog() {
    const { showPageMove } = this.state;
    return (
      showPageMove && (
        <PageMove
          appId={this.props.appId}
          onOk={pageId => {
            this.handleCopyCustomPage(pageId);
          }}
          onCancel={() => {
            this.setState({
              showPageMove: false,
              currentReportId: '',
            });
          }}
        />
      )
    );
  }
  renderHeader() {
    const { ownerId, roleType } = this.state;
    const { isFullScreen } = this.props;
    return (
      <div className="StatisticsPanel-header">
        <div className="title">{_l('统计')}</div>
        <div className="flexRow Relative">
          <div
            className={cx('commonality', { ThemeColor3: !ownerId, active: !ownerId })}
            onClick={this.handleSwitchView.bind(this, '')}
          >
            {_l('公共')}
          </div>
          <div
            className={cx('personal', { ThemeColor3: ownerId, active: ownerId })}
            onClick={this.handleSwitchView.bind(this, md.global.Account.accountId)}
          >
            {_l('个人')}
          </div>
        </div>
        <div className="flexRow btns">
          {(roleType === 1 || roleType === 2 || ownerId) && (
            <Tooltip title={ownerId ? _l('新建个人图表') : _l('新建公共图表')} placement="bottom">
              <Icon
                onClick={() => {
                  this.setState({ dialogVisible: true });
                }}
                icon="plus"
                className="ThemeHoverColor3 Gray_9e"
              />
            </Tooltip>
          )}
          <Tooltip title={isFullScreen ? _l('小屏') : _l('全屏')} placement="bottom">
            <Icon
              onClick={this.handleOpenGlobalStatisticsPanel.bind(this)}
              icon={isFullScreen ? 'worksheet_narrow' : 'worksheet_enlarge'}
              className="ThemeHoverColor3 Gray_9e"
            />
          </Tooltip>
        </div>
      </div>
    );
  }
  renderContent() {
    const { isFullScreen, ...other } = this.props;
    const { reports, chartWidth, ownerId, roleType, pageLoading } = this.state;
    const sortableListProps = {
      ...other,
      axis: 'xy',
      roleType,
      ownerId,
      list: reports,
      helperClass: 'sortableCard',
      shouldCancelStart: this.shouldCancelStart,
      onSortEnd: this.handleSortEnd.bind(this),
      width: isFullScreen ? chartWidth : '',
      onUpdateOwnerId: this.handleUpdateOwnerId.bind(this),
      onCopyCustomPage: this.handleChangeCopyCustomPageVisible.bind(this),
      onUpdateName: this.handleUpdateName.bind(this),
      onDelete: this.handleDelete.bind(this),
      onGetReportConfigList: this.handleSwitchView.bind(this),
    };
    return (
      <ScrollView className="flex" onScrollEnd={this.handleScrollEnd.bind(this)}>
        <div className="StatisticsPanel-content">
          <SortableList {...sortableListProps} />
          {pageLoading ? <LoadDiv /> : null}
        </div>
      </ScrollView>
    );
  }
  renderCommonalityNoData() {
    const { roleType, ownerId } = this.state;
    return (
      <div className="StatisticsPanel-nodata">
        <Icon icon="worksheet_public" />
        <div className="prompt Font17 TxtCenter mBottom12">
          {_l('自由定义图表，支持数量或数值统计、维度或周期对比、数据透视等多种分析')}
        </div>
        <div className="prompt Font14 TxtCenter">{_l('管理员可把个人图表转为公共，供成员一同使用')}</div>
        {(roleType === 1 || roleType === 2 || ownerId) && (
          <Button
            onClick={() => {
              this.setState({ dialogVisible: true });
            }}
            type="primary"
          >
            {_l('创建图表')}
          </Button>
        )}
      </div>
    );
  }
  renderPersonageNoData() {
    return (
      <div className="StatisticsPanel-nodata">
        <Icon icon="person1" />
        <div className="prompt Font17 TxtCenter">{_l('还没有个人图表')}</div>
        <Button
          onClick={() => {
            this.setState({ dialogVisible: true });
          }}
          type="primary"
          className="mTop24"
        >
          {_l('创建图表')}
        </Button>
      </div>
    );
  }
  render() {
    const { dialogVisible, newReport, loading, reports, ownerId } = this.state;
    return (
      <div className="StatisticsPanel">
        <ClickAwayable onClickAway={this.props.onClose.bind(this)} onClickAwayExceptions={exceptions}>
          {this.renderHeader()}
          {loading ? (
            <div className="StatisticsPanel-nodata">
              <LoadDiv />
            </div>
          ) : reports.length ? (
            this.renderContent()
          ) : ownerId ? (
            this.renderPersonageNoData()
          ) : (
            this.renderCommonalityNoData()
          )}
          {dialogVisible ? (
            <ChartDialog
              {...this.props}
              chartType={reportTypes.BarChart}
              settingVisible={true}
              isPublic={!ownerId}
              permissions={true}
              report={newReport}
              onBlur={this.handleBlur.bind(this)}
              updateDialogVisible={this.handleUpdateDialogVisible.bind(this)}
            />
          ) : null}
          {this.renderDialog()}
        </ClickAwayable>
      </div>
    );
  }
}

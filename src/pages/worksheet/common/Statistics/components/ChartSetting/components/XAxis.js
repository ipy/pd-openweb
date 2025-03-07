import React, { Component } from 'react';
import { Icon } from 'ming-ui';
import { Menu, Dropdown, Tooltip } from 'antd';
import WithoutFidldItem from './WithoutFidldItem';
import RenameModal from './RenameModal';
import {
  timeParticleSizeDropdownData,
  areaParticleSizeDropdownData,
  isXAxisControl,
  isAreaControl,
  isTimeControl,
  isOptionControl
} from 'src/pages/worksheet/common/Statistics/common';
import { reportTypes } from 'src/pages/worksheet/common/Statistics/Charts/common';

const emptyTypes = [{
  value: 0,
  name: _l('隐藏')
}, {
  value: 1,
  name: _l('显示为 0')
}, {
  value: 2,
  name: _l('显示为 --')
}];

export default class XAxis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
    };
  }
  handleUpdateTimeParticleSizeType = value => {
    const { xaxes, sorts } = this.props.currentReport;
    const id = xaxes.particleSizeType ? `${xaxes.controlId}-${xaxes.particleSizeType}` : xaxes.controlId;
    this.props.onChangeCurrentReport(
      {
        xaxes: {
          ...xaxes,
          particleSizeType: value,
        },
        sorts: sorts.filter(item => _.findKey(item) !== id)
      },
      true,
    );
  };
  handleVerification = (data, isAlert = false) => {
    const { reportType } = this.props.currentReport;
    if ([reportTypes.CountryLayer].includes(reportType) && !isAreaControl(data.type)) {
      isAlert && alert(_l('行政区域图仅支持地区字段可作为x轴维度'), 2);
      return false;
    }
    if ([reportTypes.RadarChart, reportTypes.FunnelChart].includes(reportType) && isTimeControl(data.type)) {
      isAlert && alert(_l('时间类型不能作为x轴维度'), 2);
      return false;
    }
    if (isXAxisControl(data.type)) {
      return true;
    } else {
      isAlert && alert(_l('该字段不能作为x轴维度'), 2);
      return false;
    }
  };
  handleAddControl = data => {
    const { reportType, xaxes, displaySetup } = this.props.currentReport;

    if (this.handleVerification(data, true)) {
      const isTime = isTimeControl(data.type);
      const isArea = isAreaControl(data.type);
      this.props.onChangeCurrentReport(
        {
          xaxes: {
            ...xaxes,
            controlId: data.controlId,
            controlName: data.controlName,
            controlType: data.type,
            particleSizeType: isTime || isArea ? 1 : 0,
            emptyType: 0,
            xaxisEmpty: false,
          },
          displaySetup: {
            ...displaySetup,
            xdisplay: {
              ...displaySetup.xdisplay,
              title: data.controlName,
            },
          },
        },
        true,
      );
    }
  };
  handleChangeRename = rename => {
    const { xaxes } = this.props.currentReport;
    this.props.onChangeCurrentReport(
      {
        xaxes: {
          ...xaxes,
          rename,
        },
      },
      true,
    );
    this.setState({ dialogVisible: false });
  };
  handleClear = () => {
    const { xaxes, sorts } = this.props.currentReport;
    const id = xaxes.particleSizeType ? `${xaxes.controlId}-${xaxes.particleSizeType}` : xaxes.controlId;
    this.props.onChangeCurrentReport(
      {
        xaxes: {
          ...xaxes,
          controlId: null,
          controlName: null,
          controlType: null,
          emptyType: 0,
          xaxisEmpty: false,
        },
        sorts: sorts.filter(item => _.findKey(item) !== id)
      },
      true,
    );
  };
  handleUpdateEmptyType = (emptyType) => {
    const { xaxes } = this.props.currentReport;
    this.props.onChangeCurrentReport(
      {
        xaxes: {
          ...xaxes,
          emptyType
        },
      },
      true,
    );
  };
  handleUpdateXaxisEmpty = (xaxisEmpty) => {
    const { xaxes } = this.props.currentReport;
    this.props.onChangeCurrentReport(
      {
        xaxes: {
          ...xaxes,
          xaxisEmpty
        },
      },
      true,
    );
  }
  renderModal() {
    const { dialogVisible } = this.state;
    const { xaxes } = this.props.currentReport;
    return (
      <RenameModal
        dialogVisible={dialogVisible}
        rename={xaxes.rename || xaxes.controlName}
        onChangeRename={this.handleChangeRename}
        onHideDialogVisible={() => {
          this.setState({
            dialogVisible: false,
          });
        }}
      />
    );
  }
  renderOverlay() {
    const { disableParticleSizeTypes } = this.props;
    const { xaxes, reportType } = this.props.currentReport;
    const isOption = isOptionControl(xaxes.controlType);
    const isTime = isTimeControl(xaxes.controlType);
    const isArea = reportType !== reportTypes.CountryLayer && isAreaControl(xaxes.controlType);
    const timeData = (isTime
    ? xaxes.controlType === 16
      ? timeParticleSizeDropdownData
      : timeParticleSizeDropdownData.filter(item => ![6, 7].includes(item.value))
    : []).filter(item => ![8, 9, 10, 11].includes(item.value));
    const timeGather = timeParticleSizeDropdownData.filter(item => [8, 9, 10, 11].includes(item.value));
    return (
      <Menu className="chartControlMenu chartMenu">
        <Menu.Item
          onClick={() => {
            this.setState({ dialogVisible: true });
          }}
        >
          {_l('重命名')}
        </Menu.Item>
        {isTime && (
          <Menu.SubMenu popupClassName="chartMenu" title={_l('归组')} popupOffset={[0, -15]}>
            <Menu.ItemGroup title={_l('时间')}>
              {timeData.map(item => (
                <Menu.Item
                  className="valignWrapper"
                  disabled={item.value === xaxes.particleSizeType ? true : disableParticleSizeTypes.includes(item.value)}
                  style={{ width: 200, color: item.value === (xaxes.particleSizeType || 1) ? '#1e88e5' : null }}
                  key={item.value}
                  onClick={() => {
                    this.handleUpdateTimeParticleSizeType(item.value);
                  }}
                >
                  <div className="flex">{item.text}</div>
                  <div className="Gray_75 Font12">{item.getTime()}</div>
                </Menu.Item>
              ))}
            </Menu.ItemGroup>
            <Menu.Divider />
            <Menu.ItemGroup title={_l('集合')}>
              {timeGather.map(item => (
                <Menu.Item
                  className="valignWrapper"
                  disabled={item.value === xaxes.particleSizeType ? true : disableParticleSizeTypes.includes(item.value)}
                  style={{ width: 200, color: item.value === (xaxes.particleSizeType || 1) ? '#1e88e5' : null }}
                  key={item.value}
                  onClick={() => {
                    this.handleUpdateTimeParticleSizeType(item.value);
                  }}
                >
                  <div className="flex">{item.text}</div>
                  <div className="Gray_75 Font12">{item.getTime()}</div>
                </Menu.Item>
              ))}
            </Menu.ItemGroup>
          </Menu.SubMenu>
        )}
        {isArea && (
          <Menu.SubMenu popupClassName="chartMenu" title={_l('归组')} popupOffset={[0, -15]}>
            {areaParticleSizeDropdownData.map(item => (
              <Menu.Item
                disabled={item.value === xaxes.particleSizeType ? true : disableParticleSizeTypes.includes(item.value)}
                style={{ width: 120, color: item.value === (xaxes.particleSizeType || 1) ? '#1e88e5' : null }}
                key={item.value}
                onClick={() => {
                  this.handleUpdateTimeParticleSizeType(item.value);
                }}
              >
                {item.text}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        )}
        {[reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes, reportTypes.RadarChart].includes(
          reportType,
        ) && (isTime || isOption) && (
          <Menu.SubMenu
            popupClassName="chartMenu"
            title={(
              <div className="flexRow valignWrapper w100">
                <div className="flex">{_l('无记录的项目')}</div>
                <div className="Font12 Gray_75 emptyTypeName">{xaxes.emptyType ? _l('显示') : _l('隐藏')}</div>
              </div>
            )}
            popupOffset={[0, -15]}
          >
            {
              emptyTypes.map(item => (
                <Menu.Item
                  key={item.value}
                  style={{ color: item.value === xaxes.emptyType ? '#1e88e5' : null }}
                  onClick={() => { this.handleUpdateEmptyType(item.value) }}
                >
                  {item.name}
                </Menu.Item>
              ))
            }
          </Menu.SubMenu>
        )}
        {!isTime && (
          <Menu.Item
            className="flexRow valignWrapper"
            onClick={() => {
              this.handleUpdateXaxisEmpty(!xaxes.xaxisEmpty);
            }}
          >
            <div className="flex">{_l('统计空值')}</div>
            {xaxes.xaxisEmpty && <Icon icon="done" className="Font17"/>}
          </Menu.Item>
        )}
      </Menu>
    );
  }
  renderAxis() {
    const { xaxes, reportType } = this.props.currentReport;
    const tip = xaxes.rename && xaxes.rename !== xaxes.controlName ? xaxes.controlName : null;
    const isTime = isTimeControl(xaxes.controlType);
    const isArea = reportType !== reportTypes.CountryLayer && isAreaControl(xaxes.controlType);
    return (
      <div className="flexRow valignWrapper fidldItem">
        <Tooltip title={tip}>
          <span className="Gray flex ellipsis">
            {xaxes.rename || xaxes.controlName || _l('该控件不存在')}
            {isTime && ` (${_.find(timeParticleSizeDropdownData, { value: xaxes.particleSizeType || 1 }).text})`}
            {isArea && ` (${_.find(areaParticleSizeDropdownData, { value: xaxes.particleSizeType || 1 }).text})`}
          </span>
        </Tooltip>
        <Dropdown overlay={this.renderOverlay()} trigger={['click']}>
          <Icon className="Gray_9e Font18 pointer" icon="arrow-down-border" />
        </Dropdown>
        <Icon className="Gray_9e Font18 pointer mLeft10" icon="close" onClick={this.handleClear} />
      </div>
    );
  }
  render() {
    const { name, currentReport } = this.props;
    return (
      <div className="fieldWrapper mBottom20">
        <div className="Bold mBottom12">{name}</div>
        {currentReport.xaxes.controlId ? (
          this.renderAxis()
        ) : (
          <WithoutFidldItem onVerification={this.handleVerification} onAddControl={this.handleAddControl} />
        )}
        {this.renderModal()}
      </div>
    );
  }
}

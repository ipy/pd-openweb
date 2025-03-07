import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Collapse, Select, Input } from 'antd';
import { reportTypes, numberLevel } from 'src/pages/worksheet/common/Statistics/Charts/common';

class Unit extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleChangeMagnitude = (value, current) => {
    const { yaxisList, onChangeYaxisList } = this.props;
    const data = _.cloneDeep(yaxisList).map(item => {
      if (item.controlId === current.controlId) {
        const { suffix } = _.find(numberLevel, { value });
        item.magnitude = value;
        item.suffix = suffix;
        if (value === 0) {
          item.ydot = 2;
        } else if (value === 1) {
          item.ydot = '';
        } else {
          item.ydot = 0;
        }
      }
      return item;
    });
    onChangeYaxisList({
      yaxisList: data,
    });
  };
  handleChangeYdot = (value, current) => {
    const { yaxisList, onChangeYaxisList } = this.props;
    let count = '';

    if (value) {
      count = parseInt(value);
      count = isNaN(count) ? 0 : count;
      count = count > 9 ? 9 : count;
    }

    if (current.magnitude === 1) {
      return;
    }

    const data = _.cloneDeep(yaxisList).map(item => {
      if (item.controlId === current.controlId) {
        item.ydot = item.magnitude ? count || 0 : count;
      }
      return item;
    });

    onChangeYaxisList({
      yaxisList: data,
    });
  };
  handleChangeSuffix = (value, current) => {
    const { yaxisList, onChangeYaxisList } = this.props;
    const data = _.cloneDeep(yaxisList).map(item => {
      if (item.controlId === current.controlId) {
        item.suffix = value;
      }
      return item;
    });
    onChangeYaxisList({
      yaxisList: data,
    });
  };
  render() {
    const { data, isPivotTable } = this.props;
    const { magnitude, ydot, suffix } = data;
    return (
      <Fragment>
        <div className="mBottom15">
          <div className="mBottom8">{_l('数值数量级')}</div>
          <Select
            className="chartSelect w100"
            value={magnitude}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              this.handleChangeMagnitude(value, data);
            }}
          >
            {(isPivotTable ? numberLevel.filter(item => item.value) : numberLevel).map(item => (
              <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
                {item.text}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="mBottom15">
          <div className="mBottom8">{_l('保留小数')}</div>
          <Input
            className="chartInput"
            value={[1].includes(magnitude) ? '' : ydot}
            disabled={[1].includes(magnitude)}
            onChange={event => {
              this.handleChangeYdot(event.target.value, data);
            }}
            suffix={
              <div className="flexColumn">
                <Icon
                  icon="expand_less"
                  className="Gray_9e Font20 pointer mBottom2"
                  onClick={() => {
                    let newYdot = Number(ydot);
                    this.handleChangeYdot(newYdot + 1, data);
                  }}
                />
                <Icon
                  icon="expand_more"
                  className="Gray_9e Font20 pointer mTop2"
                  onClick={() => {
                    let newYdot = Number(ydot);
                    this.handleChangeYdot(newYdot ? newYdot - 1 : 0, data);
                  }}
                />
              </div>
            }
          />
        </div>
        <div className="mBottom15">
          <div className="mBottom8">{_l('后缀')}</div>
          <Input
            className="chartInput"
            value={suffix}
            disabled={[0].includes(magnitude)}
            onChange={event => {
              this.handleChangeSuffix(event.target.value, data);
            }}
          />
        </div>
      </Fragment>
    );
  }
}

export default function unitPanelGenerator(props) {
  const { currentReport, onChangeCurrentReport, ...collapseProps } = props;
  const { reportType, yaxisList, rightY } = currentReport;
  const isPivotTable = reportType === reportTypes.PivotTable;
  const isDualAxes = reportType === reportTypes.DualAxes;
  const rightYaxisList = rightY ? rightY.yaxisList : [];
  const firstYaxis = yaxisList[0];
  const firstRightYaxis = rightYaxisList[0];
  return (
    <Fragment>
      {isPivotTable ? (
        <Collapse.Panel header={_l('显示单位')} key="pivotTableUnit" {...collapseProps}>
          {
            yaxisList.map(item => (
              <Fragment>
                <div className="mBottom12 Bold Gray_75">{item.controlName}</div>
                <Unit
                  data={item}
                  yaxisList={yaxisList}
                  onChangeYaxisList={data => {
                    onChangeCurrentReport({
                      ...data,
                      displaySetup: {
                        ...currentReport.displaySetup,
                        magnitudeUpdateFlag: Date.now(),
                      },
                    });
                  }}
                />
              </Fragment>
            ))
          }
        </Collapse.Panel>
      ) : (
        <Collapse.Panel header={_l('显示单位')} key="leftUnit" {...collapseProps}>
          {firstYaxis && (
            <Fragment>
              {isDualAxes && <div className="mBottom12 Bold Gray_75">{_l('左Y轴')}</div>}
              <Unit
                data={firstYaxis}
                yaxisList={yaxisList}
                onChangeYaxisList={data => {
                  onChangeCurrentReport({
                    ...data,
                    displaySetup: {
                      ...currentReport.displaySetup,
                      magnitudeUpdateFlag: Date.now(),
                    },
                  });
                }}
              />
            </Fragment>
          )}
          {firstRightYaxis && (
            <Fragment>
              <div className="mBottom12 Bold Gray_75">{_l('右Y轴')}</div>
              <Unit
                data={firstRightYaxis}
                yaxisList={rightYaxisList}
                onChangeYaxisList={data => {
                  onChangeCurrentReport({
                    displaySetup: {
                      ...currentReport.displaySetup,
                      magnitudeUpdateFlag: Date.now(),
                    },
                    rightY: {
                      ...currentReport.rightY,
                      ...data,
                    },
                  });
                }}
              />
            </Fragment>
          )}
        </Collapse.Panel>
      )}
    </Fragment>
  );
}

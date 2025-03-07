import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Select, Input } from 'antd';
import { normTypes } from 'src/pages/worksheet/common/Statistics/common';

export default class Count extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  getLocationTypes() {
    const { locationType } = this.props;
    if (locationType === 'line') {
      const lineLocationTypes = [
        {
          value: 1,
          text: _l('上方'),
        },
        {
          value: 2,
          text: _l('下方'),
        },
      ];
      return lineLocationTypes;
    }
    if (locationType === 'column') {
      const columnLocationTypes = [
        {
          value: 3,
          text: _l('左侧'),
        },
        {
          value: 4,
          text: _l('右侧'),
        },
      ];
      return columnLocationTypes;
    }
  }
  render() {
    const { smallTitle, isPivotTable, summary, yaxisList, extra, onChangeSummary } = this.props;
    return (
      <Fragment>
        {isPivotTable && extra}
        {smallTitle && smallTitle}
        {!isPivotTable && (
          <div className="mBottom16">
            <div className="mBottom8">{_l('显示字段')}</div>
            <Select
              className="chartSelect w100"
              value={summary.controlId}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={value => {
                onChangeSummary({
                  controlId: value,
                });
              }}
            >
              <Select.Option className="selectOptionWrapper" value="">
                {_l('全部')}
              </Select.Option>
              {yaxisList.map(item => (
                <Select.Option className="selectOptionWrapper" key={item.controlId} value={item.controlId}>
                  {item.controlName}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
        {(isPivotTable ? true : summary.controlId) && (
          <div className="mBottom16">
            <div className="mBottom8">{_l('汇总方式')}</div>
            <div className="chartTypeSelect flexRow valignWrapper">
              {normTypes.map(item => (
                <div
                  key={item.value}
                  className={cx('flex centerAlign pointer Gray_75', { active: summary.type == item.value })}
                  onClick={() => {
                    const isDefault = normTypes.map(item => item.text).includes(summary.name);
                    onChangeSummary({
                      type: item.value,
                      name: isDefault ? item.text : summary.name,
                    });
                  }}
                >
                  {item.alias || item.text}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mBottom16">
          <div className="mBottom8">{_l('名称')}</div>
          <Input
            value={summary.name}
            className="chartInput w100"
            onChange={event => {
              onChangeSummary(
                {
                  name: event.target.value,
                },
                false,
              );
            }}
          />
        </div>
        {isPivotTable && (
          <div className="mBottom16">
            <div className="mBottom8">{_l('位置')}</div>
            <div className="chartTypeSelect flexRow valignWrapper">
              {this.getLocationTypes().map(item => (
                <div
                  key={item.value}
                  className={cx('flex centerAlign pointer Gray_75', { active: summary.location == item.value })}
                  onClick={() => {
                    onChangeSummary({
                      location: item.value,
                    });
                  }}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

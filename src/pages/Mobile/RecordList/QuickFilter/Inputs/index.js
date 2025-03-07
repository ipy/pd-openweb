import React from 'react';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { FILTER_CONDITION_TYPE, DATE_OPTIONS } from 'worksheet/common/WorkSheetFilter/enum';
import Number from './Number';
import RelateRecord from './RelateRecord';
import Options from './Options';
import DateTime from './DateTime';
import CheckboxComp from './CheckboxComp';
import _ from 'lodash';
import { shape } from 'prop-types';

export function conditionAdapter(condition) {
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 电话号码
        WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE,
      ],
      condition.control.type,
    )
  ) {
    condition.filterType = 1;
  }
  delete condition.control;
  return condition;
}

export const formatQuickFilter = (filter) => {
  return filter.map(c => {
    let result = { ...c };
    if (c.values) {
      result.values = result.values.filter(_.identity);
    }
    if (c.dataType === 29) {
      result.values = result.values.map(v => v.rowid);
    }
    return result;
  });
}

const Comps = {};

function mapToComp(keys, Comp) {
  keys.forEach(key => (Comps[key] = Comp));
}

export const NumberTypes = [
  WIDGETS_TO_API_TYPE_ENUM.NUMBER, // 数值
  WIDGETS_TO_API_TYPE_ENUM.MONEY, // 金额
];
mapToComp(NumberTypes, Number);

export const RelateRecordTypes = [
  WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET, // 关联
];
mapToComp(RelateRecordTypes, RelateRecord);

export const OptionsTypes = [
  WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 单选
  WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 多选
  WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 下拉
];
mapToComp(OptionsTypes, Options);

export const CheckboxCompTypes = [
  WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 检查框
];
mapToComp(CheckboxCompTypes, CheckboxComp);

export const DateTimeTypes = [
  WIDGETS_TO_API_TYPE_ENUM.DATE, // 日期
  WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 日期时间
];
mapToComp(DateTimeTypes, DateTime);

export function validate(condition) {
  let dataType = condition.dataType;
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.TEXT, // 文本
        WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 电话号码
        WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机号码
        WIDGETS_TO_API_TYPE_ENUM.EMAIL, // 邮件地址
        WIDGETS_TO_API_TYPE_ENUM.CRED, // 证件
        WIDGETS_TO_API_TYPE_ENUM.CONCATENATE, // 文本组合
        WIDGETS_TO_API_TYPE_ENUM.AUTO_ID, // 自动编号
        WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER, // 公式
        WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET, // 关联
        WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 单选
        WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 多选
        WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 下拉
      ],
      dataType,
    )
  ) {
    return condition.values && condition.values.filter(_.identity).length;
  }
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.NUMBER, // 数值
        WIDGETS_TO_API_TYPE_ENUM.MONEY, // 金额
      ],
      dataType,
    )
  ) {
    return condition.filterType === FILTER_CONDITION_TYPE.BETWEEN
      ? !_.isUndefined(condition.minValue) &&
          !_.isUndefined(condition.maxValue) &&
          parseFloat(condition.maxValue) > parseFloat(condition.minValue)
      : !_.isUndefined(condition.value);
  }
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 检查框
      ],
      dataType,
    )
  ) {
    return _.includes([FILTER_CONDITION_TYPE.NE, FILTER_CONDITION_TYPE.EQ], condition.filterType);
  }
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.DATE, // 日期
        WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 日期时间
      ],
      dataType,
    )
  ) {
    return condition.dateRange === 18
      ? !_.isUndefined(condition.minValue) && !_.isUndefined(condition.maxValue)
      : !!condition.dateRange;
  }
  return false;
}

export default function Input(props) {
  let { type } = props.control;
  if (type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD && props.control) {
    type = props.control.sourceControlType;
  }
  if (type === WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL && props.control) {
    type = props.control.enumDefault2 || 6;
  }
  const Condition = Comps[type];
  return Condition ? <Condition {...props} /> : <span />;
}

Input.propTypes = {
  control: shape({}),
};

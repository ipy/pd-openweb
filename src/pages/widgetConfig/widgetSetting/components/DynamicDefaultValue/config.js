/* 可以作为文本拼接的控件 */
export const CAN_AS_TEXT_DYNAMIC_FIELD = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 19, 23, 24, 25, 26, 27, 28, 31, 32, 33,
];

// 可以作为邮箱默认值的控件
export const CAN_AS_EMAIL_DYNAMIC_FIELD = [5];
// 可以作为部门默认值的控件
export const CAN_AS_DEPARTMENT_DYNAMIC_FIELD = [26, 27];

// 可以作为数值动态值的控件
export const CAN_AS_NUMBER_DYNAMIC_FIELD = [6, 8, 28];

// 可以作为时间动态值的控件
export const CAN_AS_TIME_DYNAMIC_FIELD = [15, 16];

// 可以作为地区动态值的控件
export const CAN_AS_AREA_DYNAMIC_FIELD = [19, 23, 24];

// 可以作为成员动态值的控件
export const CAN_AS_USER_DYNAMIC_FIELD = [26];

// 可以作为等级动态值的控件
export const CAN_AS_SCORE_DYNAMIC_FIELD = [6, 8, 28];

// 可以作为检查框动态值的控件
export const CAN_AS_SWITCH_DYNAMIC_FIELD = [36];

// 有其他动态值的控件
export const CAN_AS_OTHER_DYNAMIC_FIELD = [15, 16, 26, 27];

// 有函数动态值的控件
export const CAN_AS_FX_DYNAMIC_FIELD = [2, 3, 4, 5, 6, 8, 15, 16, 28, 36];

// 没有动态字段值的控件
export const CAN_NOT_AS_FIELD_DYNAMIC_FIELD = [34];

//日期
export const CAN_SHOW_CLEAR_FIELD = [15, 16];

export const SYSTEM_TIME = [
  {
    controlId: 'ctime',
    controlName: _l('创建时间'),
    controlPermissions: '100',
    type: 16,
    display: true,
  },
];

export const SYSTEM_USER = [{ controlId: 'caid', controlName: _l('创建者'), type: 26 }];

export const SYSTEM_FIELD_TO_TEXT = {
  ctime: _l('创建时间'),
  caid: _l('创建者'),
  utime: _l('最近修改时间'),
  ownerid: _l('拥有者'),
};

// 已保存的控件正则 形如 $5e047c2ab2bfdd0001e9b8f9$
export const FIELD_REG_EXP = /\$((\w{24}|caid|ownerid|utime|ctime)(~\w{24}|caid|ownerid|utime|ctime)?)\$/g;

// 未保存的控件正则 匹配uuid
export const UUID_REGEXP = /\$\w{8}(-\w{4}){3}-\w{12}\$/g;

export const TIME_TYPES = [
  {
    value: '2',
    id: 'current',
    text: _l('当前时间'),
    key: 'date',
  },
];
export const DATE_TYPES = [
  {
    value: '2',
    id: 'current',
    text: _l('当前日期'),
    key: 'date',
  },
];

export const CHECKBOX_TYPES = [
  { id: '0', text: _l('不选中') },
  { id: '1', text: _l('选中') },
];

export const CONTROL_TYPE = {
  1: 'text',
  2: 'text',
  3: 'phone',
  4: 'phone',
  5: 'email',
  6: 'number',
  8: 'number',
  9: 'option',
  10: 'option',
  11: 'option',
  15: 'date',
  16: 'date',
  19: 'area',
  23: 'area',
  24: 'area',
  26: 'user',
  27: 'department',
  28: 'score',
  29: 'relateSheet',
  34: 'subList',
  36: 'switch',
};

export const VALIDATE_REG = {
  number: /^-?\d*(\.\d*)?/,
};
export const DEFAULT_VALUE_VALIDATOR = {
  number: value => _.head(VALIDATE_REG.number.exec(value)),
};

// 动态默认值选择类型
export const OTHER_FIELD_LIST = [
  { icon: 'icon-workflow_other', text: _l('其他字段值'), key: 1 },
  { icon: 'icon-lookup', text: _l('查询工作表'), key: 2 },
  { icon: 'icon-formula', text: _l('函数计算'), key: 3 },
];

export const OTHER_FIELD_TYPE = {
  FIELD: 1,
  SEARCH: 2,
  FX: 3,
  DEPT: 'dept',
  USER: 'user',
  DATE: 'date',
};

export const CURRENT_TYPES = {
  15: DATE_TYPES,
  16: TIME_TYPES,
  26: [{ key: 'user', id: 'caid', text: _l('当前用户') }],
  27: [{ key: 'dept', id: 'current', text: _l('当前用户所在部门') }],
};

export const DEFAULT_TYPES = {
  0: 'dynamiccustom',
  1: 'defaultfunc',
  2: 'dynamicsrc',
};

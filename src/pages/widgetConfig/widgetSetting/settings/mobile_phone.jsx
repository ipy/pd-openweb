import React, { Fragment } from 'react';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';

const DISPLAY_OPTIONS = [
  {
    text: _l('手机'),
    value: 3,
  },
  {
    text: _l('座机'),
    value: 4,
  },
];

export default function Text(props) {
  const { data, onChange } = props;
  const { type, controlId } = data;
  return (
    <Fragment>
      <SettingItem>
        <RadioGroup
          size="middle"
          checkedValue={type}
          data={DISPLAY_OPTIONS}
          onChange={value => {
            if (controlId.includes('-')) {
              onChange({ type: value, controlName: DISPLAY_OPTIONS.find(item => item.value === value).text });
              return;
            }
            onChange({ type: value });
          }}
        />
      </SettingItem>
    </Fragment>
  );
}

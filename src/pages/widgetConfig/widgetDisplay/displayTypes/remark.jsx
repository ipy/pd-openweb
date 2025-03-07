import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { RichText } from 'ming-ui';
const Text = styled.div`
  color: #bdbdbd;
  font-size: 12px;
  margin-top: 3px;
`;
export default function Remark({ data }) {
  return data.dataSource ? (
    <RichText className="remarkControl" data={data.dataSource} disabled={true} />
  ) : (
    <Text>{_l('在此添加 注意事项 或 填写要求 等，来指导使用者(或填写者)正确地操作')}</Text>
  );
}

import {createFromIconfontCN} from '@ant-design/icons';
import {IconFontProps} from '@ant-design/icons/lib/components/IconFont';
import {Tooltip} from 'antd';
import React, {FC} from 'react';

const IconFontP = createFromIconfontCN({
  scriptUrl: [
    '/font/iconfont.js'
  ],
  extraCommonProps: {
      style: {
          fontSize: 28
      }
  }
});

const IconFont:FC<IconFontProps & {enableIntl?: boolean}> = props => {
  const {title: titleProps, enableIntl, ...restProps} = props
  if(props.disabled){
    restProps.style = {
      opacity: 0.6,
      fontSize: 28,
      ...restProps.style,
      cursor: "not-allowed"
    }
    delete restProps.onClick
  }
  if(titleProps){
    return <Tooltip title={titleProps}>
      <IconFontP {...restProps} />
    </Tooltip>
  }
  return <IconFontP {...props} />;
}

export default IconFont;

import { FC, ReactNode } from 'react'
import { View } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.less'

interface TabPanelProps {
  children: ReactNode;
  index: number;
  current: number;
}
const TabPanel: FC<TabPanelProps> = (props) => {
  const { children, index, current } = props
  return (
    <View
      className={classnames(
        {
          [styles['tabs-pane']]: true,
          [styles['tabs-pane--active']]: index === current,
          [styles['tabs-pane--inactive']]: index !== current
        },
      )}
    >
      {children}
    </View>
  )

}

export default TabPanel

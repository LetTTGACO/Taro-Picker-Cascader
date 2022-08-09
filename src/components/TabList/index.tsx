import { FC, ReactNode } from 'react'
import { View } from '@tarojs/components'
import classnames from 'classnames'
import { uuid } from '../../utils'
import styles from './index.module.less'

interface TabListProps {
  tabList: any[];
  onClick: (index: number, event?: any) => void
  current: number;
  children: ReactNode
}

const TabList: FC<TabListProps> = (props) => {

  const _tabId = uuid()

  const { tabList, onClick, current, children } = props

  const tabItems = tabList.map((item, idx) => {
    const itemCls = classnames({
      [styles.tabs__item]: true,
      [styles['tabs__item--active']]: current === idx
    })

    return (
      <View
        className={itemCls}
        id={`tab${_tabId}${idx}`}
        key={`tabs-item-${idx}`}
        onClick={() => onClick(idx)}
      >
        {item.title}
        <View className={styles['tabs__item-underline']} />
      </View>
    )
  })

  const underlineStyle = {
    height: '1PX',
    width: `${tabList.length * 100}%`
  }
  const transformStyle = {
    transform: `translate3d(-${current * 100}%, 0px, 0px)`
  }

  return (
    <View className={styles.tabs}>
      <View id={_tabId} className={styles.tabs__header}>
        {tabItems}
      </View>
      <View
        className={styles.tabs__body}
        style={transformStyle}
      >
        <View className={styles.tabs__underline} style={underlineStyle} />
        {children}
      </View>
    </View>
  )
}


export default TabList

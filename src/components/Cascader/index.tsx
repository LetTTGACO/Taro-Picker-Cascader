import React, { useState } from 'react'
import classnames from 'classnames'
// components
import { ScrollView, Text, View } from '@tarojs/components'
import Transition from '../Transition'
import TabList from '../TabList'
import TabPanel from '../TabPanel'
// styles
import styles from './index.module.less'
import { CascaderOptions, DataSource, Tab } from '../../typing'

const noop = () => {}
const defaultTitle = '请选择'
const defaultValue = `${new Date().getTime()}-tempId`

const Cascader: React.FC<CascaderOptions> = (props) => {
  const {
    options = [],
    visible = false,
    maskToHide = true,
    showInTabPage = false,
    onShow,
    onChange = noop,
    onConfirm = noop,
  } = props

  const [tabList, setTabList] = useState<Tab[]>([
    { title: defaultTitle, value: defaultValue, dataSource: options },
  ])
  const [current, setCurrent] = useState<number>(0)
  const [_tempIds, setTempIds] = useState<string[]>([])
  const [_tempTabs, setTempSelectTabs] = useState<Tab[]>([])

  // 判断是否点击在已选中的节点
  const getIsRepeatClick = (value: string): boolean => {
    const ids = tabList.map((item) => item.value)
    return ids.includes(value)
  }

  // 获取选中的值的数据项
  const getChooseValueItem = (value: string, tab: Tab) => {
    const { dataSource } = tab
    return dataSource.find((item) => item.value === value)
  }

  // 处理 tabs 选中的 tab 的 title 和 value
  const handleTabTitleChange = (value: string, tab: Tab, target: DataSource) => {
    const { label } = target
    return tabList.map((item) => {
      if (item === tab) {
        return {
          ...tab,
          value,
          title: label,
        }
      }
      return item
    })
  }

  // 如果重新选择，则把下级选中项清空
  const handleReChoose = (newTabList) => {
    if (current !== newTabList.length - 1) {
      newTabList.splice(current + 1, newTabList.length - current)
    }
  }

  // 选中后是否添加下级 Tab
  const handleNextTab = (newTabList, target) => {
    const { children } = target
    if (Array.isArray(children) && children.length > 0) {
      handleAddTab(newTabList, children, current)
    }
  }

  // 添加新节点
  const handleAddTab = (newTabList: Tab[], children: DataSource[], currentTabIndex: number) => {
    newTabList.push({
      title: defaultTitle,
      value: defaultValue,
      dataSource: children,
    })
    setCurrent(currentTabIndex + 1)
  }

  const handleOnChange = (newTabList: Tab[]) => {
    const selectTabs = newTabList.map((item) => item).filter((tab) => tab.value !== defaultValue)
    const ids = selectTabs.map((tab) => tab.value)
    setTempIds(ids)
    setTempSelectTabs(selectTabs)
    onChange(ids, selectTabs)
  }

  // 取消选中
  const handleCancelSelect = () => {
    const currentTab = tabList[current].dataSource
    tabList.splice(current, tabList.length - current, {
      title: defaultTitle,
      value: defaultValue,
      dataSource: currentTab,
    })
    handleOnChange(tabList)
    setTabList(tabList)
  }

  // 点击 option
  const handleOptionClick = (value: string, tab: Tab) => {
    const isRepeatClick = getIsRepeatClick(value)
    if (isRepeatClick) {
      handleCancelSelect()
      return
    }
    const target = getChooseValueItem(value, tab)
    if (!target) return
    const newTabList = handleTabTitleChange(value, tab, target)
    handleReChoose(newTabList)
    handleNextTab(newTabList, target)
    handleOnChange(newTabList)
    setTabList(newTabList)
  }

  // 确认
  const handleConfirm = () => {
    onConfirm?.(_tempIds, _tempTabs)
    onShow(false)
  }

  // 取消
  const handleCancel = () => {
    onShow(false)
  }

  return (
    <Transition className={styles.cascader} show={visible}>
      <View className={styles.cascader__mask} onClick={() => maskToHide && handleCancel()} />
      <Transition className={styles.cascader__wrapper} show={visible} name='fade-up'>
        <View className={styles.cascader__top}>
          {/*  取消*/}
          <View className={styles.cascader__top__btn} onClick={handleCancel}>
            取消
          </View>
          {/*  确认*/}
          <View className={classnames(styles.cascader__top__btn)} onClick={handleConfirm}>
            确认
          </View>
        </View>
        <TabList tabList={tabList} current={current} onClick={(index) => setCurrent(index)}>
          {tabList.map((item, index) => {
            return (
              <TabPanel current={current} index={index} key={index}>
                <ScrollView
                  key={item.value}
                  className={classnames({
                    [styles.cascader__scroll]: true,
                    [styles['cascader__scroll--safe-area']]: !showInTabPage,
                  })}
                  scrollY
                >
                  {item.dataSource.map((data) => (
                    <View
                      className={classnames({
                        [styles.cascader__option]: true,
                        [styles['cascader__option--active']]: _tempIds.includes(data.value),
                      })}
                      key={data.value}
                      onClick={() => handleOptionClick(data.value, item)}
                    >
                      <Text className={styles['cascader__option-label']}>{data.label}</Text>
                      <View
                        className={classnames({
                          [styles['cascader__option-icon']]: true,
                          [styles['cascader__option-icon--single-tick']]: true,
                        })}
                      />
                    </View>
                  ))}
                </ScrollView>
              </TabPanel>
            )
          })}
        </TabList>
      </Transition>
    </Transition>
  )
}

export default Cascader

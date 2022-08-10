import Taro from '@tarojs/taro'
import React, { useMemo, useEffect, useCallback, useReducer, CSSProperties } from 'react'
import { noop } from '@tarojs/shared'
// components
import { View } from '@tarojs/components'
import { ViewProps } from '@tarojs/components/types/View'

// styles
import classNames from 'classnames'
import styles from './index.module.less'
import './transition.less'

// TODO 后续替换为全局的 sync 类结果缓存
// 缓存 getSystemInfoSync 结果
let systemInfo: any
export function getSystemInfoSync() {
  if (systemInfo == null) systemInfo = Taro.getSystemInfoSync()

  return systemInfo
}

// TODO 后续封装为全局工具函数
// “下一帧”渲染实现
function nextFrame(cb: () => void) {
  const _systemInfo = getSystemInfoSync()

  if (_systemInfo.platform === 'devtools') return setTimeout(() => cb(), 1000 / 30)

  return Taro.createSelectorQuery()
    .selectViewport()
    .boundingClientRect()
    .exec(() => cb())
}

const DEFAULT_DURATION = 300

enum ModeEnum {
  ENTER = 'enter',
  LEAVE = 'leave',
}

interface DurationObject {
  [ModeEnum.ENTER]: number
  [ModeEnum.LEAVE]: number
}

type Duration = DurationObject | number

function isDurationObject(x: unknown): x is DurationObject {
  const type = typeof x
  return x !== null && type === 'object'
}

interface Props extends ViewProps {
  show: boolean
  name?: string
  duration?: Duration
  customStyle?: CSSProperties

  //#region 过渡进入类名
  enterClassName?: string
  enterActiveClassName?: string
  enterToClassName?: string
  //#endregion

  //#region 过渡退出类名
  leaveClassName?: string
  leaveActiveClassName?: string
  leaveToClassName?: string
  //#endregion

  //#region 过渡进入钩子
  onBeforeEnter?: () => void
  onEnter?: () => void
  onAfterEnter?: () => void
  //#endregion

  //#region 过渡退出钩子
  onBeforeLeave?: () => void
  onLeave?: () => void
  onAfterLeave?: () => void
  //#endregion
}

interface State {
  id: string
  mode: ModeEnum.ENTER | ModeEnum.LEAVE
  isInit: boolean
  display: boolean
  lastShow: boolean
  classes: string
  currentDuration: number
  transitionEnded: boolean
}

const initialState: State = {
  id: '', // 组件 id，用以屏蔽冒泡动画事件
  mode: ModeEnum.ENTER, // 模式，进入或退出
  isInit: false, // 是否初始化，节省初次渲染性能
  display: false, // 控制显示隐藏的关键
  lastShow: false, // 记录上一次的显示状态
  classes: '', // 最终 attach 到 “DOM” 上的类名
  currentDuration: 0, // 动画时间，不同模式下可不同
  transitionEnded: false, // 动画是否结束
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateState':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

const init = (state: State) => {
  return { ...state, id: String(Math.random()) }
}

const Transition: React.FC<Props> = (props) => {
  const {
    show,
    name = 'fade',
    duration = { enter: DEFAULT_DURATION, leave: DEFAULT_DURATION },
    customStyle = {},
    onClick = noop,
    enterClassName = '',
    enterActiveClassName = '',
    enterToClassName = '',
    leaveClassName = '',
    leaveActiveClassName = '',
    leaveToClassName = '',
    onBeforeEnter = noop,
    onEnter = noop,
    onAfterEnter = noop,
    onBeforeLeave = noop,
    onLeave = noop,
    onAfterLeave = noop,
    className = '',
  } = props

  const [state, dispatch] = useReducer(reducer, initialState, init)
  const updateState = useCallback(
    (payload) => dispatch({ type: 'updateState', payload }),
    [dispatch],
  )

  const getClassNames = (_name: string) => ({
    enter: `${_name}-enter-active ${_name}-enter ${enterActiveClassName} ${enterClassName}`,
    leave: `${_name}-leave-active ${_name}-leave ${leaveActiveClassName} ${leaveClassName}`,
    'enter-to': `${_name}-enter-active ${_name}-enter-to ${enterActiveClassName} ${enterToClassName}`,
    'leave-to': `${_name}-leave-active ${_name}-leave-to ${leaveActiveClassName} ${leaveToClassName}`,
  })

  // 监测外部显示隐藏
  useEffect(() => {
    if (state.lastShow === show) return

    updateState({ lastShow: show })
    show ? _onEnter() : _onLeave()
  }, [show])

  // 控制进入
  const _onEnter = useCallback(() => {
    const _classNames = getClassNames(name)
    const currentDuration = isDurationObject(duration) ? duration.enter : duration

    updateState({ mode: ModeEnum.ENTER })
    onBeforeEnter()

    nextFrame(() => {
      onEnter()

      updateState({
        isInit: true,
        display: true,
        classes: _classNames.enter,
        currentDuration,
      })

      nextFrame(() => {
        updateState({
          classes: classNames['enter-to'],
          transitionEnded: false,
        })
      })
    })
  }, [name, duration])

  // 控制退出
  const _onLeave = useCallback(() => {
    if (!state.display) return

    const _classNames = getClassNames(name)
    const currentDuration = isDurationObject(duration) ? duration.leave : duration

    updateState({ mode: ModeEnum.LEAVE })
    onBeforeLeave()

    nextFrame(() => {
      onLeave()

      updateState({
        classes: _classNames.leave,
        currentDuration,
      })

      nextFrame(() => {
        updateState({
          classes: _classNames['leave-to'],
          transitionEnded: false,
        })
      })
    })
  }, [name, duration, state.display, state.id])

  // 与 customStyle 一起计算动态样式
  const computedStyle = useMemo(() => {
    const ret = {
      '-webkit-transition-duration': `${String(state.currentDuration)}ms`,
      'transition-duration': `${String(state.currentDuration)}ms`,
      ...customStyle,
    }
    !state.display && (ret.display = 'none')

    return ret
  }, [customStyle, state.currentDuration, state.display])

  const onTransitionEnd = (evt?) => {
    if (evt.target.dataset.id !== state.id || state.transitionEnded) return

    updateState({ transitionEnded: true })
    state.mode === ModeEnum.ENTER ? onAfterEnter() : onAfterLeave()

    !show && state.display && updateState({ display: false })
  }

  return state.isInit ? (
    <View
      className={classNames({
        [styles['transition']]: true,
        [state.classes]: true,
        // 引用页面或父类样式：https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html
        [`^${className}`]: true,
        [`~${className}`]: true,
      })}
      data-id={state.id}
      style={computedStyle}
      onTransitionEnd={onTransitionEnd}
      onClick={onClick}
    >
      {props.children}
    </View>
  ) : null
}

export default Transition

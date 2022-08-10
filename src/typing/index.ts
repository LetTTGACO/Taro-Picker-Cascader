export interface DataSource {
  label: string
  value: any
  children?: DataSource[]
}

export interface Tab {
  title: string
  value: string
  dataSource: DataSource[]
}

export interface CascaderOptions {
  value?: string[] // 已选项
  options: DataSource[] // 可选项
  visible: boolean // 显隐控制
  maskToHide?: boolean // 点击 mask 关闭
  showInTabPage?: boolean // 是否显示在 tabbar 页面
  onShow: (visible: boolean) => void // 显隐切换
  onChange?: (ids?: string[], tabs?: Tab[]) => void // value 变更
  onConfirm?: (ids?: string[], tabs?: Tab[]) => void // value 变更
}

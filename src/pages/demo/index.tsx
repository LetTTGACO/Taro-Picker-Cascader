import { FC, useState } from 'react'
import Cascader from '../../components/Cascader'
import { DataSource, Tab } from '../../typing'
// import Cascader, { DataSource, Tab } from 'taro-picker-cascader'

const options: DataSource[] = [
  {
    label: '北京',
    value: 'beijing',
    children: [
      {
        label: '北京市1',
        value: 'beijing1',
        children: [
          {
            label: '北京市22',
            value: 'beijing122',
          },
          {
            label: '北京市2222',
            value: 'beijing2222',
          },
        ],
      },
      {
        label: '北京市2',
        value: 'beijing2',
      },
    ],
  },
  {
    label: '天津',
    value: 'tianjin',
    children: [
      {
        label: '天津市1',
        value: 'tianjin1',
      },
    ],
  },
]

const Demo: FC = () => {
  const [visible, setVisible] = useState(true)

  const handleConfirm = (ids: string[], tabs: Tab[]) => {
    console.log('123-handleConfirm', ids, tabs)
  }

  return (
    <Cascader visible={visible} onShow={setVisible} options={options} onConfirm={handleConfirm} />
  )
}

export default Demo

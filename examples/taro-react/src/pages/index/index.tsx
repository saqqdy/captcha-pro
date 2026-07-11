import { Navigator, Text, View } from '@tarojs/components'
import * as React from 'react'
import './index.scss'

export default function Index(): React.ReactNode {
  return (
    <View class='index'>
      <View class='title'>Captcha Pro</View>
      <View class='subtitle'>Taro + React 示例</View>
      <Navigator url='/pages/slider/index' class='card'>
        <Text class='card-title'>滑块验证码</Text>
        <Text class='card-desc'>拖动滑块至缺口位置完成验证</Text>
      </Navigator>
      <Navigator url='/pages/click/index' class='card'>
        <Text class='card-title'>点击验证码</Text>
        <Text class='card-desc'>按提示依次点击图中对应位置</Text>
      </Navigator>
      <Navigator url='/pages/popup/index' class='card'>
        <Text class='card-title'>弹窗验证码</Text>
        <Text class='card-desc'>弹窗形式的滑块或点击验证</Text>
      </Navigator>
    </View>
  )
}

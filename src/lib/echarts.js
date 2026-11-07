/**
 * ECharts 按需注册
 * 全站只用到雷达、柱、折线、饼四类图表与提示框、直角坐标、图例、雷达坐标四个组件。
 * 全量 import 'echarts' 会带进 1.1 MB 的模块，这里按需引入后只打包实际用到的部分。
 */
import * as echarts from 'echarts/core'
import { RadarChart, BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  RadarComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  RadarChart, BarChart, LineChart, PieChart,
  TooltipComponent, GridComponent, LegendComponent, RadarComponent,
  CanvasRenderer
])

export default echarts

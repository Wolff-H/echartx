import { createApp } from "vue"
import Playground from './Playground.vue'

import "element-plus/theme-chalk/index.css"

import dayjs from "dayjs"
import "dayjs/locale/zh-cn"
import dayjs_plugin_utc from "dayjs/plugin/utc"
import dayjs_plugin_weekday from "dayjs/plugin/weekday"
import dayjs_plugin_duration from "dayjs/plugin/duration"
import dayjs_plugin_toObject from "dayjs/plugin/toObject"
import dayjs_plugin_isBetween from "dayjs/plugin/isBetween"
import dayjs_plugin_minMax from "dayjs/plugin/minMax"
import dayjs_plugin_isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import dayjs_plugin_objectSupport from "dayjs/plugin/objectSupport"
import dayjs_plugin_advancedFormat from 'dayjs/plugin/advancedFormat'
import dayjs_plugin_arraySupport from 'dayjs/plugin/arraySupport'
import dayjs_plugin_isoWeek from 'dayjs/plugin/isoWeek'

import "@/assets/stylesheets/overall/index.styl"
import "@/assets/stylesheets/colorset/define-css-variables.styl"

dayjs.extend(dayjs_plugin_utc)
dayjs.extend(dayjs_plugin_weekday)
dayjs.extend(dayjs_plugin_toObject)
dayjs.extend(dayjs_plugin_isBetween)
dayjs.extend(dayjs_plugin_minMax)
dayjs.extend(dayjs_plugin_isSameOrBefore)
dayjs.extend(dayjs_plugin_duration)
dayjs.extend(dayjs_plugin_objectSupport)
dayjs.extend(dayjs_plugin_advancedFormat)
dayjs.extend(dayjs_plugin_arraySupport)
dayjs.extend(dayjs_plugin_isoWeek)
dayjs.locale('zh-cn', {
    weekStart: 1,
})

import * as echarts from 'echarts'
import { initialize as initializeEchartx } from './echartx'

initializeEchartx({ echarts })

const app = createApp(Playground)

app.mount('body')

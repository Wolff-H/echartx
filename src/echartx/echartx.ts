import type { ExtractPropTypes } from 'vue'



export const __EChartx = {
  echarts: null,
  options: { resizable: true },
}

export type EChartsOption<K extends string, V> = {
  [key in K]: V
}

export function initialize(params: { echarts: any; options?: any }) {
  __EChartx.echarts = params.echarts
  params.options &&
    (__EChartx.options = { ...__EChartx.options, ...params.options })
}

export const echartxProps = {
  /** 在全局作用域下唯一标记此图表的标识符（当你配置一些实例专用的设置时需要） */
  id: {
    type: String,
    default: undefined,
  },
  /** 传给 echarts 实例的 option */
  echartOption: {
    type: Object as () => any,
    default: {},
  },
  /** 初始化 echarts 实例使用的参数 */
  initParams: {
    type: Object as () => any,
    default: {},
  },
  /** 自动监听 echartOption 更新。默认启用。 */
  watchOption: {
    type: Boolean,
    default: true,
  },
  /** 是否覆写式更新实例的 Option。默认启用。 */
  overrideOption: {
    type: Boolean,
    default: true,
  },
  /** 操作的自定义方法 */
  actions: {
    type: Object as () => {
      expand?: () => void | false
      toggleViewMode?: () => void | false
      download?: () => void | false
    },
    default: undefined,
  },
  actionsEnabled: {
    type: Array as () => ('expand' | 'toggleViewMode' | 'download')[],
    default: undefined,
  },
  /** 下载文件的输出名称 */
  downloadFileName: {
    type: Function, // as unknown as () => string,
    default: () => 'untitled',
  },
  /** 下载文件的输出名称附加后缀时间戳 */
  downloadFileNameTimestamp: {
    type: Boolean,
    default: true,
  },
  /** 集成的 echarts-use 功能 */
  echartsUse: {
    type: Object as () => {
      /** 自动重调整尺寸，集成 echarts-use/auto-resize。默认启用。 */
      autoResize?: [
        enable?: boolean,
        props?: { debounce?: number; transition?: number }
      ]
      /** 支持手动调整容器尺寸，集成 echarts-use/auto-resize。（props 暂时不适配）。默认启用。 */
      resizable?: [
        enable?: boolean,
        props?: {
          handleSize?: number
          handleTitle?: string
          handledResizableOptions: Parameters<typeof import("handled-resizable").default>[2]
        }
      ]
      /** 双击图例项全局反选序列，集成 echarts-use/globally-reverse。默认启用。 */
      globallyReverse?: [enable?: boolean, props?: { timeout?: number }]
      /** 可滚浮窗，集成 echarts-use/scrollable-tooltip。默认启用。 */
      scrollableTooltip?: [
        enable?: boolean,
        props?: {
          maxHeight?: number
          width?: number
          minWidth?: number
        }
      ]
    },
    default: {},
  },
  /** 将图转为表格的一些设置 */
  tableResolving: {
    type: Object as () => {
      /** 自动识别添加百分率后缀 */
      smartPercentSuffix?: boolean
      /** 使用自定义的 table 构造解析器 */
      parser?: (option: EChartsOption<string, any>) => {
        columns: any[]
        data: any[]
      }
    },
    default: undefined,
  },
  /** 画布缩放重绘防闪烁 */
  antiFlicker: {
    type: Boolean,
    default: undefined,
  },
} as const
export type EchartxProps = ExtractPropTypes<typeof echartxProps>

export type EchartxInstance = any // InstanceType<typeof Echartx>

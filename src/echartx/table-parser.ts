import type { EChartsOption, EchartxProps } from './echartx'

export default function parseTable(
  echartOption: EChartsOption<string, any>,
  props: EchartxProps
) {
  const _props = {
    ...props,
    tableResolving: {
      smartPercentSuffix: true, // 默认启用
      ...props.tableResolving,
    },
  }

  const construction = {
    columns: [] as any[],
    data: [] as any[],
  }

  if (!echartOption.series) return construction

  const series = getSeries(echartOption.series)
  const figureType = getFigureType(series)

  switch (figureType) {
    case 'pie':
      return parseTableFromFigurePie(echartOption, _props)

    /**
     * @todo 后期要支持其他类型就在这里加
     */

    default:
      return parseTableFromFigureLinear(echartOption, _props)
  }
}

/**
 * 获取序列。
 * 因为 echarts.series 接受规格对象或规格对象数组类型，所以在此统一归约到数组格式。
 * @param seriesRaw 原始的 option.series 属性值
 * @returns
 */
function getSeries(seriesRaw: Record<string, any> | Record<string, any>[]) {
  if (Array.isArray(seriesRaw)) return seriesRaw
  else return [seriesRaw]
}

/**
 * 从序列首项确定要转换的作图类型。
 * @param series 序列
 * @returns
 */
function getFigureType(series: Record<string, any>) {
  return series[0]?.type
}

/**
 * 饼图
 * @param echartOption
 * @param props
 */
export function parseTableFromFigurePie(
  echartOption: EChartsOption<string, any>,
  props: EchartxProps
) {
  const construction = {
    columns: [] as any[],
    data: [] as any[],
  }

  const series = getSeries(echartOption.series)
  const serie = series?.[0] || {}

  construction.columns = [
    {
      label: `${serie.name}`,
      prop: '$name', // $内部保留字
      minWidth: 100,
      showOverflowTooltip: true,
    },
    {
      label: '份额',
      prop: '$value', // $内部保留字
      minWidth: 100,
      showOverflowTooltip: true,
    },
    {
      label: '占比',
      prop: '$partition', // $内部保留字
      minWidth: 100,
      showOverflowTooltip: true,
    },
  ]

  const total =
    serie.data
      ?.map((item) => item.value)
      .reduce((sum, num) => {
        return sum + (Number.isNaN(Number(num)) ? 0 : Number(num))
      }, 0) || 0

  construction.data = serie.data.map((item) => {
    return {
      $name: item.name,
      $value: item.value,
      $partition: `${((item.value / total) * 100).toFixed(2)} %`,
    }
  })

  return construction
}

/**
 * 线性图（折线图、柱状图等）
 * @param echartOption
 * @param props
 */
export function parseTableFromFigureLinear(
  echartOption: EChartsOption<string, any>,
  props: EchartxProps
) {
  const construction = {
    columns: [] as any[],
    data: [] as any[],
  }

  construction.columns = [
    {
      label: '',
      prop: 'tooltipTableName',
      minWidth: 100,
      showOverflowTooltip: true,
    },
  ].concat(
    (Array.isArray(echartOption.xAxis)
      ? echartOption.xAxis?.[0]
      : echartOption.xAxis
    )?.data?.map((item) => ({
      label: item,
      prop: item,
      minWidth: 100,
      showOverflowTooltip: true,
    }))
  )

  construction.data = echartOption.series
    ?.filter((item) => item.type !== 'scatter' && item.name)
    ?.map((seriesItem) => {
      const res = {}
      res['tooltipTableName'] =
        seriesItem.name +
        (props.tableResolving?.smartPercentSuffix &&
        seriesItem.name.includes('率')
          ? '(%)'
          : '')
      //
      ;(Array.isArray(echartOption.xAxis)
        ? echartOption.xAxis?.[0]
        : echartOption.xAxis
      )?.data?.forEach((axisItem, index) => {
        res[axisItem] = seriesItem?.data
          ? seriesItem?.data[index]?.value || seriesItem?.data[index]
          : 0
      })
      return res
    })

  return construction
}

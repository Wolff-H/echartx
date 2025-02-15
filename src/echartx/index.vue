<template>
    <div ref="_ref" class="echartx">
        <div class="presentation">
            <div
                :style="{ visibility: viewMode === 'figure' ? 'initial' : 'hidden' }"
                class="figure-wrapper"
            >
                <div ref="refFigure" class="figure-container" />
            </div>
            <div
                :style="{ visibility: viewMode === 'table' ? 'initial' : 'hidden' }"
                class="table-wrapper"
            >
                <el-table
                    :data="tableConstruction.data"
                    height="100%"
                    size="small"
                    border
                    class="echartx-resolved-table"
                >
                    <el-table-column
                        v-for="(item, index) of tableConstruction.columns"
                        v-bind="item"
                        :key="index"
                    />
                </el-table>
            </div>
        </div>
        <div class="actions">
            <div class="classification custom" />
            <div class="classification default">
                <icon-full-screen-two
                    v-show="_actionsEnabled.includes('expand')"
                    class="action"
                    :size="16"
                    title="全屏展示"
                    @click="action_expand"
                />
                <icon-table-file
                    v-if="viewMode === 'figure'"
                    v-show="_actionsEnabled.includes('toggleViewMode')"
                    class="action"
                    :size="16"
                    title="切换图表"
                    @click="action_toggleViewMode"
                />
                <icon-chart-histogram
                    v-if="viewMode === 'table'"
                    v-show="_actionsEnabled.includes('toggleViewMode')"
                    class="action"
                    :size="16"
                    title="切换图表"
                    @click="action_toggleViewMode"
                />
                <icon-download
                    v-show="_actionsEnabled.includes('download')"
                    class="action"
                    :size="16"
                    title="下载数据"
                    @click="action_download"
                />
            </div>
        </div>
        <el-dialog
            v-model="expandedPlotting"
            width="95%"
            class="modal_echartx-expanded-plotting"
            align-center
            destroy-on-close
        >
            <div ref="refExpandedPlotting" class="echartx-expanded-plotting" />
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from "vue"
import handledResizable from 'handled-resizable'
import { debounce } from 'lodash'


import {
    ChartHistogram as IconChartHistogram,
    Download as IconDownload,
    FullScreenTwo as IconFullScreenTwo,
    TableFile as IconTableFile,
} from '@icon-park/vue-next'
import {
    ElDialog,
    ElTable,
    ElTableColumn,
} from "element-plus"
import parseTable from './table-parser'
import { __EChartx, echartxProps } from './echartx'
import type { EChartsOption } from './echartx'

type ViewMode = 'figure' | 'table'
type ExtendedEchartsInstance = {
    __ResizeObserver?: ResizeObserver
    __dblclickPossible?: boolean | undefined
    setOption: (...args: any[]) => any
    getDom: () => HTMLElement
    resize: () => void
    on: (...args: any[]) => any
}

defineOptions({
    name: 'BEchartx',
})

const props = defineProps(echartxProps)

const echarts = __EChartx.echarts as any

// refs //
const _ref = ref<HTMLDivElement>()
const refFigure = ref<HTMLDivElement>()
const refTable = ref<any>()
const refExpandedPlotting = ref<HTMLDivElement>()

let inst_figure: null | ExtendedEchartsInstance = null

// data //
const viewMode = ref<ViewMode>('figure')
const expandedPlotting = ref(false)
const tableConstruction = computed(() => {
    return resolveTableData(props.echartOption)
})
const _actionsEnabled = computed(() => {
    return props.actionsEnabled === undefined
        ? ['expand', 'toggleViewMode']
        : props.actionsEnabled
})

let figureIntersectionObserver: null | IntersectionObserver = null

function setChartInstanceOption(
    option?: EChartsOption<string, any>,
    instance?: ExtendedEchartsInstance
) {
    // 使用提供的实例 //
    if (instance) {
        if (!instance) {
            console.error('Echart instance is not initialized.')
        } else {
            instance.setOption(
                scrollableTooltip(option || props.echartOption),
                props.overrideOption
            )
        }
    }
    // 使用默认的实例 //
    else {
        if (!inst_figure) {
            console.error('Echart instance is not initialized.')
        } else {
            inst_figure.setOption(
                scrollableTooltip(option || props.echartOption),
                props.overrideOption
            )
        }
    }
}

function resolveTableData(currentOption: EChartsOption<string, any>) {
    // 如果用户提供了自己的 parser，使用提供的 parser //
    if (
        props.tableResolving?.parser &&
        typeof props.tableResolving.parser === 'function'
    ) {
        return props.tableResolving.parser(currentOption)
    }

    return parseTable(currentOption, props)
}

// actions ------

/** 内置默认行为 - 大屏作图 */
function _action_expand() {
    expandedPlotting.value = true

    setTimeout(() => {
        const inst_plotting = echarts.init(
            refExpandedPlotting.value!,
            undefined,
            props.initParams
        )
        setChartInstanceOption(undefined, inst_plotting)
    }, 100)
}

/** 内置默认行为 - 切换图表 */
function _action_toggleViewMode() {
    viewMode.value === 'figure'
        ? (viewMode.value = 'table')
        : (viewMode.value = 'figure')
}

/** 内置默认行为 - 下载图表 */
function _action_download() {
    // downloadToXLSX()
    props.actions?.download?.()
}

function action_expand() {
    if (props.actions?.expand?.() !== false) _action_expand()
}

function action_toggleViewMode() {
    if (props.actions?.toggleViewMode?.() !== false) _action_toggleViewMode()
}

function action_download() {
    if (props.actions?.download?.() !== false) _action_download()
}

// echarts-use ------
function echartsUse_autoResize() {
    const _options = {
        debounce: 500,
        transition: 0,
        ...props.echartsUse?.autoResize?.[1],
    }

    const instDom = inst_figure!.getDom()

    instDom.style.transition = `width ${_options.transition}s, height ${_options.transition}s`

    inst_figure!.__ResizeObserver = new ResizeObserver((entries) => {
        window.requestAnimationFrame(() => {
            if (!Array.isArray(entries) || !entries.length) {
                return
            }
            debounce(inst_figure!.resize, _options.debounce)()
        })
    })

    inst_figure!.__ResizeObserver.observe(instDom)
}

function echartsUse_resizable() {
    const _options = {
        handleSize: 12,
        handleTitle: '拖拽以缩放，双击复原',
        handledResizableOptions: {},
        ...props.echartsUse?.resizable?.[1],
    }

    const instDom = inst_figure!.getDom()
    const handle = document.createElement('div')

    instDom.classList.add('echarts-resizable')
    handle.classList.add('echarts-figure_resizable-handle')

    handle.title = _options.handleTitle
    instDom.appendChild(handle)

    instDom.dataset['initialSize'] = JSON.stringify({
        width: getComputedStyle(instDom).width,
        height: getComputedStyle(instDom).height,
    })

    handle.addEventListener('mouseenter', () => {
        instDom.classList.add('resizing')
    })
    handle.addEventListener('mouseleave', () => {
        instDom.classList.remove('resizing')
    })
    handle.addEventListener('dblclick', () => {
        instDom.style.width = ''
        instDom.style.height = ''
    })

    handledResizable(handle, instDom)
}

function globallyReverse() {
    const _options = {
        timeout: 500,
        ...props.echartsUse?.globallyReverse?.[1],
    }

    const inst = inst_figure

    if (!inst) return

    inst.__dblclickPossible = undefined

    inst.on('legendselectchanged', (params: any) => {
        let dblclickPossibilityTimerId: undefined | number = undefined

        if (!inst.__dblclickPossible) {
            inst.__dblclickPossible = params.name
            dblclickPossibilityTimerId = window.setTimeout(() => {
                inst.__dblclickPossible === params.name &&
                    (inst.__dblclickPossible = undefined)
            }, _options.timeout)
        } else if (inst.__dblclickPossible === params.name) {
            inst.__dblclickPossible = undefined
            clearTimeout(dblclickPossibilityTimerId)
            inst.setOption({
                legend: {
                    selected: Object.fromEntries(
                        Object.entries(params.selected).map(([name, status]) => [
                            name,
                            !status,
                        ])
                    ),
                },
            })
        } else {
            inst.__dblclickPossible = params.name
            clearTimeout(dblclickPossibilityTimerId)
            dblclickPossibilityTimerId = window.setTimeout(() => {
                inst.__dblclickPossible === params.name &&
                    (inst.__dblclickPossible = undefined)
            }, _options.timeout)
        }
    })
}

function scrollableTooltip(
    option: EChartsOption<string, any>
): EChartsOption<string, any> {
    // const _options = {
    //     maxHeight: 400,
    //     width: 'auto',
    //     minWidth: 200,
    // }

    return {
        ...option,
        tooltip: {
            ...option.tooltip,
            enterable: true,
            className:
                (option.className as string | undefined) ||
                '' + ' echarts-tooltip--scrollable',
        },
    }
}

// lifecycles //
onMounted(() => {
    nextTick(async () => {
        // initalize echarts instance //
        inst_figure = echarts.init(refFigure.value!, undefined, props.initParams)

        setTimeout(() => {
            /**
             * 当元素从隐藏状态切到显示状态，元素的计算尺寸会由其最小值变化到正常排布计算值，而由于画布缩放重绘可能有延迟（默认500ms防抖），将导致一个延迟时长的画布闪烁。
             * 监听元素显隐变化，并立即对画布执行缩放重绘。
             */
            if (props.antiFlicker) {
                figureIntersectionObserver = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                inst_figure!.resize()
                            }
                        })
                    },
                    {
                        root: null,
                        rootMargin: '0px',
                        threshold: 0,
                    }
                )

                figureIntersectionObserver.observe(refFigure.value!)
            }

            echartsUse_autoResize()
            __EChartx.options?.resizable && echartsUse_resizable()
            globallyReverse()
        })

        setChartInstanceOption()
    })
})

// watch //
watch(
    () => props.echartOption,
    () => {
        if (props.watchOption) {
            setChartInstanceOption()
        }
    }
)

// expose //
defineExpose({
    ref: _ref,
    figureRef: refFigure,
    tableRef: refTable,
    expandedPlottingRef: refExpandedPlotting,
    figureInstance: inst_figure,
})
</script>



<style lang="stylus">
.echartx
    position relative
    min-width 400px
    min-height 200px
    padding-top 20px
    > .presentation
        position relative
        width 100%
        height 100%
        > .figure-wrapper,
        > .table-wrapper
            position absolute
            width 100%
            height 100%
        > .figure-wrapper
            > .figure-container
                position relative
                width 100%
                height 100%
            > .table-container
                position relative
                width 100%
                height 100%
    &:hover
        > .actions
            display flex
    > .actions
        position absolute
        height 20px
        display flex
        top 0px
        right 0px
        display none
        background-color #f2f2f2 // $black05;
        &::after
            content ''
            display block
            width 100%
            height 1px
            background-color #bfbfbf // $black25;
            position absolute
            bottom -1px
        .classification
            display flex
        .action
            height 20px
            width 20px
            display flex
            align-items center
            justify-content center
            cursor pointer
            &:hover
                color #409eff // $primary;

.echarts-resizable.resizing
    outline 1px dashed #8cc4ff

.echarts-figure_resizable-handle
    height 12px
    width 12px
    position absolute
    right 0px
    bottom 0px
    cursor nwse-resize
    background linear-gradient(
        -45deg,
        #cccccc 0px,
        #cccccc 1px,
        transparent 1px,
        transparent 2px,
        #cccccc 2px,
        #cccccc 3px,
        transparent 3px,
        transparent 4px,
        #cccccc 4px,
        #cccccc 5px,
        transparent 5px,
        transparent 6px,
        #cccccc 6px,
        #cccccc 7px,
        transparent 7px,
        transparent 8px
    )

.echarts-tooltip--scrollable
    max-height 400px
    min-width 200px
    overflow-y auto

.echartx-expanded-plotting
    height 70vh

.echartx-resolved-table
    .el-table__header-wrapper > table > thead th
        background-color #f7f7f7 // $black03;
    .el-table__cell
        padding 4px 0px

.modal_echartx-expanded-plotting
    .el-dialog__body
        padding 12px 4px

.modal_echartx-expanded-plotting
    background-color white
</style>
import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { GridComponent, GridComponentOption } from 'echarts/components'
import { BarChart, BarSeriesOption } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([GridComponent, BarChart, CanvasRenderer])

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | BarSeriesOption
>

interface DepartmentBarChartProps {
  data: number[]
  labels: string[]
  title?: string
}

export default function DepartmentBarChart({
  data,
  labels,
  title = 'Funcionários Ativos',
}: DepartmentBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const myChart = echarts.init(chartRef.current)

    const option: EChartsOption = {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          rotate: 0,
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: [
        {
          name: title,
          data: data,
          type: 'bar',
          itemStyle: {
            color: '#1283E6',
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 12,
            fontWeight: 'bold',
          },
        },
      ],
    }

    myChart.setOption(option)

    // Cleanup
    return () => {
      myChart.dispose()
    }
  }, [data, labels, title])

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
}

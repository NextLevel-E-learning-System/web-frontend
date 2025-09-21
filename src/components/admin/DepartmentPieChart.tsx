import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import {
  TooltipComponent,
  TooltipComponentOption,
  LegendComponent,
  LegendComponentOption,
} from 'echarts/components'
import { PieChart, PieSeriesOption } from 'echarts/charts'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
])

type EChartsOption = echarts.ComposeOption<
  TooltipComponentOption | LegendComponentOption | PieSeriesOption
>

interface DepartmentPieChartProps {
  data: number[]
  labels: string[]
  departmentNames: string[]
}

export default function DepartmentPieChart({
  data,
  labels,
  departmentNames,
}: DepartmentPieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const myChart = echarts.init(chartRef.current)

    // Filtrar apenas departamentos com dados > 0 para o gráfico pizza
    const chartData = data
      .map((value, index) => ({
        value,
        name: `${departmentNames[index]} (${labels[index]})`,
        label: labels[index],
        fullName: departmentNames[index],
      }))
      .filter(item => item.value > 0)

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        formatter: (name: string) => {
          const item = chartData.find(d => d.name === name)
          return item ? `${item.label}: ${item.value}` : name
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: chartData.map(item => ({
            value: item.value,
            name: item.name,
          })),
        },
      ],
    }

    myChart.setOption(option)

    // Cleanup
    return () => {
      myChart.dispose()
    }
  }, [data, labels, departmentNames])

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
}

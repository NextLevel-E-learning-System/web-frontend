import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import {
  
  type LegendComponentOption,
  type TooltipComponentOption,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import { PieChart, type PieSeriesOption,  } from 'echarts/charts'
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

    // Criar dados do gráfico - sempre mostrar todos os departamentos na legenda
    const chartData = data.map((value, index) => ({
      value,
      name: labels[index], // Usar código do departamento ao invés do nome completo
      label: labels[index],
      fullName: departmentNames[index],
    }))

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const item = chartData.find(d => d.name === params.name)
          const fullName = item ? item.fullName : params.name
          return `${fullName}<br/>XP Médio: ${params.value} (${params.percent}%)`
        },
      },
      legend: {
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        formatter: (name: string) => {
          // Mostrar nome do departamento com o valor do XP médio
          const item = chartData.find(d => d.name === name)
          return item ? `${name}: ${item.value} XP` : name
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

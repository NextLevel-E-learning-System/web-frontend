import { useCategories } from '../api/courses'

interface CategoryColors {
  gradientFrom: string
  gradientTo: string
  categoryName: string
}

export function useCategoryColors(categoryId?: string): CategoryColors {
  const { data: categories } = useCategories()

  // Função para converter hex para rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
      : null
  }

  // Buscar categoria e definir cores
  if (!categoryId || !categories || !Array.isArray(categories)) {
    return {
      gradientFrom: '#6b7280',
      gradientTo: '#374151',
      categoryName: ''
    }
  }

  const categoria = categories.find((c) => c.codigo === categoryId)
  if (!categoria) {
    return {
      gradientFrom: '#6b7280',
      gradientTo: '#374151',
      categoryName: ''
    }
  }

  const categoryName = categoria.nome

  if (!categoria.cor_hex) {
    return {
      gradientFrom: '#6b7280',
      gradientTo: '#374151',
      categoryName
    }
  }

  const rgb = hexToRgb(categoria.cor_hex)
  if (!rgb) {
    return {
      gradientFrom: '#6b7280',
      gradientTo: '#374151',
      categoryName
    }
  }

  // Cria gradiente com diferentes opacidades da mesma cor
  const gradientFrom = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` // 100% opacidade
  const gradientTo = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` // 70% opacidade

  return {
    gradientFrom,
    gradientTo,
    categoryName
  }
}

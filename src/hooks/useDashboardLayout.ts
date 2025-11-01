import { useNavigation } from './useNavigation'

export function useDashboardLayout() {
  const { navigationItems } = useNavigation()

  return {
    navigationItems,
  }
}

export default useDashboardLayout

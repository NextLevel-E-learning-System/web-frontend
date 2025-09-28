 
import {
  Box,
  Grid,
  Alert,
  CircularProgress,
  Typography,
  Divider,
  Button,
} from '@mui/material'
import{   MenuBook, WorkspacePremium, StarRate , EmojiEvents, Nightlight, Bolt, Speed, Explore}from '@mui/icons-material'
import CheckCircleIcon  from '@mui/icons-material/CheckCircle'
 import AccessTimeIcon from '@mui/icons-material/AccessTime'
 import DashboardLayout from '@/components/layout/DashboardLayout'
import { DashboardAluno } from '@/api/users'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboardCompleto } from '@/api/users'
import StatsCard from '@/components/common/StatCard'
import TimeRangeToggle, { TimeRange } from '@/components/common/TimeRangeToggle'
import CourseProgressCard from '@/components/employee/CourseProgressCard'
import AchievementCard from '@/components/employee/AchievementCard'
import GoalCard from '@/components/employee/GoalCard'

export default function ProgressPage() {
   const { dashboard, isLoading, error } = useDashboardCompleto()
  const { navigationItems } = useDashboardLayout()

  // Type guard para garantir que é um dashboard de aluno
  const alunoData =
    dashboard?.tipo_dashboard === 'aluno' ? (dashboard as DashboardAluno) : null
 

  if (isLoading) {
    return (
      <DashboardLayout items={navigationItems}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='400px'
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    )
  }

  if (error || !alunoData) {
    return (
      <DashboardLayout items={navigationItems}>
        <Alert severity='error'>
          Erro ao carregar dados. Tente novamente.
        </Alert>
      </DashboardLayout>
    )
  }

 

  return (
    <DashboardLayout items={navigationItems}>

        <Box sx={{ py: { xs: 3, md: 5 } }}>
        <Box sx={{ display: "flex", alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Your Learning Progress</Typography>
            <Typography color="text.secondary">Track your learning journey, monitor achievements, and set goals to keep yourself motivated.</Typography>
          </Box>
          <TimeRangeToggle value={'all'} onChange={function (value: TimeRange): void {
            throw new Error('Function not implemented.')
          } }   />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>Activity Overview</Typography>
          <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm:6, md: 3 }}>
              <StatsCard icon={<AccessTimeIcon />} label="Total Learning Time" value="11.1 hrs" trendLabel="12% increase from last month" />
            </Grid>
          <Grid size={{ xs: 12, sm:6, md: 3 }}>
              <StatsCard icon={<CheckCircleIcon />} label="Courses Completed" value="2" trendLabel="1 more than last month" />
            </Grid>
          <Grid size={{ xs: 12, sm:6, md: 3 }}>
              <StatsCard icon={<MenuBook />} label="Lessons Completed" value="17" trendLabel="3 more than last month" />
            </Grid>
          <Grid size={{ xs: 12, sm:6, md: 3 }}>
              <StatsCard icon={<StarRate />} label="Avg. Rating Given" value="4.9" trendLabel="0.2 higher than last month" />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>Course Progress</Typography>
          <Grid container spacing={2}>
                      <CourseProgressCard
                        title='Node.js Backend'
                        description='Build scalable backend applications with Node.js and Express.'
                        progress={45}
                        timeLeft='8h left'
                        gradientFrom='#22c55e'
                        gradientTo='#0ea5e9'
                      />
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

          <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={800}>Your Achievements</Typography>
            <Button variant="text" size="small">View All</Button>
          </Box>
          <Grid container spacing={2}>
               <Grid size={{ xs: 12, sm:6, md: 4, lg:2}}>
              <AchievementCard title="Early Bird" subtitle="Complete 5 lessons before 8am" gradientFrom="#fde68a" gradientTo="#fca5a5" icon={<EmojiEvents />} />
            </Grid>
      <Grid size={{ xs: 12, sm:6, md: 4, lg:2}}>              <AchievementCard title="Night Owl" subtitle="Study for 2 hours after 10pm" gradientFrom="#a78bfa" gradientTo="#60a5fa" icon={<Nightlight />} />
            </Grid>
      <Grid size={{ xs: 12, sm:6, md: 4, lg:2}}>              <AchievementCard title="Consistent" subtitle="Study for 7 days in a row" gradientFrom="#6ee7b7" gradientTo="#93c5fd" icon={<Bolt />} />
            </Grid>
      <Grid size={{ xs: 12, sm:6, md: 4, lg:2}}>              <AchievementCard title="Perfectionist" subtitle="Score 100% on 3 quizzes" gradientFrom="#fecaca" gradientTo="#fef3c7" icon={<Speed />} />
            </Grid>
      <Grid size={{ xs: 12, sm:6, md: 4, lg:2}}>              <AchievementCard title="Speed Demon" subtitle="Complete a course in record time" gradientFrom="#fda4af" gradientTo="#fde68a" icon={<Bolt />} />
            </Grid>
      <Grid size={{ xs: 12, sm:6, md: 4, lg:2}}>              <AchievementCard title="Explorer" subtitle="Try courses from 5 categories" gradientFrom="#bae6fd" gradientTo="#a7f3d0" icon={<Explore />} />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={800}>Your Learning Goals</Typography>
            <Button variant="contained" size="small">Set New Goal</Button>
          </Box>
          <Grid container spacing={2}>
               <Grid size={{ xs: 12, md: 4}}>
              <GoalCard title="Complete React Course" subtitle="Finish all lessons by August 25" progress={75} daysLeft={10} />
            </Grid>
               <Grid size={{ xs: 12, md: 4}}>
              <GoalCard title="Study 2 hours daily" subtitle="Maintain consistent study schedule" progress={40} daysLeft={18} />
            </Grid>
               <Grid size={{ xs: 12, md: 4}}>
              <GoalCard title="Complete 5 Courses" subtitle="By the end of this quarter" progress={40} daysLeft={45} />
            </Grid>
          </Grid>
        </Box>
        
</Box>

    </DashboardLayout>
  )
}

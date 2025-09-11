import {
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle,
  Chip,
  Avatar,
  Stack,
} from "@mui/material";
import {
  People,
  School,
  Assignment,
  TrendingUp,
  Warning,
  Info,
  CheckCircle,
  Business,
} from "@mui/icons-material";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useNavigation } from '@/hooks/useNavigation';
import StatCard from "@/components/admin/StatCard";
import SimpleBarChart from "@/components/admin/SimpleBarChart";
import SimpleAreaChart from "@/components/admin/SimpleAreaChart";
import { useDashboard, useListarUsuarios } from "@/hooks/users";

export default function AdminDashboard() {
  const { navigationItems } = useNavigation();
  const { data: usuarios = [] } = useListarUsuarios({});
  const { data: dashboardData } = useDashboard();

  // Métricas calculadas dos usuários
  const totalUsuarios = usuarios.length;
  const usuariosAtivos = usuarios.filter(u => u.ativo).length;
  const usuariosPorCargo = usuarios.reduce((acc, user) => {
    const cargo = user.cargo?.nome || "Sem cargo";
    acc[cargo] = (acc[cargo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Dados para gráficos
  const barChartData = Object.values(usuariosPorCargo);
  const areaChartData = [45, 52, 38, 65, 72, 85, 91]; // Exemplo de dados de atividade semanal

  return (
    <DashboardLayout title="Dashboard Administrativo" items={navigationItems}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: "#1B2559" }}>
          Dashboard Administrativo
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Visão geral do sistema NextLevel e métricas de engajamento
        </Typography>

        {/* Alertas */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <AlertTitle>Atenção</AlertTitle>
            Há {totalUsuarios - usuariosAtivos} usuários inativos que precisam de revisão
          </Alert>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <AlertTitle>Sistema Estável</AlertTitle>
            Todos os serviços estão operando normalmente
          </Alert>
        </Stack>

        {/* Métricas Principais */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total de Usuários"
              value={totalUsuarios.toString()}
              icon={<People />}
              trend="up"
              trendValue="12%"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Usuários Ativos"
              value={usuariosAtivos.toString()}
              icon={<CheckCircle />}
              trend="up"
              trendValue="8%"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total de Cursos"
              value={dashboardData?.totalCursos?.toString() || "0"}
              icon={<School />}
              trend="up"
              trendValue="3%"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Avaliações"
              value={dashboardData?.totalAvaliacoes?.toString() || "0"}
              icon={<Assignment />}
              trend="down"
              trendValue="2%"
            />
          </Grid>
        </Grid>

        {/* Gráficos */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Usuários por Cargo
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Distribuição dos usuários por função na empresa
              </Typography>
              <SimpleBarChart data={barChartData} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Atividade Semanal
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Engajamento dos usuários nos últimos 7 dias
              </Typography>
              <SimpleAreaChart data={areaChartData} color="#10B981" />
            </Paper>
          </Grid>
        </Grid>

        {/* Tabelas de Dados */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Últimos Usuários Cadastrados
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuário</TableCell>
                      <TableCell>Cargo</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuarios.slice(0, 5).map((usuario) => (
                      <TableRow key={usuario.id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: "#1283E6" }}>
                              {usuario.nome?.charAt(0) || "U"}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {usuario.nome}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {usuario.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={usuario.cargo?.nome || "Sem cargo"}
                            size="small"
                            variant="outlined"
                            icon={<Business />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={usuario.ativo ? "Ativo" : "Inativo"}
                            size="small"
                            color={usuario.ativo ? "success" : "error"}
                            variant="filled"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Estatísticas por Departamento
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Cargo</TableCell>
                      <TableCell align="right">Usuários</TableCell>
                      <TableCell align="right">Percentual</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(usuariosPorCargo).map(([cargo, quantidade]) => (
                      <TableRow key={cargo} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {cargo}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{quantidade}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="primary">
                            {((quantidade / totalUsuarios) * 100).toFixed(1)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}

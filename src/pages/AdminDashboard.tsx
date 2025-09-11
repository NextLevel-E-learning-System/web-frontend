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
  const { data: dashboardResponse } = useDashboard();
  
  // Dados da API do dashboard
  const dashboardData = dashboardResponse?.dashboard_data;
  const metricas = dashboardData?.metricas_gerais;
  const cursosPopulares = dashboardData?.cursos_populares || [];
  const engajamentoDepartamento = dashboardData?.engajamento_departamento || [];

  // Dados para gráficos
  const funcionariosAtivosData = engajamentoDepartamento.map(dept => dept.funcionarios_ativos);
  const inscricoesChartData = engajamentoDepartamento.map(dept => dept.total_inscricoes);
  const departmentLabels = engajamentoDepartamento.map(dept => dept.departamento);

  return (
    <DashboardLayout title="Dashboard Administrativo" items={navigationItems}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total de Usuários"
              value={metricas?.total_usuarios || 0}
              icon={<People />}
              positive={true}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Usuários Ativos (30d)"
              value={metricas?.usuarios_ativos_30d || 0}
              icon={<CheckCircle />}
              positive={true}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total de Cursos"
              value={metricas?.total_cursos || 0}
              icon={<School />}
              positive={true}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Taxa de Conclusão"
              value={`${(metricas?.taxa_conclusao_geral || 0) * 100}%`}
              icon={<Assignment />}
              positive={false}
            />
          </Grid>
        </Grid>

        {/* Gráficos */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Funcionários Ativos por Departamento
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Número de funcionários ativos em cada departamento
              </Typography>
              <SimpleBarChart data={funcionariosAtivosData} />
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {departmentLabels.map((label, index) => (
                  <Chip 
                    key={label} 
                    label={`${label}: ${funcionariosAtivosData[index]}`} 
                    size="small" 
                    variant="outlined"
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Total de Inscrições por Departamento
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Número total de inscrições em cursos por departamento
              </Typography>
              <SimpleAreaChart data={inscricoesChartData} color="#10B981" />
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {departmentLabels.map((label, index) => (
                  <Chip 
                    key={label} 
                    label={`${label}: ${inscricoesChartData[index]}`} 
                    size="small" 
                    variant="outlined"
                    color={inscricoesChartData[index] > 0 ? "primary" : "default"}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabelas de Dados */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Cursos Populares
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Curso</TableCell>
                      <TableCell align="right">Inscrições</TableCell>
                      <TableCell align="right">Taxa Conclusão</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cursosPopulares.map((curso) => (
                      <TableRow key={curso.codigo} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {curso.titulo}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {curso.codigo}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{curso.inscricoes}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${(curso.taxa_conclusao * 100).toFixed(1)}%`}
                            size="small"
                            color={curso.taxa_conclusao > 0.7 ? "success" : curso.taxa_conclusao > 0.4 ? "warning" : "error"}
                            variant="filled"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {cursosPopulares.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography color="text.secondary">Nenhum curso encontrado</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Métricas Completas por Departamento
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Departamento</TableCell>
                      <TableCell align="right">Total Func.</TableCell>
                      <TableCell align="right">Func. Ativos</TableCell>
                      <TableCell align="right">Inscrições</TableCell>
                      <TableCell align="right">Taxa Conclusão</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {engajamentoDepartamento.map((dept) => (
                      <TableRow key={dept.departamento} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {dept.nome_departamento}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dept.departamento}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{dept.total_funcionarios}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={dept.funcionarios_ativos.toString()}
                            size="small"
                            color={dept.funcionarios_ativos > 0 ? "success" : "default"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="primary">
                            {dept.total_inscricoes}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${(dept.taxa_conclusao * 100).toFixed(1)}%`}
                            size="small"
                            color={dept.taxa_conclusao > 0.7 ? "success" : dept.taxa_conclusao > 0.4 ? "warning" : dept.taxa_conclusao > 0 ? "error" : "default"}
                            variant={dept.taxa_conclusao > 0 ? "filled" : "outlined"}
                          />
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

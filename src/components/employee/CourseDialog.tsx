import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import StarIcon from "@mui/icons-material/Star";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import React from "react";
import { useCourseModules } from "@/api/courses";

export interface CourseData {
  title: string;
  category: string;
  description?: string;
  rating?: number;
  reviews?: number;
  students?: number;
  level?: string;
  hours: string; // e.g., "12h total"
  price?: string;
  priceOriginal?: string;
  badgeLabel?: string;
  gradientFrom: string;
  gradientTo: string;
  courseCode?: string;
  xpOffered?: number;
  isActive?: boolean;
  // Novas propriedades
  instructorName?: string;
  prerequisites?: string[];
  completionRate?: number;
  totalEnrollments?: number;
  modules?: any[]; // Módulos já carregados, se disponível
}

interface Props {
  open: boolean;
  onClose: () => void;
  course?: CourseData | null;
  onEnroll?: (courseCode: string) => void;
  isEnrolling?: boolean;
}

export default function CourseDialog({ open, onClose, course, onEnroll, isEnrolling }: Props) {
  const [tab, setTab] = React.useState(0);
  
  // Buscar módulos do curso se não estiverem disponíveis e courseCode estiver presente
  const shouldFetchModules = !course?.modules && !!course?.courseCode;
  const { data: fetchedModules, isLoading: modulesLoading, error: modulesError } = useCourseModules(
    shouldFetchModules ? course.courseCode : ""
  );

  // Usar módulos já disponíveis ou os buscados via API
  const modules = course?.modules || fetchedModules;

  if (!course) return null;

  const orig = course.priceOriginal ? Number(String(course.priceOriginal).replace(/[^0-9.]/g, "")) : undefined;
  const curr = course.price ? Number(String(course.price).replace(/[^0-9.]/g, "")) : undefined;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <Box sx={{
        height: 150,
        background: `linear-gradient(135deg, ${course.gradientFrom}, ${course.gradientTo})`,
        px: 3,
        py: 2,
        color: "#fff",
      }}>
        <Chip label={course.category} sx={{ bgcolor: "rgba(255,255,255,0.25)", color: "#fff", fontWeight: 700 }} />
        <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>{course.title}</Typography>
        {course.badgeLabel ? (
          <Chip label={course.badgeLabel} sx={{ bgcolor: "rgba(17,24,39,0.8)", color: "#fff", fontWeight: 700, position: "absolute", top: 12, right: 12 }} />
        ) : null}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1, flexWrap: "wrap" }}>
          {course.completionRate !== undefined && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CheckCircleIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">{course.completionRate.toFixed(1)}% conclusão</Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PeopleAltIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">{course.totalEnrollments || 0} inscritos</Typography>
          </Box>
          <Typography variant="body2">{course.level}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">{course.hours.replace(" total", "")}</Typography>
          </Box>
        </Box>
      </Box>
      <DialogContent sx={{ p: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3 }}>
          <Tab label="Visão Geral" />
          <Tab label="Módulos" />
          <Tab label="Avaliações" />
        </Tabs>
        <Divider />
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>Sobre este Curso</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {course.description}
            </Typography>

            {/* Informações do Instrutor */}
            {course.instructorName && (
              <Box sx={{ mb: 3, p: 2, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "grey.50" }}>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>Instrutor</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {course.instructorName}
                </Typography>
              </Box>
            )}

            {/* Estatísticas do Curso */}
            {(course.totalEnrollments !== undefined || course.completionRate !== undefined) && (
              <Box sx={{ mb: 3, p: 2, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "primary.50" }}>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>Estatísticas</Typography>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {course.totalEnrollments !== undefined && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PeopleAltIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        <strong>{course.totalEnrollments}</strong> inscrições
                      </Typography>
                    </Box>
                  )}
                  {course.completionRate !== undefined && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleIcon fontSize="small" color="success" />
                      <Typography variant="body2">
                        <strong>{course.completionRate}%</strong> taxa de conclusão
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: course.prerequisites?.length ? "1fr 1fr" : "1fr" }, gap: 2 }}>
              <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>O curso inclui</Typography>
                {[
                  { icon: <AccessTimeIcon fontSize="small" />, text: `${course.hours} de conteúdo` },
                  { icon: <PlaylistPlayIcon fontSize="small" />, text: `${modules?.length || 0} módulos` },
                  { icon: <WorkspacePremiumIcon fontSize="small" />, text: `${course.xpOffered || 0} XP ao completar` },
                  { icon: <BookmarkIcon fontSize="small" />, text: "Certificado de conclusão" },
                ].map((i, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    {i.icon}
                    <Typography variant="body2">{i.text}</Typography>
                  </Box>
                ))}
              </Box>
              
              {/* Pré-requisitos */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>Pré-requisitos</Typography>
                  {course.prerequisites.map((prerequisite, idx) => (
                    <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <CheckCircleIcon color="warning" fontSize="small" />
                      <Typography variant="body2">{prerequisite}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            <Box sx={{ mt: 3, p: 2, borderTop: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "end", flexWrap: "wrap", gap: 2 }}>
              
              {course.isActive && (
                <Button 
                  variant="contained" 
                  sx={{ bgcolor: "#0f172a" }}
                  onClick={() => course.courseCode && onEnroll?.(course.courseCode)}
                  disabled={isEnrolling}
                >
                  {isEnrolling ? "Inscrevendo..." : "Inscrever-se"}
                </Button>
              )}
            </Box>
          </Box>
        )}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>Módulos do Curso</Typography>
            {(modulesLoading && shouldFetchModules) ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : modulesError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Erro ao carregar os módulos: {modulesError.message}
              </Alert>
            ) : modules && modules.length > 0 ? (
              <List>
                {modules
                  .sort((a, b) => a.ordem - b.ordem)
                  .map((module, index) => (
                    <ListItem key={module.id} sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <Box sx={{ 
                          minWidth: 32, 
                          height: 32, 
                          borderRadius: "50%", 
                          bgcolor: "primary.main", 
                          color: "white", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 700
                        }}>
                          {index + 1}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {module.titulo}
                            </Typography>
                            {module.obrigatorio && (
                              <Chip label="Obrigatório" size="small" color="warning" />
                            )}
                            {module.xp > 0 && (
                              <Chip label={`${module.xp} XP`} size="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {module.conteudo && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {module.conteudo.length > 200 
                                  ? `${module.conteudo.substring(0, 200)}...` 
                                  : module.conteudo
                                }
                              </Typography>
                            )}
                            {module.tipo_conteudo && (
                              <Chip 
                                label={module.tipo_conteudo} 
                                size="small" 
                                variant="outlined" 
                                sx={{ mr: 1 }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                Este curso ainda não possui módulos cadastrados.
              </Typography>
            )}
          </Box>
        )}
        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>Métricas do Curso</Typography>
            {(course.totalEnrollments !== undefined && course.totalEnrollments > 0) || 
             (course.completionRate !== undefined && course.completionRate > 0) ? (
              <Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}>
                  {/* Taxa de Conclusão */}
                  <Box sx={{ textAlign: "center", p: 3, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight={900} color="success.main">
                      {(course.completionRate || 0).toFixed(1)}%
                    </Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                      Taxa de Conclusão
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Percentual de alunos que completaram o curso
                    </Typography>
                  </Box>

                  {/* Total de Inscrições */}
                  <Box sx={{ textAlign: "center", p: 3, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight={900} color="primary.main">
                      {course.totalEnrollments || 0}
                    </Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                      Total de Inscrições
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Número de funcionários inscritos
                    </Typography>
                  </Box>
                </Box>

                {/* Indicadores de Qualidade */}
                <Box sx={{ p: 3, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "grey.50" }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Indicadores de Qualidade
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
                    {course.completionRate !== undefined && (
                      <Chip 
                        label={
                          course.completionRate >= 80 ? "Alta Taxa de Conclusão" :
                          course.completionRate >= 60 ? "Boa Taxa de Conclusão" : 
                          "Taxa de Conclusão em Melhoria"
                        }
                        color={
                          course.completionRate >= 80 ? "success" :
                          course.completionRate >= 60 ? "warning" : "default"
                        }
                        variant="filled"
                      />
                    )}
                    {course.totalEnrollments !== undefined && course.totalEnrollments > 50 && (
                      <Chip label="Curso Popular" color="primary" variant="filled" />
                    )}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary">
                Este curso ainda não possui métricas suficientes para exibição.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

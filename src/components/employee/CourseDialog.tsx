import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import StarIcon from "@mui/icons-material/Star";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import React from "react";

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
}

interface Props {
  open: boolean;
  onClose: () => void;
  course?: CourseData | null;
}

export default function CourseDialog({ open, onClose, course }: Props) {
  const [tab, setTab] = React.useState(0);
  if (!course) return null;

  const orig = course.priceOriginal ? Number(String(course.priceOriginal).replace(/[^0-9.]/g, "")) : undefined;
  const curr = course.price ? Number(String(course.price).replace(/[^0-9.]/g, "")) : undefined;
  const discount = orig && curr && orig > curr ? Math.round(((orig - curr) / orig) * 100) : undefined;

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <StarIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">{(course.rating ?? 4.7).toFixed(1)} ({course.reviews ?? 3} reviews)</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PeopleAltIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">{course.students ?? 2540} students</Typography>
          </Box>
          <Typography variant="body2">{course.level ?? "Advanced"}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">{course.hours.replace(" total", "")}</Typography>
          </Box>
        </Box>
      </Box>
      <DialogContent sx={{ p: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3 }}>
          <Tab label="Overview" />
          <Tab label="Curriculum" />
          <Tab label="Reviews" />
        </Tabs>
        <Divider />
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>About This Course</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {course.description ?? "Master advanced React patterns and Redux state management for building complex applications."}
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
              <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>What You'll Learn</Typography>
                {[
                  "Master all the core concepts covered in the course",
                  "Build real-world projects with practical applications",
                  "Understand advanced techniques and best practices",
                  "Gain the skills needed for professional development",
                ].map((t) => (
                  <Box key={t} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2">{t}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>Course Includes</Typography>
                {[
                  { icon: <AccessTimeIcon fontSize="small" />, text: course.hours.replace(" total", "") + " of video content" },
                  { icon: <PlaylistPlayIcon fontSize="small" />, text: "15 practical exercises" },
                  { icon: <WorkspacePremiumIcon fontSize="small" />, text: "Lifetime access" },
                  { icon: <WorkspacePremiumIcon fontSize="small" />, text: "Certificate of completion" },
                ].map((i, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    {i.icon}
                    <Typography variant="body2">{i.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ mt: 3, p: 2, borderTop: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {course.priceOriginal ? (
                  <Typography sx={{ textDecoration: "line-through", opacity: 0.6 }} variant="h6">{course.priceOriginal}</Typography>
                ) : null}
                {course.price ? (
                  <Typography variant="h5" fontWeight={900}>{course.price}</Typography>
                ) : null}
                {discount ? (
                  <Chip label={`${discount}% off`} color="success" size="small" />
                ) : null}
              </Box>
              <Button variant="contained" sx={{ bgcolor: "#0f172a" }}>Continue Learning</Button>
            </Box>
          </Box>
        )}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">Curriculum preview coming soon.</Typography>
          </Box>
        )}
        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">Reviews coming soon.</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

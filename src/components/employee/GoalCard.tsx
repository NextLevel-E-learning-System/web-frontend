import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

interface Props {
  title: string;
  subtitle: string;
  progress: number; // 0-100
  daysLeft: number;
}

export default function GoalCard({ title, subtitle, progress, daysLeft }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography fontWeight={700}>{title}</Typography>
        <IconButton size="small" aria-label="more">
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{subtitle}</Typography>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 6 }} />
      <Box sx={{ mt: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">{progress}% complete</Typography>
        <Typography variant="caption" color="text.secondary">{daysLeft} days left</Typography>
      </Box>
    </Paper>
  );
}

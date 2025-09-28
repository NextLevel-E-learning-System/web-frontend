import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

interface Props {
  icon?: React.ReactNode;
  label: string;
  value: string;
  trendLabel: string;
  trendColor?: string; // e.g., green for up, red for down
}

export default function StatCard({ icon, label, value, trendLabel, trendColor = "#16a34a" }: Props) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {icon ? (
          <Box sx={{ p: 1, borderRadius: 999, bgcolor: "rgba(15,23,42,0.05)", color: "text.secondary" }}>{icon}</Box>
        ) : null}
        <Box sx={{ flex: 1 }}>
          <Typography variant="overline" color="text.secondary">{label}</Typography>
          <Typography variant="h6" fontWeight={800}>{value}</Typography>
          <Chip
            label={trendLabel}
            size="small"
            sx={{ mt: 0.75, bgcolor: "rgba(22,163,74,0.1)", color: trendColor, fontWeight: 700 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

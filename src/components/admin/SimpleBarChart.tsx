import { Box } from "@mui/material";

export default function SimpleBarChart({ data, color = "#1283E6" }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  
  const width = 600;
  const height = 200;
  const max = Math.max(1, ...data);
  const barGap = 8;
  const barWidth = (width - barGap * (data.length + 1)) / data.length;

  return (
    <Box sx={{ width: "100%", height: height }}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" width="100%" height="100%">
        {data.map((d, i) => {
          const h = (d / max) * (height - 10);
          const x = barGap + i * (barWidth + barGap);
          const y = height - h;
          return <rect key={i} x={x} y={y} width={barWidth} height={h} rx={4} fill={color} opacity={0.8} />;
        })}
      </svg>
    </Box>
  );
}

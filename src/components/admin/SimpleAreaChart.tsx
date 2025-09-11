import { useMemo } from "react";
import { Box } from "@mui/material";

export default function SimpleAreaChart({ data, color = "#1283E6" }: { data: number[]; color?: string }) {
  const path = useMemo(() => {
    if (!data.length) return "";
    const width = 600;
    const height = 200;
    const max = Math.max(...data) || 1;
    const min = Math.min(...data);
    const range = Math.max(1, max - min);
    const pts = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    });
    const line = `M${pts[0]} L${pts.slice(1).join(" L")}`;
    const area = `${line} L${width},${height} L0,${height} Z`;
    return { line, area, width, height } as const;
  }, [data]);

  if (!path) return null;

  return (
    <Box sx={{ width: "100%", height: 200 }}>
      <svg viewBox={`0 0 ${path.width} ${path.height}`} preserveAspectRatio="none" width="100%" height="100%">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={path.area} fill="url(#areaGradient)" />
        <path d={path.line} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </Box>
  );
}

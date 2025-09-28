import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Box from "@mui/material/Box";

export type TimeRange = "monthly" | "all";

interface Props {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export default function TimeRangeToggle({ value, onChange }: Props) {
  return (
    <Box>
      <ToggleButtonGroup
        color="primary"
        value={value}
        exclusive
        onChange={(_, v) => v && onChange(v)}
        size="small"
      >
         <ToggleButton value="monthly">Monthly</ToggleButton>
        <ToggleButton value="all">All time</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

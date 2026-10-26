import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useTheme } from "@/shared/context/ThemeContext";

const PopularItemsChart = ({ data = [] }) => {
  let isDark = false;
  try {
    const themeContext = useTheme();
    isDark = themeContext?.isDark ?? false;
  } catch (e) {
    isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  }

  const gridStroke = isDark ? "rgba(255, 255, 255, 0.08)" : "#E5E7EB";
  const tickColor = isDark ? "#94a3b8" : "#666666";

  const normalizedData = Array.isArray(data) ? data.map((item) => ({
    name: item?.name || item?._id || "Unknown",
    quantity: Number(item?.quantity ?? item?.count ?? 0),
    revenue: Number(item?.revenue || 0)
  })) : [];
  return <div style={{ width: "100%", minHeight: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={normalizedData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} />
                <YAxis tick={{ fill: tickColor, fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#4A90E2" name="Quantity Sold" radius={[6, 6, 0, 0]} />
                <Bar dataKey="revenue" fill="#50E3C2" name="Revenue" radius={[6, 6, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
        </div>;
};
var stdin_default = PopularItemsChart;
export {
  stdin_default as default
};

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import {
  FiPieChart,
  FiBarChart2,
  FiTrendingUp,
  FiActivity,
  FiDownload,
  FiRefreshCw,
  FiMaximize2
} from "react-icons/fi";
import { useTheme } from "@/shared/context/ThemeContext";
const OrdersChart = ({
  data = [],
  title = "Order Statistics",
  subtitle = "Breakdown of your orders",
  type = "pie",
  height = 400,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  showAnimation = true,
  showControls = true,
  onDataPointClick,
  onExport,
  onRefresh,
  isLoading = false,
  emptyMessage = "No data available",
  colors = ["#4A90E2", "#50E3C2", "#F5A623", "#E94B3C", "#7C5CFC", "#9B9B9B", "#37BC9B", "#F15B6C"],
  valueKey = "count",
  nameKey = "_id",
  variant = "default"
}) => {
  void motion;
  const [chartType, setChartType] = useState(type);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const chartContainerRef = useRef(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  let isDark = false;
  try {
    const themeContext = useTheme();
    isDark = themeContext?.isDark ?? false;
  } catch (e) {
    isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  }

  const gridStroke = isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0";
  const tickColor = isDark ? "#94a3b8" : "#64748b";
  const axisStroke = isDark ? "rgba(255, 255, 255, 0.15)" : "#cbd5e1";
  const formatStatusLabel = (val) => {
    if (!val || typeof val !== 'string') return String(val || '');
    return val
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
    return data.map((item, index) => {
      const rawName = item[nameKey] ?? item.status ?? item._id ?? `Item ${index + 1}`;
      return {
        ...item,
        [nameKey]: rawName,
        displayLabel: formatStatusLabel(rawName),
        percentage: total > 0 ? ((item[valueKey] / total) * 100).toFixed(1) : "0.0",
        fill: item.color || colors[index % colors.length]
      };
    });
  }, [data, valueKey, nameKey, colors]);
  useEffect(() => {
    if (!chartContainerRef.current) return undefined;

    const updateSize = () => {
      if (!chartContainerRef.current) return;
      const rect = chartContainerRef.current.getBoundingClientRect();
      setChartSize({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height))
      });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isFullscreen, height, variant]);
  if (!processedData.length && !isLoading) {
    return <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-8
                         border border-slate-200 dark:border-slate-700
                         text-center h-full flex flex-col items-center justify-center min-h-[380px]"
    >
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {emptyMessage}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Start ordering to see your statistics
                </p>
            </motion.div>;
  }
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data2 = payload[0].payload;
      return <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 px-4 py-3 rounded-xl
                             shadow-lg border border-slate-200 dark:border-slate-700"
      >
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">
                        {data2.displayLabel || data2[nameKey]}
                    </p>
                    <div className="space-y-1 text-sm">
                        <p className="text-slate-600 dark:text-slate-400">
                            Count: <span className="font-medium text-primary-600">{data2[valueKey]}</span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                            Percentage: <span className="font-medium text-green-500">{data2.percentage}%</span>
                        </p>
                    </div>
                </motion.div>;
    }
    return null;
  };
  const CustomLegend = ({ payload }) => <ul className="flex flex-wrap justify-center gap-4 mt-4">
            {payload.map((entry, index) => <motion.li
    key={`legend-${index}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg
                        cursor-pointer transition-all duration-200
                        ${selectedSegment === entry.value ? "bg-primary-100 dark:bg-primary-950/40" : "hover:bg-slate-100 dark:hover:bg-slate-700"}
                    `}
    onClick={() => {
      setSelectedSegment(selectedSegment === entry.value ? null : entry.value);
    }}
    onMouseEnter={() => setHoveredSegment(entry.value)}
    onMouseLeave={() => setHoveredSegment(null)}
  >
                    <div
    className="w-3 h-3 rounded-full"
    style={{ backgroundColor: entry.color }}
  />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                        {formatStatusLabel(entry.value)}
                    </span>
                    <span className="text-xs text-slate-500">
                        ({entry.payload?.percentage}%)
                    </span>
                </motion.li>)}
        </ul>;
  const chartTypes = [
    { id: "pie", icon: FiPieChart, label: "Pie Chart" },
    { id: "bar", icon: FiBarChart2, label: "Bar Chart" },
    { id: "line", icon: FiTrendingUp, label: "Line Chart" },
    { id: "area", icon: FiActivity, label: "Area Chart" },
    { id: "radar", icon: FiActivity, label: "Radar Chart" }
  ];
  const resolvedChartWidth = chartSize.width > 0 ? chartSize.width : 320;
  const resolvedChartHeight = chartSize.height > 0 ? chartSize.height : (height || 300);
  const renderChart = () => {
    const commonProps = {
      width: resolvedChartWidth,
      height: resolvedChartHeight,
      data: processedData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };
    switch (chartType) {
      case "pie":
        return <PieChart {...commonProps}>
                        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          innerRadius={variant === "compact" ? 35 : 55}
          outerRadius={variant === "compact" ? 65 : 85}
          paddingAngle={2}
          dataKey={valueKey}
          nameKey={nameKey}
          label={variant !== "compact" && ((entry) => entry.displayLabel || `${entry[nameKey]}`)}
          labelLine={false}
          isAnimationActive={showAnimation}
          onClick={(data2) => onDataPointClick?.(data2)}
          onMouseEnter={(_, index) => setHoveredSegment(processedData[index][nameKey])}
          onMouseLeave={() => setHoveredSegment(null)}
        >
                            {processedData.map((entry, index) => <Cell
          key={`cell-${index}`}
          fill={entry.fill}
          stroke={hoveredSegment === entry[nameKey] ? "#f97316" : "none"}
          strokeWidth={2}
          className="transition-all duration-200"
          style={{
            filter: hoveredSegment === entry[nameKey] ? "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" : "none",
            opacity: selectedSegment && selectedSegment !== entry[nameKey] ? 0.5 : 1
          }}
        />)}
                        </Pie>
                        {showTooltip && <Tooltip content={<CustomTooltip />} />}
                        {showLegend && <Legend content={<CustomLegend />} />}
                    </PieChart>;
      case "bar":
        return <BarChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />}
                        <XAxis
          dataKey={nameKey}
          tick={{ fill: tickColor }}
          axisLine={{ stroke: axisStroke }}
        />
                        <YAxis
          tick={{ fill: tickColor }}
          axisLine={{ stroke: axisStroke }}
        />
                        {showTooltip && <Tooltip content={<CustomTooltip />} />}
                        {showLegend && <Legend />}
                        <Bar
          dataKey={valueKey}
          isAnimationActive={showAnimation}
          onClick={(data2) => onDataPointClick?.(data2)}
        >
                            {processedData.map((entry, index) => <Cell
          key={`cell-${index}`}
          fill={entry.fill}
          className="transition-all duration-200"
          style={{
            opacity: selectedSegment && selectedSegment !== entry[nameKey] ? 0.5 : 1,
            transform: hoveredSegment === entry[nameKey] ? "scale(1.02)" : "scale(1)",
            transformOrigin: "bottom"
          }}
        />)}
                        </Bar>
                    </BarChart>;
      case "line":
        return <LineChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />}
                        <XAxis
          dataKey={nameKey}
          tick={{ fill: tickColor }}
          axisLine={{ stroke: axisStroke }}
        />
                        <YAxis
          tick={{ fill: tickColor }}
          axisLine={{ stroke: axisStroke }}
        />
                        {showTooltip && <Tooltip content={<CustomTooltip />} />}
                        {showLegend && <Legend />}
                        <Line
          type="monotone"
          dataKey={valueKey}
          stroke="#f97316"
          strokeWidth={3}
          dot={{ fill: "#f97316", r: 6 }}
          activeDot={{ r: 8, fill: "#f97316" }}
          isAnimationActive={showAnimation}
          onClick={(data2) => onDataPointClick?.(data2)}
        />
                    </LineChart>;
      case "area":
        return <AreaChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />}
                        <XAxis
          dataKey={nameKey}
          tick={{ fill: tickColor }}
          axisLine={{ stroke: axisStroke }}
        />
                        <YAxis
          tick={{ fill: tickColor }}
          axisLine={{ stroke: axisStroke }}
        />
                        {showTooltip && <Tooltip content={<CustomTooltip />} />}
                        {showLegend && <Legend />}
                        <Area
          type="monotone"
          dataKey={valueKey}
          stroke="#f97316"
          fill="url(#colorGradient)"
          strokeWidth={2}
          isAnimationActive={showAnimation}
          onClick={(data2) => onDataPointClick?.(data2)}
        />
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                    </AreaChart>;
      case "radar":
        return <RadarChart {...commonProps} outerRadius="70%">
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
          dataKey={nameKey}
          tick={{ fill: "#64748b", fontSize: 12 }}
        />
                        <PolarRadiusAxis
          angle={30}
          domain={[0, "auto"]}
          tick={{ fill: "#64748b" }}
        />
                        <Radar
          name="Orders"
          dataKey={valueKey}
          stroke="#f97316"
          fill="#f97316"
          fillOpacity={0.6}
          isAnimationActive={showAnimation}
          onClick={(data2) => onDataPointClick?.(data2)}
        />
                        {showTooltip && <Tooltip content={<CustomTooltip />} />}
                        {showLegend && <Legend />}
                    </RadarChart>;
      default:
        return null;
    }
  };
  const variantStyles = {
    default: "p-6",
    compact: "p-4",
    detailed: "p-8"
  };
  return <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
            className={`
                bg-white dark:bg-slate-800 rounded-2xl
                border border-slate-200 dark:border-slate-700
                w-full h-full flex flex-col justify-between
                ${variantStyles[variant]}
                ${isFullscreen ? "fixed inset-4 z-50 overflow-auto" : ""}
                transition-all duration-300
            `}
  >
            {
    /* Header */
  }
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {title}
                    </h3>
                    {subtitle && variant !== "compact" && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {subtitle}
                        </p>}
                </div>

                {
    /* Controls */
  }
                {showControls && <div className="flex items-center gap-2">
                        {
    /* Chart Type Selector */
  }
                        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 
                                      rounded-lg">
                            {chartTypes.map((type2) => <button
    key={type2.id}
    onClick={() => setChartType(type2.id)}
    className={`
                                        p-2 rounded-lg transition-all duration-200
                                        ${chartType === type2.id ? "bg-white dark:bg-slate-600 text-primary-600 shadow-sm" : "text-slate-500 hover:text-primary-600"}
                                    `}
    title={type2.label}
  >
                                    <type2.icon className="w-4 h-4" />
                                </button>)}
                        </div>

                        {
    /* Action Buttons */
  }
                        <button
    onClick={() => setIsFullscreen(!isFullscreen)}
    className="p-2 text-slate-500 hover:text-primary-600
                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                     rounded-lg transition-all duration-200"
    title="Toggle fullscreen"
  >
                            <FiMaximize2 className="w-4 h-4" />
                        </button>

                        {onExport && <button
    onClick={onExport}
    className="p-2 text-slate-500 hover:text-primary-600
                                         hover:bg-slate-100 dark:hover:bg-slate-700
                                         rounded-lg transition-all duration-200"
    title="Export data"
  >
                                <FiDownload className="w-4 h-4" />
                            </button>}

                        {onRefresh && <button
    onClick={onRefresh}
    className="p-2 text-slate-500 hover:text-primary-600
                                         hover:bg-slate-100 dark:hover:bg-slate-700
                                         rounded-lg transition-all duration-200"
    title="Refresh"
  >
                                <FiRefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                            </button>}
                    </div>}
            </div>

            {
    /* Chart Container */
  }
            <div
    ref={chartContainerRef}
    className="flex-1 min-h-0"
    style={{ width: "100%", minWidth: 0, minHeight: 260, height: isFullscreen ? "calc(100% - 100px)" : height }}
  >
                {isLoading ? <div className="flex items-center justify-center h-full">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 
                                          border-t-primary-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">
                                📊
                            </div>
                        </div>
                    </div> : chartSize.width > 0 && chartSize.height > 0 ? <div className="h-full w-full min-w-0">
                      {renderChart()}
                    </div> : <div className="h-full w-full" />}
            </div>

            {
    /* Summary Stats */
  }
            {variant === "detailed" && processedData.length > 0 && <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {processedData.map((item, index) => <motion.div
    key={`stat-${index}`}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl
                                     border border-slate-200 dark:border-slate-700"
  >
                            <div className="flex items-center gap-2 mb-1">
                                <div
    className="w-3 h-3 rounded-full"
    style={{ backgroundColor: item.fill }}
  />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                    {item[nameKey]}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-primary-600">
                                    {item[valueKey]}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {item.percentage}%
                                </span>
                            </div>
                        </motion.div>)}
                </div>}

            {
    /* Footer with total */
  }
            {variant !== "compact" && <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700
                              flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                        Total Orders
                    </span>
                    <span className="text-xl font-bold text-primary-600">
                        {processedData.reduce((sum, item) => sum + item[valueKey], 0)}
                    </span>
                </div>}
        </motion.div>;
};
var stdin_default = OrdersChart;
export {
  stdin_default as default
};

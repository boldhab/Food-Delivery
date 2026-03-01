import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, ComposedChart, Area, ReferenceLine, Brush, Label
} from 'recharts';
import {
    FiTrendingUp,
    FiTrendingDown,
    FiDollarSign,
    FiShoppingBag,
    FiUsers,
    FiCalendar,
    FiDownload,
    FiRefreshCw,
    FiMaximize2,
    FiInfo,
    FiBarChart2,
    FiActivity,
    FiPieChart
} from 'react-icons/fi';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface RevenueData {
    _id: string;
    revenue: number;
    orders: number;
    customers?: number;
    averageOrderValue?: number;
    profit?: number;
    costs?: number;
}

interface RevenueChartProps {
    data?: RevenueData[];
    title?: string;
    subtitle?: string;
    metrics?: Array<'revenue' | 'orders' | 'customers' | 'averageOrderValue' | 'profit' | 'costs'>;
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    height?: number;
    showControls?: boolean;
    showBrush?: boolean;
    showGrid?: boolean;
    showAnimation?: boolean;
    onMetricClick?: (metric: string, value: any) => void;
    onPeriodChange?: (period: string) => void;
    onExport?: () => void;
    onRefresh?: () => void;
    isLoading?: boolean;
    currency?: string;
    comparison?: boolean;
    previousPeriodData?: RevenueData[];
    variant?: 'default' | 'compact' | 'detailed';
}

const RevenueChart = ({
    data = [],
    title = 'Revenue Analytics',
    subtitle = 'Track your business performance',
    metrics = ['revenue', 'orders'],
    period = 'daily',
    height = 400,
    showControls = true,
    showBrush = true,
    showGrid = true,
    showAnimation = true,
    onMetricClick,
    onPeriodChange,
    onExport,
    onRefresh,
    isLoading = false,
    currency = '$',
    comparison = false,
    previousPeriodData = [],
    variant = 'default'
}: RevenueChartProps) => {
    
    const [chartType, setChartType] = useState<'line' | 'bar' | 'composed'>('line');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedMetrics, setSelectedMetrics] = useState(metrics);
    const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
    const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);

    // Colors for different metrics
    const metricColors = {
        revenue: '#f97316',
        orders: '#3b82f6',
        customers: '#10b981',
        averageOrderValue: '#8b5cf6',
        profit: '#22c55e',
        costs: '#ef4444'
    };

    // Metric labels and icons
    const metricConfig = {
        revenue: { label: 'Revenue', icon: FiDollarSign, format: (val: number) => `${currency}${val.toLocaleString()}` },
        orders: { label: 'Orders', icon: FiShoppingBag, format: (val: number) => val.toLocaleString() },
        customers: { label: 'Customers', icon: FiUsers, format: (val: number) => val.toLocaleString() },
        averageOrderValue: { label: 'Avg Order', icon: FiTrendingUp, format: (val: number) => `${currency}${val.toLocaleString()}` },
        profit: { label: 'Profit', icon: FiTrendingUp, format: (val: number) => `${currency}${val.toLocaleString()}` },
        costs: { label: 'Costs', icon: FiTrendingDown, format: (val: number) => `${currency}${val.toLocaleString()}` }
    };

    // Process data with trends
    const processedData = useMemo(() => {
        if (!data.length) return [];

        return data.map((item, index, array) => {
            const prevItem = index > 0 ? array[index - 1] : null;
            
            // Calculate trends
            const trends = {} as any;
            metrics.forEach(metric => {
                if (prevItem && prevItem[metric]) {
                    const change = ((item[metric] - prevItem[metric]) / prevItem[metric]) * 100;
                    trends[`${metric}Trend`] = change;
                }
            });

            return {
                ...item,
                ...trends,
                formattedDate: format(new Date(item._id), 'MMM dd, yyyy')
            };
        });
    }, [data, metrics]);

    // Calculate summary statistics
    const summary = useMemo(() => {
        if (!processedData.length) return null;

        const total = processedData.reduce((acc, item) => ({
            revenue: acc.revenue + (item.revenue || 0),
            orders: acc.orders + (item.orders || 0),
            customers: acc.customers + (item.customers || 0),
            profit: acc.profit + (item.profit || 0),
            costs: acc.costs + (item.costs || 0)
        }), { revenue: 0, orders: 0, customers: 0, profit: 0, costs: 0 });

        const averageOrderValue = total.orders > 0 ? total.revenue / total.orders : 0;

        // Calculate growth compared to previous period
        const firstHalf = processedData.slice(0, Math.floor(processedData.length / 2));
        const secondHalf = processedData.slice(Math.floor(processedData.length / 2));
        
        const firstHalfRevenue = firstHalf.reduce((sum, item) => sum + (item.revenue || 0), 0);
        const secondHalfRevenue = secondHalf.reduce((sum, item) => sum + (item.revenue || 0), 0);
        
        const growth = firstHalfRevenue > 0 
            ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 
            : 0;

        return {
            ...total,
            averageOrderValue,
            growth,
            period
        };
    }, [processedData, period]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 px-4 py-3 rounded-xl
                             shadow-xl border border-slate-200 dark:border-slate-700
                             min-w-[200px]"
                >
                    <p className="font-semibold text-slate-900 dark:text-white mb-2">
                        {format(new Date(label), 'MMMM dd, yyyy')}
                    </p>
                    
                    {payload.map((entry: any, index: number) => {
                        const metric = entry.dataKey;
                        const config = metricConfig[metric as keyof typeof metricConfig];
                        const trend = payload.find((p: any) => p.dataKey === `${metric}Trend`);
                        
                        return (
                            <div key={index} className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        {config?.label || metric}:
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                        {config?.format(entry.value)}
                                    </span>
                                    {trend && (
                                        <span className={`
                                            text-xs px-1.5 py-0.5 rounded-full
                                            ${trend.value > 0 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }
                                        `}>
                                            {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            );
        }
        return null;
    };

    // Metric selector
    const MetricSelector = () => (
        <div className="flex flex-wrap gap-2">
            {Object.entries(metricConfig).map(([key, config]) => (
                <button
                    key={key}
                    onClick={() => {
                        if (selectedMetrics.includes(key as any)) {
                            setSelectedMetrics(prev => prev.filter(m => m !== key));
                        } else {
                            setSelectedMetrics(prev => [...prev, key as any]);
                        }
                    }}
                    className={`
                        px-3 py-1.5 rounded-lg text-sm font-medium
                        flex items-center gap-2 transition-all duration-200
                        ${selectedMetrics.includes(key as any)
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }
                    `}
                >
                    <config.icon className="w-4 h-4" />
                    {config.label}
                </button>
            ))}
        </div>
    );

    // Chart type selector
    const ChartTypeSelector = () => (
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
            {[
                { id: 'line', icon: FiActivity, label: 'Line Chart' },
                { id: 'bar', icon: FiBarChart2, label: 'Bar Chart' },
                { id: 'composed', icon: FiPieChart, label: 'Composed' }
            ].map((type) => (
                <button
                    key={type.id}
                    onClick={() => setChartType(type.id as any)}
                    className={`
                        p-2 rounded-lg transition-all duration-200
                        ${chartType === type.id
                            ? 'bg-white dark:bg-slate-600 text-orange-500 shadow-sm'
                            : 'text-slate-500 hover:text-orange-500'
                        }
                    `}
                    title={type.label}
                >
                    <type.icon className="w-4 h-4" />
                </button>
            ))}
        </div>
    );

    // Period selector
    const PeriodSelector = () => (
        <select
            value={period}
            onChange={(e) => onPeriodChange?.(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800
                     border border-slate-200 dark:border-slate-700
                     rounded-lg text-sm text-slate-700 dark:text-slate-300
                     focus:outline-none focus:border-orange-500"
        >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
        </select>
    );

    // Render chart based on type
    const renderChart = () => {
        const commonProps = {
            data: processedData,
            margin: { top: 20, right: 30, left: 20, bottom: 20 }
        };

        switch (chartType) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
                        <XAxis 
                            dataKey="_id" 
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                        />
                        <YAxis 
                            yAxisId="left"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(value) => `${currency}${value}`}
                        />
                        <YAxis 
                            yAxisId="right"
                            orientation="right"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        {selectedMetrics.map((metric, index) => (
                            <Line
                                key={metric}
                                yAxisId={metric === 'orders' ? 'right' : 'left'}
                                type="monotone"
                                dataKey={metric}
                                stroke={metricColors[metric]}
                                strokeWidth={3}
                                dot={{ r: 4, fill: metricColors[metric] }}
                                activeDot={{ r: 6, fill: metricColors[metric] }}
                                isAnimationActive={showAnimation}
                                name={metricConfig[metric]?.label}
                                onClick={(data) => onMetricClick?.(metric, data)}
                            />
                        ))}

                        {zoomRange && (
                            <Brush
                                dataKey="_id"
                                height={30}
                                stroke="#f97316"
                                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                                onChange={({ startIndex, endIndex }) => {
                                    setZoomRange([startIndex, endIndex]);
                                }}
                            />
                        )}
                    </LineChart>
                );

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
                        <XAxis 
                            dataKey="_id" 
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                        />
                        <YAxis 
                            yAxisId="left"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(value) => `${currency}${value}`}
                        />
                        <YAxis 
                            yAxisId="right"
                            orientation="right"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        {selectedMetrics.map((metric, index) => (
                            <Bar
                                key={metric}
                                yAxisId={metric === 'orders' ? 'right' : 'left'}
                                dataKey={metric}
                                fill={metricColors[metric]}
                                radius={[4, 4, 0, 0]}
                                isAnimationActive={showAnimation}
                                name={metricConfig[metric]?.label}
                                onClick={(data) => onMetricClick?.(metric, data)}
                            />
                        ))}
                    </BarChart>
                );

            case 'composed':
                return (
                    <ComposedChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
                        <XAxis 
                            dataKey="_id" 
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                        />
                        <YAxis 
                            yAxisId="left"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(value) => `${currency}${value}`}
                        />
                        <YAxis 
                            yAxisId="right"
                            orientation="right"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        {/* Revenue as area */}
                        {selectedMetrics.includes('revenue') && (
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="revenue"
                                fill="#f97316"
                                stroke="#f97316"
                                fillOpacity={0.2}
                                name="Revenue"
                            />
                        )}
                        
                        {/* Orders as line */}
                        {selectedMetrics.includes('orders') && (
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="orders"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                name="Orders"
                            />
                        )}
                        
                        {/* Other metrics as bars */}
                        {selectedMetrics
                            .filter(m => !['revenue', 'orders'].includes(m))
                            .map((metric, index) => (
                                <Bar
                                    key={metric}
                                    yAxisId="left"
                                    dataKey={metric}
                                    fill={metricColors[metric]}
                                    radius={[4, 4, 0, 0]}
                                    name={metricConfig[metric]?.label}
                                />
                            ))}
                    </ComposedChart>
                );
        }
    };

    // Empty state
    if (!processedData.length && !isLoading) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8
                         border border-slate-200 dark:border-slate-700
                         text-center"
            >
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No revenue data available
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Start accepting orders to see your revenue analytics
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                bg-white dark:bg-slate-800 rounded-2xl
                border border-slate-200 dark:border-slate-700
                ${variant === 'default' ? 'p-6' : variant === 'compact' ? 'p-4' : 'p-8'}
                ${isFullscreen ? 'fixed inset-4 z-50 overflow-auto' : ''}
                transition-all duration-300
            `}
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {title}
                    </h3>
                    {subtitle && variant !== 'compact' && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>

                {showControls && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <MetricSelector />
                        <ChartTypeSelector />
                        <PeriodSelector />
                        
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 text-slate-500 hover:text-orange-500
                                     hover:bg-slate-100 dark:hover:bg-slate-700
                                     rounded-lg transition-all duration-200"
                        >
                            <FiMaximize2 className="w-4 h-4" />
                        </button>

                        {onExport && (
                            <button
                                onClick={onExport}
                                className="p-2 text-slate-500 hover:text-orange-500
                                         hover:bg-slate-100 dark:hover:bg-slate-700
                                         rounded-lg transition-all duration-200"
                            >
                                <FiDownload className="w-4 h-4" />
                            </button>
                        )}

                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="p-2 text-slate-500 hover:text-orange-500
                                         hover:bg-slate-100 dark:hover:bg-slate-700
                                         rounded-lg transition-all duration-200"
                            >
                                <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            {summary && variant === 'detailed' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl
                                 border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                            <FiDollarSign className="w-4 h-4 text-orange-500" />
                            Total Revenue
                        </div>
                        <div className="text-2xl font-bold text-orange-500">
                            {currency}{summary.revenue.toLocaleString()}
                        </div>
                        <div className={`
                            text-xs mt-1 flex items-center gap-1
                            ${summary.growth > 0 ? 'text-green-500' : 'text-red-500'}
                        `}>
                            {summary.growth > 0 ? '↑' : '↓'} {Math.abs(summary.growth).toFixed(1)}%
                            <span className="text-slate-400 ml-1">vs previous period</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl
                                 border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                            <FiShoppingBag className="w-4 h-4 text-blue-500" />
                            Total Orders
                        </div>
                        <div className="text-2xl font-bold text-blue-500">
                            {summary.orders.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            Avg {currency}{summary.averageOrderValue.toFixed(2)} per order
                        </div>
                    </motion.div>

                    {summary.customers > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl
                                     border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                                <FiUsers className="w-4 h-4 text-green-500" />
                                Customers
                            </div>
                            <div className="text-2xl font-bold text-green-500">
                                {summary.customers.toLocaleString()}
                            </div>
                        </motion.div>
                    )}

                    {summary.profit > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl
                                     border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                                <FiTrendingUp className="w-4 h-4 text-green-500" />
                                Profit
                            </div>
                            <div className="text-2xl font-bold text-green-500">
                                {currency}{summary.profit.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Margin {((summary.profit / summary.revenue) * 100).toFixed(1)}%
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Chart Container */}
            <div style={{ width: '100%', height: isFullscreen ? 'calc(100% - 300px)' : height }}>
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 
                                          border-t-orange-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">
                                📊
                            </div>
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                )}
            </div>

            {/* Brush/Zoom Control */}
            {showBrush && processedData.length > 10 && !isLoading && (
                <div className="mt-4">
                    <ResponsiveContainer width="100%" height={60}>
                        <LineChart data={processedData}>
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#f97316"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Brush
                                dataKey="_id"
                                height={30}
                                stroke="#f97316"
                                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                                onChange={({ startIndex, endIndex }) => {
                                    setZoomRange([startIndex, endIndex]);
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Comparison Legend */}
            {comparison && previousPeriodData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full" />
                            <span className="text-slate-600 dark:text-slate-400">Current Period</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-slate-400 rounded-full" />
                            <span className="text-slate-600 dark:text-slate-400">Previous Period</span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default RevenueChart;
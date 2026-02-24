import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const RevenueChart = ({ data = [] }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="_id" tick={{ fill: '#666666', fontSize: 12 }} />
                <YAxis tick={{ fill: '#666666', fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#4A90E2" strokeWidth={3} activeDot={{ r: 6 }} name="Revenue" />
                <Line type="monotone" dataKey="orders" stroke="#50E3C2" strokeWidth={3} name="Orders" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default RevenueChart;

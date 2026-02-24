import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const PopularItemsChart = ({ data = [] }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fill: '#666666', fontSize: 12 }} />
                <YAxis tick={{ fill: '#666666', fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#4A90E2" name="Quantity Sold" radius={[6, 6, 0, 0]} />
                <Bar dataKey="revenue" fill="#50E3C2" name="Revenue" radius={[6, 6, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default PopularItemsChart;

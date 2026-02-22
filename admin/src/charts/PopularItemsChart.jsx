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
import './Charts.css';

const PopularItemsChart = ({ data = [] }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#8884d8" name="Quantity Sold" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default PopularItemsChart;

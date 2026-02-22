import React from 'react';
import './DataTable.css';

const DataTable = ({
    columns,
    data,
    loading = false,
    onSort,
    onPageChange,
    currentPage = 1,
    totalPages = 1
}) => {
    return (
        <div className="data-table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                onClick={() => col.sortable && onSort?.(col.key)}
                                style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                            >
                                {col.title}
                                {col.sortable && <span className="sort-icon"> ^v</span>}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="loading">
                                Loading...
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="no-data">
                                No data available
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={item._id || index}>
                                {columns.map((col) => (
                                    <td key={col.key}>{col.render ? col.render(item[col.key], item) : item[col.key]}</td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div className="pagination">
                    <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
                        Previous
                    </button>

                    {[...Array(totalPages).keys()].map((num) => (
                        <button
                            key={num + 1}
                            className={currentPage === num + 1 ? 'active' : ''}
                            onClick={() => onPageChange(num + 1)}
                        >
                            {num + 1}
                        </button>
                    ))}

                    <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataTable;

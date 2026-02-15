import React, { useState } from 'react';
import '../styles/FilterPanel.css';

const FilterPanel = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        category: 'all',
        type: 'all',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
        search: ''
    });

    const categories = [
        'All', 'Food', 'Transport', 'Entertainment', 
        'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            category: 'all',
            type: 'all',
            startDate: '',
            endDate: '',
            minAmount: '',
            maxAmount: '',
            search: ''
        };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    return (
        <div className="filter-panel">
            <h3>🔍 Filters</h3>
            
            <div className="filter-group">
                <label>Search</label>
                <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleChange}
                    placeholder="Search description..."
                />
            </div>

            <div className="filter-group">
                <label>Category</label>
                <select name="category" value={filters.category} onChange={handleChange}>
                    {categories.map(cat => (
                        <option key={cat} value={cat.toLowerCase()}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label>Type</label>
                <select name="type" value={filters.type} onChange={handleChange}>
                    <option value="all">All</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Start Date</label>
                <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleChange}
                />
            </div>

            <div className="filter-group">
                <label>End Date</label>
                <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleChange}
                />
            </div>

            <div className="filter-group">
                <label>Min Amount</label>
                <input
                    type="number"
                    name="minAmount"
                    value={filters.minAmount}
                    onChange={handleChange}
                    placeholder="₹ 0"
                />
            </div>

            <div className="filter-group">
                <label>Max Amount</label>
                <input
                    type="number"
                    name="maxAmount"
                    value={filters.maxAmount}
                    onChange={handleChange}
                    placeholder="₹ 10000"
                />
            </div>

            <button className="reset-btn" onClick={handleReset}>
                Reset Filters
            </button>
        </div>
    );
};

export default FilterPanel;

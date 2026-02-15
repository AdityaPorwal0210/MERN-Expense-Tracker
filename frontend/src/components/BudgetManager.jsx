import React, { useState, useEffect } from 'react';
import { getBudgets, createBudget, deleteBudget } from '../api/expenseApi';
import { toast } from 'react-toastify';
import '../styles/BudgetManager.css';

const BudgetManager = () => {
    const [budgets, setBudgets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        category: 'Food',
        amount: '',
        period: 'monthly',
        alertThreshold: 80
    });

    const categories = [
        'Food', 'Transport', 'Entertainment', 
        'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'
    ];

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            const response = await getBudgets();
            if (response.data.success) {
                setBudgets(response.data.data);
            }
        } catch (error) {
            console.error('Fetch budgets error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await createBudget(formData);
            if (response.data.success) {
                toast.success('Budget created successfully!');
                setShowForm(false);
                setFormData({ category: 'Food', amount: '', period: 'monthly', alertThreshold: 80 });
                fetchBudgets();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create budget');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this budget?')) {
            try {
                const response = await deleteBudget(id);
                if (response.data.success) {
                    toast.success('Budget deleted!');
                    fetchBudgets();
                }
            } catch (error) {
                toast.error('Failed to delete budget');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'safe': return '#4caf50';
            case 'warning': return '#ff9800';
            case 'exceeded': return '#f44336';
            default: return '#4caf50';
        }
    };

    return (
        <div className="budget-manager">
            <div className="budget-header">
                <h2>💰 Budget Management</h2>
                <button className="add-budget-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add Budget'}
                </button>
            </div>

            {showForm && (
                <form className="budget-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Amount (₹)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                                min="1"
                            />
                        </div>

                        <div className="form-group">
                            <label>Period</label>
                            <select
                                value={formData.period}
                                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                            >
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Alert at (%)</label>
                            <input
                                type="number"
                                value={formData.alertThreshold}
                                onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                                min="1"
                                max="100"
                            />
                        </div>
                    </div>
                    <button type="submit" className="submit-btn">Create Budget</button>
                </form>
            )}

            <div className="budgets-grid">
                {budgets.length === 0 ? (
                    <p className="no-budgets">No budgets set. Create one to start tracking!</p>
                ) : (
                    budgets.map(budget => (
                        <div key={budget._id} className="budget-card">
                            <div className="budget-header-card">
                                <h3>{budget.category}</h3>
                                <span className="budget-period">{budget.period}</span>
                            </div>

                            <div className="budget-amounts">
                                <div className="amount-item">
                                    <span className="label">Budget:</span>
                                    <span className="value">₹{budget.amount}</span>
                                </div>
                                <div className="amount-item">
                                    <span className="label">Spent:</span>
                                    <span className="value">₹{budget.spent.toFixed(2)}</span>
                                </div>
                                <div className="amount-item">
                                    <span className="label">Remaining:</span>
                                    <span className="value">₹{budget.remaining.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="budget-progress">
                                <div 
                                    className="progress-bar" 
                                    style={{ 
                                        width: `${Math.min(budget.percentage, 100)}%`,
                                        backgroundColor: getStatusColor(budget.status)
                                    }}
                                >
                                    <span className="progress-text">{budget.percentage}%</span>
                                </div>
                            </div>

                            <div className="budget-status" style={{ color: getStatusColor(budget.status) }}>
                                {budget.status === 'exceeded' && '⚠️ Budget Exceeded!'}
                                {budget.status === 'warning' && '⚠️ Near Budget Limit'}
                                {budget.status === 'safe' && '✅ Within Budget'}
                            </div>

                            <button 
                                className="delete-budget-btn"
                                onClick={() => handleDelete(budget._id)}
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BudgetManager;

import React, { useState, useEffect } from 'react';
import { addExpense, updateExpense } from '../api/expenseApi';
import { toast } from 'react-toastify';
import '../styles/TransactionForm.css';

const TransactionForm = ({ editTransaction, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: 'Food',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
    });

    const categories = [
        'Food', 'Transport', 'Entertainment', 
        'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'
    ];

    useEffect(() => {
        if (editTransaction) {
            setFormData({
                amount: editTransaction.amount,
                description: editTransaction.description,
                category: editTransaction.category,
                type: editTransaction.type,
                date: new Date(editTransaction.date).toISOString().split('T')[0]
            });
        }
    }, [editTransaction]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let response;
            if (editTransaction) {
                response = await updateExpense(editTransaction._id, formData);
            } else {
                response = await addExpense(formData);
            }

            if (response.data.success) {
                toast.success(response.data.message);
                setFormData({
                    amount: '',
                    description: '',
                    category: 'Food',
                    type: 'expense',
                    date: new Date().toISOString().split('T')[0]
                });
                onSuccess();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save transaction');
        }
    };

    return (
        <div className="transaction-form">
            <h3>{editTransaction ? '✏️ Edit Transaction' : '➕ Add Transaction'}</h3>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Type</label>
                    <div className="type-selector">
                        <button
                            type="button"
                            className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                            onClick={() => setFormData({ ...formData, type: 'income' })}
                        >
                            💰 Income
                        </button>
                        <button
                            type="button"
                            className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                            onClick={() => setFormData({ ...formData, type: 'expense' })}
                        >
                            💸 Expense
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Amount (₹)</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        min="1"
                        step="0.01"
                        placeholder="Enter amount"
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Grocery shopping"
                    />
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn">
                        {editTransaction ? 'Update' : 'Add'} Transaction
                    </button>
                    {editTransaction && (
                        <button type="button" className="cancel-btn" onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;

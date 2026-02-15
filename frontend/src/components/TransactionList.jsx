import React, { useState, useEffect } from 'react';
import { getExpenses, deleteExpense } from '../api/expenseApi';
import FilterPanel from './FilterPanel';
import { toast } from 'react-toastify';
import '../styles/TransactionList.css';

const TransactionList = ({ onEdit, refreshTrigger }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        fetchTransactions();
    }, [filters, refreshTrigger]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await getExpenses(filters);
            if (response.data.success) {
                setTransactions(response.data.data);
            }
        } catch (error) {
            console.error('Fetch transactions error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this transaction?')) {
            try {
                const response = await deleteExpense(id);
                if (response.data.success) {
                    toast.success('Transaction deleted!');
                    fetchTransactions();
                }
            } catch (error) {
                toast.error('Failed to delete transaction');
            }
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const getCategoryIcon = (category) => {
        const icons = {
            Food: '🍔',
            Transport: '🚗',
            Entertainment: '🎬',
            Shopping: '🛍️',
            Bills: '📄',
            Healthcare: '🏥',
            Education: '📚',
            Income: '💰',
            Other: '📦'
        };
        return icons[category] || '📦';
    };

    return (
        <div className="transaction-list-container">
            <FilterPanel onFilterChange={handleFilterChange} />

            <div className="transactions-section">
                <div className="transactions-header">
                    <h3>📋 Transactions ({transactions.length})</h3>
                </div>

                {loading ? (
                    <div className="loading">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                    <div className="no-transactions">
                        <p>No transactions found</p>
                        <p className="hint">Try adjusting your filters or add a new transaction</p>
                    </div>
                ) : (
                    <div className="transactions-list">
                        {transactions.map((transaction) => (
                            <div 
                                key={transaction._id} 
                                className={`transaction-item ${transaction.type}`}
                            >
                                <div className="transaction-icon">
                                    {getCategoryIcon(transaction.category)}
                                </div>
                                
                                <div className="transaction-details">
                                    <div className="transaction-title">
                                        <span className="description">{transaction.description}</span>
                                        <span className="category-badge">{transaction.category}</span>
                                    </div>
                                    <div className="transaction-date">
                                        {new Date(transaction.date).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div className="transaction-amount">
                                    <span className={transaction.type}>
                                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                                    </span>
                                </div>

                                <div className="transaction-actions">
                                    <button 
                                        className="edit-btn"
                                        onClick={() => onEdit(transaction)}
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDelete(transaction._id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionList;

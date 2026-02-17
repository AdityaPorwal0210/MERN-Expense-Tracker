import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import BudgetManager from '../components/BudgetManager';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [editTransaction, setEditTransaction] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  // SCROLL TO TOP ON MOUNT
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  const handleEdit = (transaction) => {
    setEditTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuccess = () => {
    setEditTransaction(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setEditTransaction(null);
  };

  const userName = localStorage.getItem('loggedInUser') || 'User';

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>💰 Expense Tracker</h1>
          <div className="user-section">
            <span className="user-name">Hello, {userName}!</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => setActiveTab('transactions')}
        >
          📋 Transactions
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button
          className={activeTab === 'budgets' ? 'active' : ''}
          onClick={() => setActiveTab('budgets')}
        >
          💰 Budgets
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'transactions' && (
          <>
            <TransactionForm
              editTransaction={editTransaction}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
            <TransactionList
              onEdit={handleEdit}
              refreshTrigger={refreshTrigger}
            />
          </>
        )}
        
        {activeTab === 'analytics' && <AnalyticsDashboard refreshTrigger={refreshTrigger} />}
        
        {activeTab === 'budgets' && <BudgetManager />}
      </main>
    </div>
  );
};

export default Dashboard;

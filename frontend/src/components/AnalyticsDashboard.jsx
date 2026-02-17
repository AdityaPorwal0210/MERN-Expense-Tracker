import React, { useState, useEffect } from 'react';
import { getExpenseStats } from '../api/expenseApi';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/AnalyticsDashboard.css';

const AnalyticsDashboard = ({ refreshTrigger }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

  useEffect(() => {
    console.log('Analytics refreshing... Trigger:', refreshTrigger);
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching expense stats...');
      const response = await getExpenseStats();
      console.log('Stats response:', response.data);
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
      setError('Error loading analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading">
          <h3>Loading analytics...</h3>
          <p>Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard">
        <div className="error-message">
          <h3>⚠️ {error}</h3>
          <button onClick={fetchStats} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  if (!stats || !stats.summary || stats.summary.length === 0) {
    return (
      <div className="analytics-dashboard">
        <div className="no-data">
          <h3>📊 No Data Available</h3>
          <p>Start adding transactions to see your analytics!</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const summaryData = stats.summary.map(item => ({
    name: item._id === 'income' ? 'Income' : 'Expense',
    amount: item.total,
    count: item.count
  }));

  const categoryData = (stats.byCategory || []).map(item => ({
    name: item._id,
    amount: item.total,
    count: item.count
  }));

  // Calculate totals
  const totalIncome = summaryData.find(item => item.name === 'Income')?.amount || 0;
  const totalExpense = summaryData.find(item => item.name === 'Expense')?.amount || 0;
  const balance = totalIncome - totalExpense;

  // Prepare monthly trend data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendData = {};
  
  if (stats.monthlyTrend && stats.monthlyTrend.length > 0) {
    stats.monthlyTrend.forEach(item => {
      const key = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      if (!trendData[key]) {
        trendData[key] = { month: key, income: 0, expense: 0 };
      }
      if (item._id.type === 'income') {
        trendData[key].income = item.total;
      } else {
        trendData[key].expense = item.total;
      }
    });
  }

  const monthlyData = Object.values(trendData).reverse();

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>📊 Analytics Dashboard</h2>
        <button onClick={fetchStats} className="refresh-button" title="Refresh Analytics">
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Income</h3>
            <p className="amount">₹{totalIncome.toFixed(2)}</p>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3>Total Expense</h3>
            <p className="amount">₹{totalExpense.toFixed(2)}</p>
          </div>
        </div>

        <div className={`summary-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="card-icon">{balance >= 0 ? '✅' : '⚠️'}</div>
          <div className="card-content">
            <h3>Balance</h3>
            <p className="amount">₹{balance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Category Pie Chart */}
        <div className="chart-container">
          <h3>Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-chart-data">No expense data available</p>
          )}
        </div>

        {/* Category Bar Chart */}
        <div className="chart-container">
          <h3>Top Spending Categories</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Bar dataKey="amount" fill="#4ECDC4" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-chart-data">No expense data available</p>
          )}
        </div>

        {/* Monthly Trend Line Chart */}
        {monthlyData.length > 0 && (
          <div className="chart-container full-width">
            <h3>Income vs Expense Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#4caf50" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#f44336" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category Table */}
      {categoryData.length > 0 && (
        <div className="category-table">
          <h3>Category Breakdown</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Transactions</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((item, index) => {
                const percentage = totalExpense > 0 ? ((item.amount / totalExpense) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={index}>
                    <td>
                      <span className="category-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      {item.name}
                    </td>
                    <td>₹{item.amount.toFixed(2)}</td>
                    <td>{item.count}</td>
                    <td>{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

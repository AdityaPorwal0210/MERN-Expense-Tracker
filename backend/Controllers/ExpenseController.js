const Expense = require('../Models/Expense');

// Get all expenses with advanced filtering
const getExpenses = async (req, res) => {
    try {
        const userId = req.user._id;
        const { 
            category, 
            type, 
            startDate, 
            endDate, 
            minAmount, 
            maxAmount, 
            search,
            sortBy = 'date',
            sortOrder = 'desc'
        } = req.query;

        let filter = { userId };

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (type && type !== 'all') {
            filter.type = type;
        }

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) {
                filter.date.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.date.$lte = new Date(endDate);
            }
        }

        if (minAmount || maxAmount) {
            filter.amount = {};
            if (minAmount) {
                filter.amount.$gte = parseFloat(minAmount);
            }
            if (maxAmount) {
                filter.amount.$lte = parseFloat(maxAmount);
            }
        }

        if (search) {
            filter.description = { $regex: search, $options: 'i' };
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const expenses = await Expense.find(filter).sort(sortOptions);

        res.status(200).json({
            success: true,
            data: expenses
        });
    } catch (err) {
        console.error("Get expenses error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch expenses"
        });
    }
};

// Get expense statistics
// Get expense statistics
const getExpenseStats = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    let userId = req.user._id;
    
    // Ensure userId is ObjectId
    if (typeof userId === 'string') {
      userId = new mongoose.Types.ObjectId(userId);
    }
    
    console.log('=== STATS DEBUG ===');
    console.log('User ID:', userId);
    console.log('User ID Type:', typeof userId);

    // First verify user has transactions
    const allExpenses = await Expense.find({ userId: userId });
    console.log('Total transactions found:', allExpenses.length);
    
    if (allExpenses.length > 0) {
      console.log('Sample transaction:', allExpenses[0]);
    }

    // Get summary stats (income vs expense)
    const stats = await Expense.aggregate([
      { 
        $match: { 
          userId: userId
        } 
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('Summary stats result:', stats);

    // Get category breakdown (expenses only)
    const categoryStats = await Expense.aggregate([
      { 
        $match: { 
          userId: userId,
          type: 'expense'
        } 
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    console.log('Category stats result:', categoryStats);

    // Get monthly trend
    const monthlyTrend = await Expense.aggregate([
      { 
        $match: { 
          userId: userId
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    console.log('Monthly trend result:', monthlyTrend);
    console.log('===================');

    res.status(200).json({
      success: true,
      data: {
        summary: stats,
        byCategory: categoryStats,
        monthlyTrend: monthlyTrend
      }
    });
  } catch (err) {
    console.error("Get stats error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: err.message
    });
  }
};




// Add expense
const addExpense = async (req, res) => {
    try {
        const { amount, description, category, type, date } = req.body;
        const userId = req.user._id;

        if (!amount || !description || !category || !type) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const expense = new Expense({
            userId,
            amount,
            description,
            category,
            type,
            date: date || new Date()
        });

        await expense.save();

        res.status(201).json({
            success: true,
            message: "Transaction added successfully",
            data: expense
        });
    } catch (err) {
        console.error("Add expense error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to add transaction"
        });
    }
};

// Update expense
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        const expense = await Expense.findOneAndUpdate(
            { _id: id, userId },
            updates,
            { new: true }
        );

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            data: expense
        });
    } catch (err) {
        console.error("Update expense error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update transaction"
        });
    }
};

// Delete expense
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const expense = await Expense.findOneAndDelete({ _id: id, userId });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction deleted successfully"
        });
    } catch (err) {
        console.error("Delete expense error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete transaction"
        });
    }
};

// Export all functions
module.exports = {
    getExpenses,
    getExpenseStats,
    addExpense,
    updateExpense,
    deleteExpense
};

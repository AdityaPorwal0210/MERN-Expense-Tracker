const Budget = require('../Models/Budget');
const Expense = require('../Models/Expense');

// Get all budgets with spending status
const getBudgets = async (req, res) => {
    try {
        const userId = req.user._id;
        const budgets = await Budget.find({ userId });

        // Calculate spending for each budget
        const budgetsWithSpending = await Promise.all(
            budgets.map(async (budget) => {
                const startDate = new Date();
                if (budget.period === 'monthly') {
                    startDate.setDate(1);
                    startDate.setHours(0, 0, 0, 0);
                } else if (budget.period === 'weekly') {
                    const day = startDate.getDay();
                    startDate.setDate(startDate.getDate() - day);
                    startDate.setHours(0, 0, 0, 0);
                } else if (budget.period === 'yearly') {
                    startDate.setMonth(0, 1);
                    startDate.setHours(0, 0, 0, 0);
                }

                const spent = await Expense.aggregate([
                    {
                        $match: {
                            userId: userId,
                            category: budget.category,
                            type: 'expense',
                            date: { $gte: startDate }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' }
                        }
                    }
                ]);

                const totalSpent = spent.length > 0 ? spent[0].total : 0;
                const percentage = (totalSpent / budget.amount) * 100;
                const remaining = budget.amount - totalSpent;

                return {
                    ...budget.toObject(),
                    spent: totalSpent,
                    remaining: remaining > 0 ? remaining : 0,
                    percentage: percentage.toFixed(2),
                    status: percentage >= 100 ? 'exceeded' : percentage >= budget.alertThreshold ? 'warning' : 'safe'
                };
            })
        );

        res.status(200).json({
            success: true,
            data: budgetsWithSpending
        });
    } catch (err) {
        console.error("Get budgets error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch budgets"
        });
    }
};

// Create budget
const createBudget = async (req, res) => {
    try {
        const { category, amount, period, alertThreshold } = req.body;
        const userId = req.user._id;

        if (!category || !amount) {
            return res.status(400).json({
                success: false,
                message: "Category and amount are required"
            });
        }

        // Check if budget already exists for this category and period
        const existing = await Budget.findOne({ 
            userId, 
            category, 
            period: period || 'monthly' 
        });
        
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Budget already exists for this category"
            });
        }

        const budget = new Budget({
            userId,
            category,
            amount,
            period: period || 'monthly',
            alertThreshold: alertThreshold || 80
        });

        await budget.save();

        res.status(201).json({
            success: true,
            message: "Budget created successfully",
            data: budget
        });
    } catch (err) {
        console.error("Create budget error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to create budget"
        });
    }
};

// Update budget
const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        const budget = await Budget.findOneAndUpdate(
            { _id: id, userId },
            updates,
            { new: true }
        );

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Budget updated successfully",
            data: budget
        });
    } catch (err) {
        console.error("Update budget error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update budget"
        });
    }
};

// Delete budget
const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const budget = await Budget.findOneAndDelete({ _id: id, userId });

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Budget deleted successfully"
        });
    } catch (err) {
        console.error("Delete budget error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete budget"
        });
    }
};

module.exports = {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget
};

const express = require('express');
const router = express.Router();
const {
    getExpenses,
    getExpenseStats,
    addExpense,
    updateExpense,
    deleteExpense
} = require('../Controllers/ExpenseController');

router.get('/', getExpenses);
router.get('/stats', getExpenseStats);
router.post('/', addExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;

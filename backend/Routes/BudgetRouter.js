const express = require('express');
const router = express.Router();
const {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget
} = require('../Controllers/BudgetController');

router.get('/', getBudgets);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;

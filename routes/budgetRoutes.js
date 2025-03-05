import express from 'express';
import { setBudget, getBudgets, updateBudget, deleteBudget, checkSpendingLimit } from '../controllers/budgetController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, setBudget)
    .get(protect, getBudgets);

router.route('/:id')
    .put(protect, updateBudget)
    .delete(protect, deleteBudget);

router.get('/check-spending', protect, checkSpendingLimit);

export default router;

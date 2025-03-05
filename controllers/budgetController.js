import Budget from '../models/Budget.js';

// Set a budget
export const setBudget = async (req, res) => {
    const { category, limit } = req.body;

    try {
        const budget = await Budget.create({
            user: req.user._id,
            category,
            limit,
        });

        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Error setting budget' });
    }
};

// Get all budgets for user
export const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user._id });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching budgets' });
    }
};

// Update a budget
export const updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);

        if (!budget) return res.status(404).json({ message: 'Budget not found' });

        if (budget.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        budget.limit = req.body.limit || budget.limit;
        await budget.save();
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Error updating budget' });
    }
};

// Delete a budget
export const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);

        if (!budget) return res.status(404).json({ message: 'Budget not found' });

        if (budget.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await budget.remove();
        res.json({ message: 'Budget deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting budget' });
    }
};


// Function to check spending limits and send alerts
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';


export const checkSpendingLimit = async (req, res) => {
    try {
        const userId = req.user.id;
        const budgets = await Budget.find({ user: userId });

        if (!budgets.length) {
            return res.status(404).json({ message: 'No budgets set for this user.' });
        }

        let alerts = [];

        for (const budget of budgets) {
            // Fetch total spending for this category
            const totalSpent = await Transaction.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userId), // Ensure ObjectId match
                        category: budget.category,
                        type: 'expense'
                    }
                },
                {
                    $group: {
                        _id: '$category',
                        total: { $sum: '$amount' }
                    }
                }
            ]);

            // Calculate remaining budget
            const spent = totalSpent.length ? totalSpent[0].total : 0;
            const remaining = budget.limit - spent;

            if (remaining <= 0) {
                alerts.push(`⚠️ You have exceeded your budget for ${budget.category}!`);
            } else if (remaining < budget.limit * 0.2) {
                alerts.push(`⚠️ Warning: You are nearing your budget limit for ${budget.category}.`);
            }
        }

        res.status(200).json({ 
            alerts, 
            message: alerts.length ? 'Budget limits exceeded or approaching!' : 'You are within budget.' 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


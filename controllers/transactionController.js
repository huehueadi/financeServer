import Transaction from '../models/Transaction.js';

// Create a new transaction
export const addTransaction = async (req, res) => {
    const { description, amount, type, category } = req.body;
    
    try {
        const transaction = await Transaction.create({
            user: req.user._id,
            description,
            amount,
            type,
            category,
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error creating transaction' });
    }
};

// Get all transactions for logged-in user
export const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

// Update a transaction
export const updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        transaction.description = req.body.description || transaction.description;
        transaction.amount = req.body.amount || transaction.amount;
        transaction.type = req.body.type || transaction.type;
        transaction.category = req.body.category || transaction.category;

        await transaction.save();
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error updating transaction' });
    }
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await transaction.remove();
        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction' });
    }
};

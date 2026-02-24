import { Transaction } from '../types';
import { addTransaction, getTransactions } from './storage';

export const checkAndGenerateRecurringTransactions = () => {
    const transactions = getTransactions();
    const recurringTransactions = transactions.filter((t) => t.isRecurring);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newTransactionsCount = 0;

    recurringTransactions.forEach((transaction) => {
        // Determine the interval. Default to monthly if not specified (backward compatibility)
        const interval = transaction.recurringInterval || 'monthly';
        const lastDate = new Date(transaction.date);
        lastDate.setHours(0, 0, 0, 0);

        let nextDate = new Date(lastDate);

        // Calculate next occurrence based on interval
        switch (interval) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }

        // If the next calculated date is today or in the past, and we haven't already linked a transaction for this date
        // Note: To strictly prevent duplicates, we should check if a transaction with the same description/amount/type exists on the calculated 'nextDate'.
        // A more robust way would be to store 'lastRecurringProcessed' date on the parent transaction, but for now we'll check for existence.

        if (nextDate <= today) {
            const nextDateStr = nextDate.toISOString().split('T')[0];

            // Check if we already have a transaction like this on that date
            const exists = transactions.some(t =>
                t.description === transaction.description &&
                t.amount === transaction.amount &&
                t.type === transaction.type &&
                t.date === nextDateStr
            );

            if (!exists) {
                const newTransaction: Transaction = {
                    ...transaction,
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Unique ID
                    date: nextDateStr,
                    isRecurring: true, // The new one is also recurring, so it propagates? 
                    // Requirement check: Usually the copy should be recurring to keep the chain going, 
                    // OR the original stays as the 'master' and generates copies. 
                    // For simple implementation: The NEW transaction becomes the new seed. 
                    // But we need to be careful not to double count if the old one is still kept as "active recurring".
                    // improved logic: The OLD one is the record of the past. The NEW one is the record of the present.
                    // Both stay "isRecurring: true" so the chain continues from the *latest* one.
                    // However, this means we scan ALL history. OIf user has 5 years of data, we scan 60 salary entries.
                    // Opt: Only scan the *latest* occurrence of a recurring series? 
                    // Current approach: Scan all. If next date > today, skip. If next date <= today and not exists, create.
                    // This handles "catching up" if app wasn't opened for a few months? 
                    // No, simple logic only adds ONE step forward. 
                    // To catch up multiple months, we'd need a while loop.
                    // Let's stick to generating *one* step forward for now to avoid accidental flooding.
                    recurringInterval: interval
                };

                addTransaction(newTransaction);
                newTransactionsCount++;
            }
        }
    });

    if (newTransactionsCount > 0) {
        console.log(`Generated ${newTransactionsCount} recurring transactions.`);
    }
};

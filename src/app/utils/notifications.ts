import { LocalNotifications } from '@capacitor/local-notifications';
import { Budget } from '../types';
import { formatCurrency } from './currency';
import { getUser, getTransactions, getBudgets, getGoals } from './storage';
import { callNvidiaApi } from './ai';
import { calculateFinancialHealthScore, getExpensesByCategory } from './analytics';

export const initializeNotifications = async () => {
    try {
        const permissions = await LocalNotifications.checkPermissions();
        if (permissions.display !== 'granted') {
            await LocalNotifications.requestPermissions();
        }

        // Schedule daily reminder if not already scheduled
        await scheduleDailyReminder();
        
        // Process AI Insights (throttled internally)
        await processAiInsightNotification();
    } catch (error) {
        console.error('Error initializing notifications:', error);
    }
};

export const scheduleDailyReminder = async () => {
    try {
        const pending = await LocalNotifications.getPending();
        const hasDaily = pending.notifications.some(n => n.id === 1001);

        if (!hasDaily) {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: 'Record your expenses',
                        body: 'Don\'t forget to log your transactions for today!',
                        id: 1001,
                        schedule: {
                            on: { hour: 20, minute: 0 }, // 8 PM
                            repeats: true,
                        },
                        actionTypeId: '',
                        extra: null
                    }
                ]
            });
            console.log('Daily reminder scheduled');
        }
    } catch (error) {
        console.error('Error scheduling daily reminder:', error);
    }
};

export const sendBudgetAlert = async (budget: Budget, spent: number) => {
    try {
        const user = getUser();
        const percentage = (spent / budget.limit) * 100;
        // Unique ID based on budget ID to avoid spamming multiple identical alerts? 
        // Or just a random one. Let's use a hash of budget ID + date to show it once per day? 
        // For simplicity, just send it. The user might want to know immediately.
        
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: 'Budget Alert ⚠️',
                    body: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget! (${formatCurrency(spent, user?.currency || 'USD')} / ${formatCurrency(budget.limit, user?.currency || 'USD')})`,
                    id: Math.floor(Math.random() * 100000) + 2000, 
                    schedule: { at: new Date(Date.now() + 1000) }, // 1 second later
                    actionTypeId: '',
                    extra: null
                }
            ]
        });
    } catch (error) {
        console.error('Error sending budget alert:', error);
    }
};

export const processAiInsightNotification = async () => {
    try {
        const NVIDIA_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY;
        if (!NVIDIA_API_KEY) return;

        const lastInsight = localStorage.getItem('last_ai_insight_time');
        const now = Date.now();
        
        // 24 hour throttle (86,400,000 ms)
        if (lastInsight && now - parseInt(lastInsight) < 86400000) {
            console.log('AI Insight already sent today');
            return;
        }

        const transactions = getTransactions();
        if (transactions.length < 5) return; // Not enough data for insight

        const healthScore = calculateFinancialHealthScore();
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
        const categories = getExpensesByCategory(monthTransactions);

        const insight = await callNvidiaApi([
            {
                role: 'system',
                content: `You are Expenzo AI. Analyze the user's financial summary and generate ONE short, highly encouraging, and helpful notification message.
                Max 15 words. Be a supportive coach.
                
                Data Summary:
                - Health Score: ${healthScore.score}/100
                - Spending Categories: ${Object.keys(categories).join(', ')}
                - Total Transactions: ${transactions.length}`
            },
            { role: 'user', content: "Give me an encouraging nudge based on my data." }
        ], { temperature: 0.7, max_tokens: 60 });

        await LocalNotifications.schedule({
            notifications: [
                {
                    title: 'Expenzo AI Insight ✨',
                    body: insight.replace(/"/g, ''), // Remove quotes if LLM added them
                    id: 3001,
                    schedule: { at: new Date(Date.now() + 5000) }, // Send 5s from now
                    actionTypeId: '',
                    extra: null
                }
            ]
        });

        localStorage.setItem('last_ai_insight_time', now.toString());
        console.log('AI Insight notification scheduled');
    } catch (error) {
        console.error('AI Insight Error:', error);
    }
};

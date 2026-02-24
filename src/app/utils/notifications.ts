import { LocalNotifications } from '@capacitor/local-notifications';
import { Budget } from '../types';

export const initializeNotifications = async () => {
    try {
        const permissions = await LocalNotifications.checkPermissions();
        if (permissions.display !== 'granted') {
            await LocalNotifications.requestPermissions();
        }

        // Schedule daily reminder if not already scheduled
        await scheduleDailyReminder();
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
        const percentage = (spent / budget.limit) * 100;
        // Unique ID based on budget ID to avoid spamming multiple identical alerts? 
        // Or just a random one. Let's use a hash of budget ID + date to show it once per day? 
        // For simplicity, just send it. The user might want to know immediately.
        
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: 'Budget Alert ⚠️',
                    body: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget! ($${spent} / $${budget.limit})`,
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

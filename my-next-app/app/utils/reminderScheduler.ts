/* eslint-disable @typescript-eslint/no-explicit-any */

// Simple reminder scheduler service
export class ReminderScheduler {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunning = false;

  // Start the reminder checker (runs every 5 minutes)
  static start() {
    if (this.isRunning) return;

    console.log('Starting reminder scheduler...');
    this.isRunning = true;

    // Check immediately on start
    this.checkReminders();

    // Then check every 5 minutes
    this.intervalId = setInterval(() => {
      this.checkReminders();
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Stop the reminder checker
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Reminder scheduler stopped');
  }

  // Check for reminders that need to be sent
  private static async checkReminders() {
    try {
      console.log('Checking for reminders to send...');
      
      const response = await fetch('/api/reminders/check');
      const data = await response.json();

      if (data.success && data.sentReminders > 0) {
        console.log(`Sent ${data.sentReminders} reminder notifications`);
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  // Check if scheduler is running
  static isSchedulerRunning(): boolean {
    return this.isRunning;
  }
}

// Auto-start the scheduler when the module is loaded (in browser environment)
if (typeof window !== 'undefined') {
  // Only start if user is logged in
  const userId = localStorage.getItem('userId');
  const doctorId = localStorage.getItem('doctorId');
  
  if (userId || doctorId) {
    // Start with a small delay to ensure the app is loaded
    setTimeout(() => {
      ReminderScheduler.start();
    }, 2000);
  }

  // Stop scheduler when page unloads
  window.addEventListener('beforeunload', () => {
    ReminderScheduler.stop();
  });
}
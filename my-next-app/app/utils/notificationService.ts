/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  recipientId: string; // userId or doctorId
  recipientType: 'user' | 'doctor';
  relatedId?: string; // appointmentId or prescriptionId
  relatedType?: 'appointment' | 'prescription';
}

export class NotificationService {
  private static getNotificationKey(recipientId: string, recipientType: 'user' | 'doctor'): string {
    return `notifications:${recipientType}:${recipientId}`;
  }

  static async createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };

    const key = this.getNotificationKey(notification.recipientId, notification.recipientType);
    const existingNotifications = await redis.get(key) as Notification[] || [];
    
    existingNotifications.unshift(newNotification); // Add to beginning
    
    // Keep only the latest 50 notifications per user/doctor
    const limitedNotifications = existingNotifications.slice(0, 50);
    
    await redis.set(key, limitedNotifications);
    
    return newNotification;
  }

  static async getNotifications(recipientId: string, recipientType: 'user' | 'doctor'): Promise<Notification[]> {
    const key = this.getNotificationKey(recipientId, recipientType);
    const notifications = await redis.get(key) as Notification[] || [];
    
    // Sort by timestamp (newest first)
    return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static async markAsRead(recipientId: string, recipientType: 'user' | 'doctor', notificationId: string): Promise<boolean> {
    const key = this.getNotificationKey(recipientId, recipientType);
    const notifications = await redis.get(key) as Notification[] || [];
    
    let found = false;
    const updatedNotifications = notifications.map(notif => {
      if (notif.id === notificationId) {
        found = true;
        return { ...notif, read: true };
      }
      return notif;
    });

    if (found) {
      await redis.set(key, updatedNotifications);
    }
    
    return found;
  }

  static async markAllAsRead(recipientId: string, recipientType: 'user' | 'doctor'): Promise<void> {
    const key = this.getNotificationKey(recipientId, recipientType);
    const notifications = await redis.get(key) as Notification[] || [];
    
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    await redis.set(key, updatedNotifications);
  }

  static async deleteNotification(recipientId: string, recipientType: 'user' | 'doctor', notificationId: string): Promise<boolean> {
    const key = this.getNotificationKey(recipientId, recipientType);
    const notifications = await redis.get(key) as Notification[] || [];
    
    const initialLength = notifications.length;
    const filteredNotifications = notifications.filter(notif => notif.id !== notificationId);
    
    if (filteredNotifications.length !== initialLength) {
      await redis.set(key, filteredNotifications);
      return true;
    }
    
    return false;
  }

  static async getUnreadCount(recipientId: string, recipientType: 'user' | 'doctor'): Promise<number> {
    const notifications = await this.getNotifications(recipientId, recipientType);
    return notifications.filter(notif => !notif.read).length;
  }

  // Specific notification creators for common scenarios
  static async notifyDoctorOfNewAppointment(
    doctorId: string,
    appointment: any
  ): Promise<Notification> {
    return this.createNotification({
      type: 'info',
      title: 'New Appointment Booked',
      message: `${appointment.patientName} has booked an appointment for ${appointment.date} at ${appointment.time}`,
      recipientId: doctorId,
      recipientType: 'doctor',
      relatedId: appointment.id,
      relatedType: 'appointment',
    });
  }

  static async notifyUserOfPrescription(
    userId: string,
    prescription: any,
    doctorName: string
  ): Promise<Notification> {
    const medicationNames = prescription.medications?.map((med: any) => med.name).join(', ') || 'medications';
    
    return this.createNotification({
      type: 'success',
      title: 'New Prescription Available',
      message: `Dr. ${doctorName} has prescribed ${medicationNames} for you. Check your prescriptions for details.`,
      recipientId: userId,
      recipientType: 'user',
      relatedId: prescription.id,
      relatedType: 'prescription',
    });
  }

  static async notifyUserOfAppointmentUpdate(
    userId: string,
    appointment: any,
    updateType: 'confirmed' | 'cancelled' | 'rescheduled'
  ): Promise<Notification> {
    const messages = {
      confirmed: `Your appointment on ${appointment.date} at ${appointment.time} has been confirmed`,
      cancelled: `Your appointment on ${appointment.date} at ${appointment.time} has been cancelled`,
      rescheduled: `Your appointment has been rescheduled to ${appointment.date} at ${appointment.time}`,
    };

    const types: { [key: string]: 'success' | 'warning' | 'info' | 'error' } = {
      confirmed: 'success',
      cancelled: 'error',
      rescheduled: 'warning',
    };

    return this.createNotification({
      type: types[updateType],
      title: 'Appointment Update',
      message: messages[updateType],
      recipientId: userId,
      recipientType: 'user',
      relatedId: appointment.id,
      relatedType: 'appointment',
    });
  }

  static async notifyUserOfAppointmentReminder(
    userId: string,
    appointment: any,
    doctorName: string,
    reminderType: 'doctor_reminder' | 'auto_reminder' = 'auto_reminder'
  ): Promise<Notification> {
    const title = reminderType === 'doctor_reminder' 
      ? 'Appointment Reminder from Doctor' 
      : 'Upcoming Appointment Reminder';
    
    const message = reminderType === 'doctor_reminder'
      ? `Dr. ${doctorName} has sent you a reminder for your appointment on ${appointment.date} at ${appointment.time}`
      : `Don't forget your appointment with Dr. ${doctorName} on ${appointment.date} at ${appointment.time}`;

    return this.createNotification({
      type: 'info',
      title,
      message,
      recipientId: userId,
      recipientType: 'user',
      relatedId: appointment.id,
      relatedType: 'appointment',
    });
  }
}

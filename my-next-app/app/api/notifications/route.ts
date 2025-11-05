/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { NotificationService, Notification } from '@/app/utils/notificationService';

// GET: Fetch notifications for a user or doctor
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const recipientId = searchParams.get('recipientId');
    const recipientType = searchParams.get('recipientType') as 'user' | 'doctor';
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!recipientId || !recipientType) {
      return NextResponse.json({
        success: false,
        message: 'recipientId and recipientType are required'
      }, { status: 400 });
    }

    if (recipientType !== 'user' && recipientType !== 'doctor') {
      return NextResponse.json({
        success: false,
        message: 'recipientType must be either "user" or "doctor"'
      }, { status: 400 });
    }

    let notifications = await NotificationService.getNotifications(recipientId, recipientType);

    if (unreadOnly) {
      notifications = notifications.filter(notif => !notif.read);
    }

    const unreadCount = await NotificationService.getUnreadCount(recipientId, recipientType);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch notifications',
      notifications: []
    }, { status: 500 });
  }
}

// POST: Create a new notification
export async function POST(req: Request) {
  try {
    const notificationData = await req.json();

    const {
      type,
      title,
      message,
      recipientId,
      recipientType,
      relatedId,
      relatedType
    } = notificationData;

    if (!type || !title || !message || !recipientId || !recipientType) {
      return NextResponse.json({
        success: false,
        message: 'type, title, message, recipientId, and recipientType are required'
      }, { status: 400 });
    }

    if (recipientType !== 'user' && recipientType !== 'doctor') {
      return NextResponse.json({
        success: false,
        message: 'recipientType must be either "user" or "doctor"'
      }, { status: 400 });
    }

    const notification = await NotificationService.createNotification({
      type,
      title,
      message,
      recipientId,
      recipientType,
      relatedId,
      relatedType
    });

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      notification
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create notification'
    }, { status: 500 });
  }
}

// PATCH: Mark notification(s) as read
export async function PATCH(req: Request) {
  try {
    const updates = await req.json();
    const { recipientId, recipientType, notificationId, markAllAsRead } = updates;

    if (!recipientId || !recipientType) {
      return NextResponse.json({
        success: false,
        message: 'recipientId and recipientType are required'
      }, { status: 400 });
    }

    if (recipientType !== 'user' && recipientType !== 'doctor') {
      return NextResponse.json({
        success: false,
        message: 'recipientType must be either "user" or "doctor"'
      }, { status: 400 });
    }

    if (markAllAsRead) {
      await NotificationService.markAllAsRead(recipientId, recipientType);
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (notificationId) {
      const success = await NotificationService.markAsRead(recipientId, recipientType, notificationId);
      
      if (!success) {
        return NextResponse.json({
          success: false,
          message: 'Notification not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Either notificationId or markAllAsRead must be provided'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update notification'
    }, { status: 500 });
  }
}

// DELETE: Delete a notification
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const recipientId = searchParams.get('recipientId');
    const recipientType = searchParams.get('recipientType') as 'user' | 'doctor';
    const notificationId = searchParams.get('notificationId');

    if (!recipientId || !recipientType || !notificationId) {
      return NextResponse.json({
        success: false,
        message: 'recipientId, recipientType, and notificationId are required'
      }, { status: 400 });
    }

    if (recipientType !== 'user' && recipientType !== 'doctor') {
      return NextResponse.json({
        success: false,
        message: 'recipientType must be either "user" or "doctor"'
      }, { status: 400 });
    }

    const success = await NotificationService.deleteNotification(recipientId, recipientType, notificationId);

    if (!success) {
      return NextResponse.json({
        success: false,
        message: 'Notification not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete notification'
    }, { status: 500 });
  }
}

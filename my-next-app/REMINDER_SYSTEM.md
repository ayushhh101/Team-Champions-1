# Notification and Reminder System

## Overview
The application now includes a comprehensive notification and reminder system that allows:
1. **Users** to set reminders for their appointments
2. **Doctors** to send manual reminders to patients
3. **Automatic reminders** to be sent before appointments

## How the Reminder System Works

### For Users (Patients):

#### Setting Up Reminders:
1. **Navigate to Appointment History**: Go to the "Appointment History" page
2. **Toggle Reminder**: For upcoming appointments, you'll see a bell icon button
   - 🔕 (Bell Off) = Reminder disabled
   - 🔔 (Bell On) = Reminder enabled
3. **Default Timing**: Reminders are set to trigger 30 minutes before the appointment time

#### When You'll Get Notified:
- **Automatic Reminders**: 30 minutes before your appointment (if you enabled reminders)
- **Doctor Reminders**: When your doctor manually sends you a reminder
- **Prescription Notifications**: When your doctor prescribes medications

### For Doctors:

#### Sending Manual Reminders:
1. **Navigate to Appointments**: Go to the "Appointments" page
2. **Find Patient**: Locate the appointment you want to send a reminder for
3. **Send Reminder**: Click the "Send Reminder" button
4. **Confirmation**: The patient will receive a notification immediately

#### When Patients Get Notified:
- **New Appointments**: When a patient books an appointment with you
- **Prescription Creation**: When you create a prescription for a patient

## Technical Details

### Reminder Timing:
- **Default Window**: 30 minutes before appointment
- **Check Frequency**: Every 5 minutes
- **Delivery Window**: 5-minute window around the reminder time
- **Duplicate Prevention**: Only one automatic reminder per appointment per day

### Storage:
- **User Preferences**: Stored in Redis with key pattern `reminders:{userId}`
- **Notification History**: Stored in Redis with key pattern `notifications:{userType}:{userId}`
- **Sent Reminders**: Tracked to prevent duplicates with key pattern `reminder_sent:{appointmentId}:{date}`

### Notification Types:
1. **info** - Appointment reminders and booking confirmations
2. **success** - Prescription notifications and appointment confirmations
3. **warning** - Appointment reschedules
4. **error** - Appointment cancellations

## API Endpoints

### Reminders:
- `GET /api/reminders?userId={userId}` - Get user's reminder settings
- `POST /api/reminders` - Set/update reminder for an appointment
- `PATCH /api/reminders` - Send manual reminder from doctor
- `GET /api/reminders/check` - Check and send automatic reminders (internal)

### Notifications:
- `GET /api/notifications?recipientId={id}&recipientType={user|doctor}` - Get notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications` - Mark notifications as read
- `DELETE /api/notifications` - Delete notification

## Example Usage Scenarios

### Scenario 1: User Sets Reminder
1. User books appointment for 2:00 PM tomorrow
2. User goes to Appointment History and enables reminder
3. At 1:30 PM tomorrow, user receives notification: "Don't forget your appointment with Dr. Smith at 2:00 PM"

### Scenario 2: Doctor Sends Manual Reminder
1. Doctor sees upcoming appointment with patient
2. Doctor clicks "Send Reminder" button
3. Patient immediately receives notification: "Dr. Smith has sent you a reminder for your appointment tomorrow at 2:00 PM"

### Scenario 3: Prescription Notification
1. Doctor writes prescription for patient
2. Patient immediately receives notification: "Dr. Smith has prescribed Amoxicillin for you. Check your prescriptions for details."

## Current Limitations & Future Improvements

### Current Implementation:
- Reminder checking runs every 5 minutes on the client side
- Works when the application is open in browser
- Uses localStorage for user identification

### Production Recommendations:
1. **Server-Side Scheduler**: Implement proper cron job or background service
2. **Push Notifications**: Add browser push notifications or SMS/email
3. **Advanced Scheduling**: Allow custom reminder times (15 min, 1 hour, 1 day before)
4. **Multiple Reminders**: Support multiple reminders per appointment
5. **Timezone Support**: Handle different timezones properly

## Testing the System

### To Test User Reminders:
1. Create an appointment for a future time (at least 35 minutes from now)
2. Enable reminder in Appointment History
3. Wait for 30 minutes before appointment time
4. Check notifications (bell icon) - you should see the reminder

### To Test Doctor Reminders:
1. Login as a doctor
2. Go to Appointments page
3. Find an upcoming appointment
4. Click "Send Reminder"
5. Login as the patient and check notifications

### To Test Prescription Notifications:
1. Doctor creates a prescription
2. Patient checks notifications
3. Should see prescription notification immediately
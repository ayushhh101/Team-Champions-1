import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Appointments',
  description: 'View your appointments and medical history',
};

export default function AppointmentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

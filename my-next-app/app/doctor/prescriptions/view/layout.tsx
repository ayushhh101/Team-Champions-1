import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'View Prescription',
  description: 'View and manage prescription details',
};

export default function ViewPrescriptionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create/Edit Prescription',
  description: 'Create or edit prescription details',
};

export default function PrescriptionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}

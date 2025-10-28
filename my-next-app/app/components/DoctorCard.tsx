// components/DoctorCard.tsx
import React from 'react';
import Image from 'next/image';

interface Doctor {
  id?: string;
  name: string;
  specialty: string;
  degree?: string;
  image: string;
}

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => (
  <div className="flex items-center bg-white p-4 rounded-lg shadow-sm mb-4">
    <Image
      src={doctor.image}
      alt={doctor.name}
      width={60}
      height={60}
      className="rounded-full object-cover mr-4 border border-gray-200"
    />
    <div>
      <h3 className="text-base font-semibold text-gray-800 mb-1">{doctor.name}</h3>
      <p className="text-sm text-gray-600">{doctor.specialty}</p>
      <p className="text-xs text-gray-500">{doctor.degree}</p>
    </div>
  </div>
);

export default DoctorCard;
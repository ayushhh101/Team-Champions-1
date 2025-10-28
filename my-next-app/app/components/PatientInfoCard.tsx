// components/PatientInfoCard.tsx
import React from 'react';

interface Patient {
  id?: string;
  fullName: string;
  age?: number | string;
  weight?: number | string;
  relation?: string;
  problem?: string;
  mobile?: string;
}

interface PatientInfoCardProps {
  patient: Patient;
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ patient }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
    <h3 className="text-base font-semibold text-gray-800 mb-4">{patient.fullName}</h3>

    <div className="grid grid-cols-3 gap-x-2 gap-y-4 text-center mb-4">
      <div>
        <p className="text-xs text-gray-500 mb-1">Age</p>
        <p className="text-sm font-medium text-gray-700">{patient.age}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Weight</p>
        <p className="text-sm font-medium text-gray-700">{patient.weight}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Relation</p>
        <p className="text-sm font-medium text-gray-700">{patient.relation}</p>
      </div>
    </div>

    <div className="mb-4">
      <p className="text-xs text-gray-500 mb-1">Problem</p>
      <p className="text-sm font-medium text-gray-700">{patient.problem}</p>
    </div>

    <div>
      <p className="text-xs text-gray-500 mb-1">Mobile</p>
      <p className="text-sm font-medium text-gray-700">{patient.mobile}</p>
    </div>
  </div>
);

export default PatientInfoCard;
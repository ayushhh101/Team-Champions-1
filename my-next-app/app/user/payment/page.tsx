'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
 

interface PaymentPageProps {
  amount: number;
  email?: string;
}

const cardTypes = ['Visa', 'Mastercard', 'Maestro', 'RuPay', 'Amex', 'Discover'];

export default function PaymentPage({ amount = 950, email }: PaymentPageProps) {
 
  // const userEmail = email;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [cardType, setCardType] = useState(cardTypes[0]);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCVC] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const maskCard = (num: string) =>
    num.replace(/\s/g, '').replace(/.(?=.{4})/g, '*').replace(/(.{4})/g, '$1 ').trim();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setShowConfirmModal(false);
      setShowDone(true);
      setTimeout(() => {
        setShowDone(false);
        router.push('/user/dashboard');
      }, 1200);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white sticky top-0 z-50 shadow-lg">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="ml-3 text-lg sm:text-xl font-bold">Payment</h1>
          </div>
        </div>
      </header>

      {/* Add Payment Method Form */}
      <form
        className={`bg-white rounded-2xl shadow-xl p-7 max-w-md w-full mx-auto mt-8 transition-all duration-700 ${showConfirmModal || showDone ? 'blur-sm pointer-events-none select-none' : ''}`}
        style={{ minWidth: 340 }}
        onSubmit={handleAdd}
      >
        <h2 className="text-2xl font-bold mb-1 text-[#4682A9]">Add payment method</h2>
        <div className="text-[#749BC2] text-sm mb-6">
          Note: Some payment providers issue a temporary authorization charge.
        </div>
        {/* Card Type */}
        <label className="block text-[#749BC2] font-semibold mb-2">Card Type</label>
        <select
          className="w-full px-3 py-2 rounded-lg border-2 border-[#91C8E4] mb-4 text-black bg-white focus:outline-none"
          value={cardType}
          onChange={e => setCardType(e.target.value)}
        >
          {cardTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {/* Card number */}
        <label className="block text-[#749BC2] font-semibold mb-1">Card Number</label>
        <input
          type="text"
          className="w-full text-xl px-4 py-2 border-2 border-[#91C8E4] rounded-lg mb-4 tracking-widest font-mono text-black placeholder-gray-400 focus:outline-none"
          placeholder="1234 5678 9123 4567"
          maxLength={19}
          value={cardNumber}
          onChange={e => setCardNumber(e.target.value.replace(/[^0-9 ]/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19))}
          required
        />
        {/* Expiration + CVC */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-[#749BC2] font-semibold mb-1">Expiration</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border-2 border-[#91C8E4] text-black focus:outline-none placeholder-gray-400"
              placeholder="MM / YY"
              maxLength={7}
              value={expiry}
              onChange={e => setExpiry(e.target.value.replace(/[^0-9/ ]/g, '').slice(0, 7))}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-[#749BC2] font-semibold mb-1">CVC</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-lg border-2 border-[#4682A9] text-black focus:outline-none tracking-widest placeholder-gray-400"
              placeholder="•••"
              maxLength={4}
              value={cvc}
              onChange={e => setCVC(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              required
            />
          </div>
        </div>
        {/* Cardholder */}
        <label className="block text-[#749BC2] font-semibold mb-1">Cardholder Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 rounded-lg border-2 border-[#91C8E4] mb-5 text-black focus:outline-none placeholder-gray-400"
          placeholder="John Johnson"
          value={cardholderName}
          onChange={e => setCardholderName(e.target.value)}
          required
        />
        <div className="flex gap-3 mt-4">
          <button
            type="reset"
            className="border border-[#91C8E4] text-[#4682A9] w-1/2 rounded-lg py-3 font-semibold bg-white hover:bg-[#91C8E4]/10"
            onClick={() => {
              setCardNumber('');
              setExpiry('');
              setCVC('');
              setCardholderName('');
              setCardType(cardTypes[0]);
            }}
          >Clear</button>
          <button
            type="submit"
            className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white w-1/2 rounded-lg py-3 font-semibold hover:from-[#4682A9] hover:to-[#749BC2] flex items-center justify-center gap-2"
          >
            + Add
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 transform transition-all" style={{ minWidth: 340 }}>
            <h2 className="text-2xl font-bold mb-1 text-[#4682A9]">Confirm your payment</h2>
            <div className="text-[#749BC2] mb-5">
              Quickly and secure, free transactions.
            </div>
            <div className="mb-7 border px-5 py-5 rounded-xl bg-[#FFFBDE] border-[#91C8E4]">
              <div className="font-bold mb-2 text-[#4682A9]">Details</div>
              <div className="flex justify-between py-1 text-base text-black"><span>Date</span><span>{new Date().toLocaleDateString()}</span></div>
              <div className="flex justify-between py-1 text-base text-black"><span>Payment method</span><span>{cardType}</span></div>
              <div className="flex justify-between py-1 text-base text-black"><span>Card number</span><span>{maskCard(cardNumber) || '**** **** **** 0000'}</span></div>
              <div className="flex justify-between py-1 text-base text-black"><span>Cardholder name</span><span>{cardholderName || '------'}</span></div>
              {/* <div className="flex justify-between py-1 text-base text-black"><span>Email</span><span>{userEmail}</span></div> */}
              <hr className="my-2"/>
              <div className="flex justify-between text-lg mt-2 font-bold text-[#4682A9]"><span>Total amount</span><span>₹{amount}</span></div>
            </div>
            <div className="flex gap-4 mt-2">
              <button
                className="border border-[#91C8E4] text-[#4682A9] w-1/2 rounded-lg py-3 font-semibold bg-white hover:bg-[#91C8E4]/10"
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
              >Cancel Payment</button>
              <button
                className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white w-1/2 rounded-lg py-3 font-semibold hover:from-[#4682A9] hover:to-[#749BC2] transition-colors"
                onClick={handleConfirm}
                disabled={saving}
              >{saving ? 'Processing...' : 'Confirm Payment'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Done Animation */}
      {showDone && (
        <div className="fixed inset-0 bg-white/95 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-5">
            <div className="bg-green-100 p-6 rounded-full shadow">
              <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 12l3 3 5-5" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-green-700">Done</div>
          </div>
        </div>
      )}
    </div>
  );
}

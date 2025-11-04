/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { doctors } from '../../../data/data.json';
import Image from 'next/image';

interface Message {
  id: string;
  text: string;
  sender: 'doctor' | 'patient';
  timestamp: string;
}

interface PatientDetails {
  appointmentId: string;
  fullName: string;
  age: number;
  gender: string;
  mobileNumber: string;
  weight: number;
  problem: string;
  relationship: string;
  addedAt: string;
}

const ChatPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [doctor, setDoctor] = useState<any | null>(null);
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);

    try {
      // Find doctor
      const foundDoctor = (doctors as any[]).find((d) => d.id === id) || (doctors as any[])[0] || null;
      setDoctor(foundDoctor);

      // Get patient data from localStorage (passed from add-patient page)
      const patientData = localStorage.getItem(`patient_data_${id}`);
      
      if (patientData) {
        // Use the dynamic patient data from add-patient page
        const parsedPatientData: PatientDetails = JSON.parse(patientData);
        setPatient(parsedPatientData);
      } else {
        // Fallback if no data found
        console.warn('No patient data found in localStorage');
        setPatient(null);
      }

      // Load messages from localStorage or use empty array
      const storedMessages = localStorage.getItem(`chat_messages_${id}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        // Add initial messages with current timestamps
        const currentTime = new Date();
        const initialMessages: Message[] = [
          {
            id: '1',
            text: "Hello! I'm Dr. " + foundDoctor.name + ". Thank you for sharing your details. How can I help you today?",
            sender: 'doctor',
            timestamp: new Date(currentTime.getTime() - 300000).toISOString() // 5 minutes ago
          },
          {
            id: '2',
            text: "I've reviewed the information you provided. Let me know if you have any specific concerns or questions about your condition.",
            sender: 'doctor',
            timestamp: new Date(currentTime.getTime() - 240000).toISOString() // 4 minutes ago
          }
        ];
        setMessages(initialMessages);
        localStorage.setItem(`chat_messages_${id}`, JSON.stringify(initialMessages));
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const sendMessage = () => {
    if (!newMessage.trim() || !id) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'patient',
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    setNewMessage('');

    // Save to localStorage
    localStorage.setItem(`chat_messages_${id}`, JSON.stringify(updatedMessages));

    // Simulate doctor reply after 2 seconds
    setTimeout(() => {
      const doctorReply: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message. I'll review this and get back to you shortly.",
        sender: 'doctor',
        timestamp: new Date().toISOString()
      };
      const withReply = [...updatedMessages, doctorReply];
      setMessages(withReply);
      localStorage.setItem(`chat_messages_${id}`, JSON.stringify(withReply));
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getDoctorImage = (doctorName: string) => {
    // Map doctor names to image files in public folder
    const imageMap: { [key: string]: string } = {
      'Dr. Priya Malhotra': '/Dr.PriyaMalhotra.png',
      'Dr. Vikram Rao': '/Dr. Vikram Rao.png',
      'Dr. Sameer Kapoor': '/Dr.SameerKapoor.png',
      'Dr. Rajesh Kumar': '/Dr.RajeshKumar.png',
      'Dr. Sunita Sharma': '/Dr.SunitaSharma.png',
      'Dr. Amit Patel': '/Dr.AmitPatel.png',
      'Dr. Meera Joshi': '/Dr.MeeraJoshi.png',
      'Dr. Vikash Singh': '/Dr.VikashSingh.png',
      'Dr. Kavita Desai': '/Kavita Desai.png'
    };
    
    return imageMap[doctorName] || doctor?.image || '/file.svg'; // fallback image
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">Doctor not found</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.back()} 
              className="flex items-center justify-center w-8 h-8 text-gray-600"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-black">Patient Chat</h1>
              <p className="text-xs text-gray-500">{new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Doctor Information */}
        <div className="bg-white mx-4 mt-3 rounded-lg shadow-sm border border-gray-200">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                <Image 
                  src={getDoctorImage(doctor.name)}
                  alt={`Dr. ${doctor.name}`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-semibold text-black">{doctor.name}</h2>
                <p className="text-xs text-gray-500">{doctor.qualification || 'MBBS, MD'}</p>
                <p className="text-[#4FC3F7] font-semibold text-sm">{doctor.speciality} - {doctor.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Details Card - Dynamic Data */}
        {patient && (
          <div className="bg-white mx-4 mt-3 rounded-lg shadow-sm border border-gray-200">
            <div className="p-4">
              <h3 className="font-medium text-black mb-3">Full name</h3>
              <p className="font-semibold text-black text-lg mb-4">{patient.fullName}</p>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold text-black">{patient.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-semibold text-black">{patient.weight} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Relation</p>
                  <p className="font-semibold text-black">{patient.relationship}</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm text-gray-600 mb-1">Gender</h3>
                <p className="font-semibold text-black">{patient.gender}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm text-gray-600 mb-1">Problem</h3>
                <p className="font-semibold text-black">{patient.problem}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-600 mb-1">Mobile</h3>
                <p className="font-semibold text-black">{patient.mobileNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Show message if no patient data found */}
        {!patient && (
          <div className="bg-yellow-50 mx-4 mt-3 rounded-lg shadow-sm border border-yellow-200">
            <div className="p-4 text-center">
              <p className="text-yellow-700 text-sm">
                Patient information not found. Please go back and add patient details first.
              </p>
            </div>
          </div>
        )}

        {/* Session Start Indicator */}
        <div className="text-center my-6">
          <div className="inline-flex items-center justify-center w-full">
            <hr className="w-full h-px bg-gray-300 border-0" />
            <span className="absolute px-3 font-medium text-black bg-gray-50 text-sm">
              Session Start
            </span>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="px-4 pb-20 space-y-1">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col mb-4">
              <div className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'patient' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap text-black">{message.text}</p>
                </div>
              </div>
              <div className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'} mt-1`}>
                <span className="text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Chat Input - Bottom Fixed */}
      <div className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 px-4 py-3">
        <div className="flex items-center space-x-3">
          {/* Plus Button for more options */}
          <button className="flex items-center justify-center w-10 h-10 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          {/* Message Input */}
          <div className="flex-1">
            <input 
              ref={inputRef}
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..." 
              className="w-full p-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-black"
            />
          </div>
          
          {/* Send Button */}
          <button 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add padding to main content to account for fixed input */}
      <style jsx global>{`
        main {
          padding-bottom: 80px;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
// components/ChatBubble.tsx
import React from 'react';
import Image from 'next/image';

interface Message {
  sender: 'patient' | 'doctor' | string;
  text: string;
  timestamp?: string;
}

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isSender = message.sender === 'patient'; // Assuming patient is the one on the right in the image

  return (
    <div
      className={`flex items-end max-w-[85%] relative ${
        isSender ? 'ml-auto justify-end' : 'mr-auto justify-start'
      }`}
    >
      {!isSender && ( // Doctor's avatar on the left
        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-gray-300 mr-2 shrink-0">
          <Image src="/doctor-avatar.png" alt="Doctor Avatar" width={24} height={24} />
        </div>
      )}

      <div
        className={`p-3 rounded-xl text-sm leading-tight shadow-sm max-w-full whitespace-pre-wrap wrap-break-word ${
          isSender
            ? 'bg-blue-500 text-white rounded-br-none' // Blue for sender, flat bottom-right
            : 'bg-white text-gray-800 rounded-bl-none' // White for receiver, flat bottom-left
        }`}
      >
        <p>{message.text}</p>
        <span
          className={`block text-right mt-1 text-xs ${
            isSender ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {message.timestamp}
        </span>
      </div>

      {isSender && ( // Patient's avatar on the right
        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-gray-300 ml-2 shrink-0">
          <Image src="/patient-avatar.png" alt="Patient Avatar" width={24} height={24} />
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
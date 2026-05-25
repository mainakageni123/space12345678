import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';

const CustomerMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAdminToken = () => sessionStorage.getItem('admin_token') || localStorage.getItem('adminToken') || localStorage.getItem('admin_token');

  const loadMessages = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_BASE_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else {
        // fallback to localStorage
        const stored = JSON.parse(localStorage.getItem('customerMessages') || '[]');
        setMessages(stored);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      const stored = JSON.parse(localStorage.getItem('customerMessages') || '[]');
      setMessages(stored);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load of messages
    loadMessages();
    console.log('CustomerMessages component mounted');

    // Set up event listener for new messages
    const handleNewMessage = (event) => {
      console.log('New message event received:', event);
      loadMessages();
    };

    // Add event listener
    window.addEventListener('newCustomerMessage', handleNewMessage);
    console.log('Event listener attached for newCustomerMessage');

    // Cleanup
    return () => {
      window.removeEventListener('newCustomerMessage', handleNewMessage);
      console.log('Event listener removed');
    };
  }, []);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const deleteMessage = async (id) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_BASE_URL}/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m._id !== id));
      }
    } catch (e) {
      console.error('Failed to delete message', e);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Registration Messages</h2>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-gray-500">No new messages</p>
          ) : (
            messages.map((message, index) => (
              <div key={message._id || message.timestamp} className="border-l-4 border-blue-500 bg-blue-50 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {message.firstName} {message.lastName}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(message.createdAt || message.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMessage(message._id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>Phone: {message.phoneNumber}</p>
                    <p>Email: {message.email}</p>
                    <p>License Number: {message.licenseNumber}</p>
                    <p>ID Type: {message.idType}</p>
                    <p>ID Number: {message.idNumber}</p>
                    <p>Address: {message.residentialAddress}</p>
                    <p>Next of Kin: {message.nextOfKin} ({message.nextOfKinPhone})</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerMessages;
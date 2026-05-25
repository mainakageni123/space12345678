import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormFields from './FormFields';
import FormButtons from './FormButtons';
import { API_BASE_URL } from '../../../config/api';

const AdminAuthModal = ({ onAuthenticate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Enforce login per visit: clear any persisted tokens and only allow session tokens
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      verifyToken(token);
    }
    // Clear token when tab closes or navigates away
    const handler = () => {
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_info');
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        onAuthenticate(true);
      } else {
        localStorage.removeItem('admin_token');
      }
    } catch (err) {
      localStorage.removeItem('admin_token');
      console.error('Token verification error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate input
    if (!username || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { username });
      console.log('API URL:', `${API_BASE_URL}/admin/login`);
      
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        // Store token only for this tab/session
        sessionStorage.setItem('admin_token', data.token);
        sessionStorage.setItem('admin_info', JSON.stringify(data.admin));
        onAuthenticate(true);
        setError('');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred while logging in. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-cosmic-depth mb-2">
            Admin Authentication Required
          </h2>
          <p className="text-text-refined">
            Please enter your admin credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <FormFields
            username={username}
            password={password}
            setUsername={setUsername}
            setPassword={setPassword}
          />

          <FormButtons
            loading={loading}
            onCancel={() => navigate('/')}
          />
        </form>
      </div>
    </div>
  );
};

export default AdminAuthModal;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Lock, Mail } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('manager@raahicafe.com');
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Phase 0 stub: Navigate to POS directly
    navigate('/pos');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-badge" style={{ margin: '0 auto' }}>
            <Coffee size={24} />
          </div>
          <h2>Raahi Café</h2>
          <p>Sign in to your staff operations portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Staff Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Sign In to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

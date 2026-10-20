import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Login() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const { login } = useAuth();
    const navigate  = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email || !password) { setError('Please enter both email and password.'); return; }
        try {
            setLoading(true);
            setError('');
            const user = await login(email, password);
            navigate(user.role === 'student' ? '/student' : '/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="hh-login-bg">
            <div className="hh-login-card">
                {/* Logo / Brand */}
                <div className="hh-login-logo">
                    <div className="brand-icon">
                        <i className="bi bi-building" />
                    </div>
                    <h2>HostelHub</h2>
                    <p>Sign in to your portal</p>
                </div>

                {error && (
                    <div className="hh-alert-danger mb-3">
                        <i className="bi bi-exclamation-circle me-2" />{error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="hh-form-label">Email or Enrollment Number</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                                <i className="bi bi-envelope text-muted" />
                            </span>
                            <input
                                type="text"
                                autoComplete="username"
                                className="form-control border-start-0 ps-0"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Email or enrollment number"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="hh-form-label">Password</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                                <i className="bi bi-lock text-muted" />
                            </span>
                            <input
                                type="password"
                                className="form-control border-start-0 ps-0"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 fw-bold"
                        disabled={loading}
                    >
                        {loading ? (
                            <><span className="spinner-border spinner-border-sm me-2" />Signing in…</>
                        ) : (
                            <><i className="bi bi-box-arrow-in-right me-2" />Sign In</>
                        )}
                    </button>
                </form>

                <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: '0.78rem' }}>
                    Admins log in to manage hostel operations.<br />
                    Students log in to access their services.
                </p>
            </div>
        </div>
    );
}

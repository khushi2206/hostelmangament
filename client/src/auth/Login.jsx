import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        try {
            setLoading(true);
            setError('');
            const loggedInUser = await login(email, password);
            navigate(loggedInUser.role === 'student' ? '/student' : '/admin');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
            <div className="card border-0 shadow-sm page-card" style={{ maxWidth: '420px', width: '100%' }}>
                <div className="card-body p-4">
                    <div className="text-center mb-4">
                        <h3 className="brand mb-1">HostelHub</h3>
                        <p className="text-muted small">Admin, warden, and student sign in</p>
                    </div>

                    {error && <div className="alert alert-danger small mb-3">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@hostelhub.com"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-2 mt-2" disabled={loading}>
                            {loading ? (
                                <span>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Signing in...
                                </span>
                            ) : (
                                <span><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

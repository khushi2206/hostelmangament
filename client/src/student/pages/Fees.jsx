import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../components/StatusBadge';

export default function Fees() {
    const [fees,  setFees]  = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        axiosClient.get('/student/fees')
            .then(r => setFees(r.data))
            .catch(e => setError(e.response?.data?.message || 'Failed to load.'));
    }, []);

    const total   = fees.reduce((s, f) => s + Number(f.amount || 0), 0);
    const paid    = fees.reduce((s, f) => s + Number(f.paid_amount || 0), 0);
    const due     = fees.reduce((s, f) => s + Number(f.remaining_amount || 0), 0);

    return (
        <>
            <div className="hh-page-title">Fee Records</div>
            <div className="hh-page-sub">View your fee payment history and outstanding balance.</div>

            {error && <div className="hh-alert-danger mb-3">{error}</div>}

            {fees.length > 0 && (
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="hh-stat"><div className="hh-stat-icon teal"><i className="bi bi-cash-coin"/></div>
                            <div><div className="hh-stat-label">Total Fees</div><div className="hh-stat-val">₹{total.toLocaleString()}</div></div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="hh-stat"><div className="hh-stat-icon" style={{background:'#dcfce7',color:'#15803d'}}><i className="bi bi-check-circle"/></div>
                            <div><div className="hh-stat-label">Paid</div><div className="hh-stat-val">₹{paid.toLocaleString()}</div></div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="hh-stat"><div className="hh-stat-icon rose"><i className="bi bi-exclamation-circle"/></div>
                            <div><div className="hh-stat-label">Remaining</div><div className="hh-stat-val">₹{due.toLocaleString()}</div></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="hh-card">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-receipt me-2" />Payment Details</span>
                </div>
                <div className="table-responsive">
                    <table className="hh-table">
                        <thead>
                            <tr><th>Total Amount</th><th>Paid</th><th>Remaining</th><th>Payment Date</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {fees.length === 0
                                ? <tr><td colSpan="5" className="text-center text-muted py-4">No fee records found.</td></tr>
                                : fees.map(f => (
                                    <tr key={f.fee_id}>
                                        <td className="fw-semibold">₹{Number(f.amount).toLocaleString()}</td>
                                        <td className="text-success fw-semibold">₹{Number(f.paid_amount).toLocaleString()}</td>
                                        <td className="text-danger fw-bold">₹{Number(f.remaining_amount).toLocaleString()}</td>
                                        <td>{f.payment_date ? new Date(f.payment_date).toLocaleDateString() : '—'}</td>
                                        <td><StatusBadge status={f.status} /></td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

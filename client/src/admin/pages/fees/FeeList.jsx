import React from 'react';
import { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import FeeCard from '../../components/FeeCard';

export default function FeeList() {
    const [fees, setFees] = useState([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadFees() {
        try {
            setLoading(true);
            setError('');
            const response = await axiosClient.get('/admin/fees');
            setFees(response.data.fees || []);
        } catch (requestError) {
            console.error(requestError);
            setError('Failed to load fee records.');
        } finally { setLoading(false); }
    }

    useEffect(() => { loadFees(); }, []);

    const filteredFees = fees.filter(fee => {
        const text = (fee.student_name + ' ' + (fee.enrollment_no || '') + ' ' + (fee.room_number || '')).toLowerCase();
        return (!search || text.includes(search.toLowerCase())) && (!status || fee.fee_status === status);
    });
    const paidCount = filteredFees.filter(fee => fee.fee_status === 'Paid').length;
    const partialCount = filteredFees.filter(fee => fee.fee_status === 'Partial').length;
    const dueCount = filteredFees.filter(fee => fee.fee_status === 'Due').length;

    return <section>
        <h2>Fees</h2><p className="text-muted">Manage student fee records and payment status.</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row g-3 mb-4"><div className="col-md-3"><div className="card border-0 shadow-sm page-card"><div className="card-body"><div className="small text-muted">Total Fee Records</div><h4 className="mb-0">{filteredFees.length}</h4></div></div></div><div className="col-md-3"><div className="card border-0 shadow-sm page-card"><div className="card-body"><div className="small text-muted">Paid</div><h4 className="mb-0">{paidCount}</h4></div></div></div><div className="col-md-3"><div className="card border-0 shadow-sm page-card"><div className="card-body"><div className="small text-muted">Partial</div><h4 className="mb-0">{partialCount}</h4></div></div></div><div className="col-md-3"><div className="card border-0 shadow-sm page-card"><div className="card-body"><div className="small text-muted">Due</div><h4 className="mb-0">{dueCount}</h4></div></div></div></div>
        <div className="card border-0 shadow-sm page-card mb-4"><div className="card-body"><div className="row g-2"><div className="col-md-8"><input value={search} onChange={event => setSearch(event.target.value)} className="form-control" placeholder="Search by student name or enrollment number" /></div><div className="col-md-4"><select value={status} onChange={event => setStatus(event.target.value)} className="form-select"><option value="">All Status</option><option>Paid</option><option>Partial</option><option>Due</option></select></div></div></div></div>
        {loading && <div className="alert alert-info">Loading fees...</div>}
        {!loading && !error && filteredFees.length === 0 && <div className="alert alert-light border">No fee records found.</div>}
        {!loading && filteredFees.map(fee => <FeeCard key={fee.fee_id} fee={fee} expanded={expandedId === fee.fee_id} onView={id => setExpandedId(expandedId === id ? null : id)} />)}
    </section>;
}

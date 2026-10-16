import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

const Fees = () => {
  const [fees, setFees] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/student/fees').then(res => setFees(res.data)).catch(console.error);
  }, []);

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
      <h2>Fee Records</h2>
      <table style={{width:'100%', textAlign:'left', marginTop:'1.5rem', borderCollapse:'collapse'}}>
        <thead>
          <tr style={{borderBottom:'2px solid var(--border-color)'}}>
            <th style={{padding:'1rem'}}>Total Amount</th>
            <th style={{padding:'1rem'}}>Paid Amount</th>
            <th style={{padding:'1rem'}}>Remaining</th>
            <th style={{padding:'1rem'}}>Payment Date</th>
            <th style={{padding:'1rem'}}>Status</th>
          </tr>
        </thead>
        <tbody>
          {fees.length === 0 && (
            <tr><td colSpan={5} style={{padding:'1rem', color:'var(--text-light)'}}>No fee records found.</td></tr>
          )}
          {fees.map((f) => (
            <tr key={f.fee_id} style={{borderBottom:'1px solid var(--border-color)'}}>
              <td style={{padding:'1rem'}}>₹{f.amount}</td>
              <td style={{padding:'1rem'}}>₹{f.paid_amount}</td>
              <td style={{padding:'1rem'}}>₹{f.remaining_amount}</td>
              <td style={{padding:'1rem'}}>{f.payment_date ? new Date(f.payment_date).toLocaleDateString() : '-'}</td>
              <td style={{padding:'1rem'}}><StatusBadge status={f.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Fees;

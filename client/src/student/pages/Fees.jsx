import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

const Fees = () => {
  const [fees, setFees] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5001/api/student/fees').then(res => setFees(res.data)).catch(console.error);
  }, []);

  return (
    <div className="container-fluid py-2">
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-4">Fee Records</h3>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Remaining</th>
                <th>Payment Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.fee_id}>
                  <td className="fw-semibold">Rs. {f.amount}</td>
                  <td className="text-success fw-semibold">Rs. {f.paid_amount}</td>
                  <td className="text-danger fw-bold">Rs. {f.remaining_amount}</td>
                  <td>{f.payment_date ? new Date(f.payment_date).toLocaleDateString() : '-'}</td>
                  <td><StatusBadge status={f.status} /></td>
                </tr>
              ))}
              {fees.length === 0 && <tr><td colSpan="5" className="text-center text-muted py-4">No fee records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Fees;




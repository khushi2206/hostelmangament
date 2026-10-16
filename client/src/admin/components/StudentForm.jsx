import React, { useState } from 'react';

const emptyStudent = {
    name: '',
    enrollment_no: '',
    email: '',
    password: '',
    phone: '',
    course: '',
    semester: '',
    department: '',
    dob: '',
    address: '',
    emergency_contact: ''
};

export default function StudentForm({ initialStudent = emptyStudent, editing = false, onSubmit }) {
    const [form, setForm] = useState({ ...emptyStudent, ...initialStudent, password: '' });
    const [error, setError] = useState('');

    function change(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    function validate() {
        if (!form.name || !form.name.trim()) return 'Name is required.';
        if (form.name.trim().length < 2) return 'Name must be at least 2 characters long.';
        if (!/^[A-Za-z\s.'-]+$/.test(form.name.trim())) return 'Name can only contain letters, spaces, dots, and hyphens.';

        if (!form.enrollment_no || !form.enrollment_no.trim()) return 'Enrollment number is required.';
        if (!/^[A-Za-z0-9/-]{3,30}$/.test(form.enrollment_no.trim())) return 'Enrollment number must be 3-30 alphanumeric characters.';

        if (!form.email || !form.email.trim()) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Enter a valid email address.';

        if (!editing && !form.password) return 'Password is required when adding a student.';
        if (form.password && form.password.length < 6) return 'Password must be at least 6 characters long.';

        if (!form.course || !form.course.trim()) return 'Course is required.';
        if (!form.department || !form.department.trim()) return 'Department is required.';

        const sem = Number(form.semester);
        if (!form.semester || !Number.isInteger(sem) || sem < 1 || sem > 12) {
            return 'Semester must be a valid number between 1 and 12.';
        }

        if (form.phone && form.phone.trim() && !/^\+?[0-9\s-]{10,15}$/.test(form.phone.trim())) {
            return 'Phone number must be a valid 10 to 15 digit phone number.';
        }

        if (form.emergency_contact && form.emergency_contact.trim() && !/^\+?[0-9\s-]{10,15}$/.test(form.emergency_contact.trim())) {
            return 'Emergency contact must be a valid 10 to 15 digit phone number.';
        }

        if (form.dob) {
            const dobDate = new Date(form.dob);
            if (Number.isNaN(dobDate.getTime())) return 'Enter a valid date of birth.';
            if (dobDate >= new Date()) return 'Date of birth must be a date in the past.';
        }

        return null;
    }

    function submit(event) {
        event.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        const data = { ...form };
        if (!data.password) delete data.password;
        onSubmit(data);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={submit} noValidate>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Full Name <span className="text-danger">*</span></label>
                    <input
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={change}
                        className="form-control"
                        placeholder="John Doe"
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Enrollment Number <span className="text-danger">*</span></label>
                    <input
                        name="enrollment_no"
                        type="text"
                        value={form.enrollment_no}
                        onChange={change}
                        className="form-control"
                        placeholder="EN2026101"
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Email Address <span className="text-danger">*</span></label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={change}
                        className="form-control"
                        placeholder="student@hostelhub.com"
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">
                        {editing ? 'New Password (optional)' : 'Password'} {!editing && <span className="text-danger">*</span>}
                    </label>
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={change}
                        className="form-control"
                        placeholder={editing ? 'Leave blank to keep current' : 'Min 6 characters'}
                        required={!editing}
                        minLength={6}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={change}
                        className="form-control"
                        placeholder="e.g. +919876543210"
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Emergency Contact</label>
                    <input
                        name="emergency_contact"
                        type="tel"
                        value={form.emergency_contact}
                        onChange={change}
                        className="form-control"
                        placeholder="e.g. +919876543211"
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Course <span className="text-danger">*</span></label>
                    <input
                        name="course"
                        type="text"
                        value={form.course}
                        onChange={change}
                        className="form-control"
                        placeholder="B.Tech Computer Science"
                        required
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Semester <span className="text-danger">*</span></label>
                    <input
                        name="semester"
                        type="number"
                        min="1"
                        max="12"
                        value={form.semester}
                        onChange={change}
                        className="form-control"
                        placeholder="1 - 12"
                        required
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Department <span className="text-danger">*</span></label>
                    <input
                        name="department"
                        type="text"
                        value={form.department}
                        onChange={change}
                        className="form-control"
                        placeholder="Computer Engineering"
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Date of Birth</label>
                    <input
                        name="dob"
                        type="date"
                        max={todayStr}
                        value={form.dob}
                        onChange={change}
                        className="form-control"
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Address</label>
                    <textarea
                        name="address"
                        value={form.address}
                        onChange={change}
                        className="form-control"
                        rows="2"
                        placeholder="Full residential address"
                    ></textarea>
                </div>
            </div>

            <button type="submit" className="btn btn-primary mt-4">
                <i className={`bi ${editing ? 'bi-check-circle' : 'bi-person-plus'} me-2`}></i>
                {editing ? 'Update Student' : 'Add Student'}
            </button>
        </form>
    );
}

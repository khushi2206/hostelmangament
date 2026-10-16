import React from 'react';
import { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';

function roomLabel(room) { return room.block + ' - ' + room.room_number; }

function bedLabels(room) {
    if (!room) return [];
    const occupiedBeds = room.occupied_beds ? room.occupied_beds.split(',') : [];
    const labels = [];
    for (let index = 0; index < room.capacity; index += 1) {
        const label = String.fromCharCode(65 + index);
        if (!occupiedBeds.includes(label)) labels.push(label);
    }
    return labels;
}

export default function RoomAllocation() {
    const [students, setStudents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [bedLabel, setBedLabel] = useState('');
    const [search, setSearch] = useState('');
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [studentError, setStudentError] = useState('');
    const [roomError, setRoomError] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    async function loadStudents() {
        try {
            setLoadingStudents(true);
            setStudentError('');
            const response = await axiosClient.get('/admin/allocation/students', { params: { search: search } });
            setStudents(response.data);
        } catch (requestError) {
            console.error(requestError);
            setStudentError('Unable to load students. Please check whether the backend is running.');
        } finally { setLoadingStudents(false); }
    }

    async function loadRooms() {
        try {
            setLoadingRooms(true);
            setRoomError('');
            const response = await axiosClient.get('/admin/allocation/rooms');
            setRooms(response.data);
        } catch (requestError) {
            console.error(requestError);
            setRoomError('Unable to load available rooms.');
        } finally { setLoadingRooms(false); }
    }

    useEffect(() => { loadStudents(); }, [search]);
    useEffect(() => { loadRooms(); }, []);

    function selectStudent(student) {
        setSelectedStudent(student);
        setSelectedRoom('');
        setBedLabel('');
        setError('');
        setMessage('');
    }

    function selectRoom(event) {
        setSelectedRoom(event.target.value);
        setBedLabel('');
    }

    async function saveAllocation() {
        if (!selectedStudent) return setError('Select a student first.');
        if (!selectedRoom || !bedLabel) return setError('Select a room and bed.');
        try {
            setError('');
            const data = { room_id: Number(selectedRoom), bed_label: bedLabel };
            const response = selectedStudent.room_id
                ? await axiosClient.put('/admin/allocation/' + selectedStudent.student_id, data)
                : await axiosClient.post('/admin/allocation', { ...data, student_id: selectedStudent.student_id });
            setMessage(response.data.message);
            await loadRooms();
            await loadStudents();
            const refreshedStudent = (await axiosClient.get('/admin/allocation/students')).data.find(student => student.student_id === selectedStudent.student_id);
            if (refreshedStudent) setSelectedStudent(refreshedStudent);
            setSelectedRoom('');
            setBedLabel('');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to allocate room.');
        }
    }

    async function vacateRoom() {
        if (!selectedStudent || !window.confirm("Are you sure you want to vacate this student's room?")) return;
        try {
            const response = await axiosClient.delete('/admin/allocation/' + selectedStudent.student_id);
            setMessage(response.data.message);
            await loadRooms();
            await loadStudents();
            const refreshedStudent = (await axiosClient.get('/admin/allocation/students')).data.find(student => student.student_id === selectedStudent.student_id);
            if (refreshedStudent) setSelectedStudent(refreshedStudent);
        } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to vacate room.'); }
    }

    const selectedRoomData = rooms.find(room => String(room.room_id) === String(selectedRoom));
    const availableBeds = bedLabels(selectedRoomData);

    return <section>
        <h2>Room Allocation</h2><p className="text-muted">Assign and manage hostel rooms for students.</p>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card border-0 shadow-sm page-card mb-4"><div className="card-body">
            <h5><i className="bi bi-person me-2"></i>Select Student</h5>
            <input value={search} onChange={event => setSearch(event.target.value)} className="form-control mb-3" placeholder="Search student by name or enrollment number" />
            {loadingStudents && <div className="alert alert-info">Loading students...</div>}
            {!loadingStudents && studentError && <div className="alert alert-danger">{studentError}</div>}
            {!loadingStudents && !studentError && students.length === 0 && <div className="alert alert-light border">No students found.</div>}
            {!loadingStudents && students.map(student => <div key={student.student_id} className={'border rounded p-3 mb-2 d-flex justify-content-between align-items-center gap-2 flex-wrap ' + (selectedStudent?.student_id === student.student_id ? 'border-primary' : '')}>
                <div><strong>{student.name}</strong><div className="small text-muted">Enrollment: {student.enrollment_no}</div><div className="small text-muted">Current Room: {student.room_id ? roomLabel(student) : 'Not Allocated'}{student.bed_label ? ' | Bed ' + student.bed_label : ''}</div></div>
                <button className="btn btn-sm btn-outline-primary" onClick={() => selectStudent(student)}>Select</button>
            </div>)}
        </div></div>
        {selectedStudent && <div className="card border-0 shadow-sm page-card"><div className="card-body">
            <h5><i className="bi bi-person-check me-2"></i>Allocation Details</h5>
            <div className="mb-3"><strong>{selectedStudent.name}</strong><div className="small text-muted">Enrollment: {selectedStudent.enrollment_no}</div><div className="small text-muted">Current Room: {selectedStudent.room_id ? roomLabel(selectedStudent) : 'Not Allocated'}</div>{selectedStudent.bed_label && <div className="small text-muted">Current Bed: {selectedStudent.bed_label}</div>}</div>
            <label className="form-label">{selectedStudent.room_id ? 'Select New Room' : 'Select Room'}</label>
            {loadingRooms ? <p>Loading rooms...</p> : roomError ? <div className="alert alert-danger">{roomError}</div> : rooms.length === 0 ? <div className="alert alert-light border">No rooms currently have available beds.</div> : <select value={selectedRoom} onChange={selectRoom} className="form-select mb-3"><option value="">Choose an available room</option>{rooms.filter(room => room.room_id !== selectedStudent.room_id).map(room => <option key={room.room_id} value={room.room_id}>{roomLabel(room)} | Floor: {room.floor} | Available Beds: {room.available_beds}</option>)}</select>}
            {selectedRoomData && <><label className="form-label">Bed</label><select value={bedLabel} onChange={event => setBedLabel(event.target.value)} className="form-select mb-3"><option value="">Choose a bed</option>{availableBeds.map(bed => <option key={bed} value={bed}>{bed}</option>)}</select></>}
            <div className="d-flex gap-2"><button className="btn btn-primary" onClick={saveAllocation}><i className="bi bi-person-check me-2"></i>{selectedStudent.room_id ? 'Reassign Room' : 'Allocate Room'}</button>{selectedStudent.room_id && <button className="btn btn-outline-danger" onClick={vacateRoom}><i className="bi bi-box-arrow-right me-2"></i>Vacate Room</button>}</div>
        </div></div>}
    </section>;
}

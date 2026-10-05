import React from 'react';
import { Link } from 'react-router-dom';

export default function StudentCard({ student, onDelete }) {
	return <div className="card student-card mb-3 shadow-sm border-0">
		<div className="card-body d-flex align-items-center gap-3 flex-wrap">
			<div className="icon-circle"><i className="bi bi-person"></i></div>
			<div className="flex-grow-1">
				<h5 className="mb-1">{student.name}</h5>
				<div className="small text-muted">Enrollment: {student.enrollment_no}</div>
				<div className="small text-muted">{student.course} | Semester {student.semester}</div>
				<div className="small text-muted">{student.email}</div>
				<div className="small text-muted">Room: {student.room_id ? student.block + ' - ' + student.room_number + (student.bed_label ? ' | Bed ' + student.bed_label : '') : 'Not Allocated'}</div>
			</div>
			<div className="text-md-end">
				<span className="badge bg-success">Active</span>
				<div className="mt-2 d-flex gap-2">
					<Link to={'/admin/students/' + student.student_id} className="btn btn-sm btn-outline-primary"><i className="bi bi-eye"></i></Link>
					<Link to={'/admin/students/' + student.student_id + '/edit'} className="btn btn-sm btn-outline-secondary"><i className="bi bi-pencil"></i></Link>
					<button onClick={() => onDelete(student)} className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
				</div>
			</div>
		</div>
	</div>;
}

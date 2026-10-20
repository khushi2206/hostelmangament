CREATE DATABASE IF NOT EXISTS hostelhub;
USE hostelhub;

CREATE TABLE IF NOT EXISTS users (
	user_id INT AUTO_INCREMENT PRIMARY KEY,
	email VARCHAR(255) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
	room_id INT AUTO_INCREMENT PRIMARY KEY,
	room_number VARCHAR(50) NOT NULL,
	block VARCHAR(50) NOT NULL,
	floor INT NOT NULL,
	capacity INT NOT NULL,
	occupied INT NOT NULL DEFAULT 0,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY unique_room (room_number, block),
	CHECK (floor > 0), CHECK (capacity > 0), CHECK (occupied >= 0 AND occupied <= capacity)
);

CREATE TABLE IF NOT EXISTS students (
	student_id INT AUTO_INCREMENT PRIMARY KEY,
	user_id INT NOT NULL UNIQUE,
	enrollment_no VARCHAR(100) NULL UNIQUE,
	name VARCHAR(150) NOT NULL,
	phone VARCHAR(30), course VARCHAR(150) NULL, semester INT NULL,
	department VARCHAR(150) NULL, dob DATE, address TEXT,
	emergency_contact VARCHAR(30), room_id INT NULL, bed_label VARCHAR(30) NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY unique_room_bed (room_id, bed_label),
	FOREIGN KEY (user_id) REFERENCES users(user_id),
	FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT,
	CHECK ((room_id IS NULL AND bed_label IS NULL) OR (room_id IS NOT NULL AND bed_label IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS leave_requests (
	leave_id INT AUTO_INCREMENT PRIMARY KEY,
	student_id INT NOT NULL,
	leave_type VARCHAR(50) NOT NULL,
	from_date DATE NOT NULL,
	to_date DATE NOT NULL,
	reason TEXT NOT NULL,
	status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
	admin_comment TEXT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
	CHECK (to_date >= from_date)
);

CREATE TABLE IF NOT EXISTS visitors (
	visitor_id INT AUTO_INCREMENT PRIMARY KEY,
	student_id INT NOT NULL,
	visitor_name VARCHAR(100) NOT NULL,
	relation VARCHAR(50),
	phone VARCHAR(15),
	visit_date DATE NOT NULL,
	visit_time TIME NOT NULL,
	status ENUM('Pending', 'Approved') NOT NULL DEFAULT 'Pending',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS complaints (
	complaint_id INT AUTO_INCREMENT PRIMARY KEY,
	student_id INT NOT NULL,
	room_id INT NULL,
	category VARCHAR(50) NOT NULL,
	description TEXT NOT NULL,
	status ENUM('Pending', 'In Progress', 'Resolved') NOT NULL DEFAULT 'Pending',
	created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
	FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS fees (
	fee_id INT AUTO_INCREMENT PRIMARY KEY,
	student_id INT NOT NULL,
	amount DECIMAL(10, 2) NOT NULL,
	paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
	CHECK (amount >= 0), CHECK (paid >= 0)
);

CREATE TABLE IF NOT EXISTS notices (
	notice_id INT AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(200) NOT NULL,
	description TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_change_requests (
	request_id INT AUTO_INCREMENT PRIMARY KEY,
	student_id INT NOT NULL,
	reason TEXT NOT NULL,
	status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mess_menu (
	menu_id INT AUTO_INCREMENT PRIMARY KEY,
	day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
	meal_type ENUM('Breakfast', 'Lunch', 'Dinner') NOT NULL,
	items TEXT NOT NULL,
	UNIQUE KEY unique_menu_meal (day_of_week, meal_type)
);

CREATE TABLE IF NOT EXISTS mess_opt_outs (
	opt_id INT AUTO_INCREMENT PRIMARY KEY,
	student_id INT NOT NULL,
	opt_date DATE NOT NULL,
	meal_type ENUM('Breakfast', 'Lunch', 'Dinner') NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY unique_student_opt_out (student_id, opt_date, meal_type),
	FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lost_found (
	item_id INT AUTO_INCREMENT PRIMARY KEY,
	student_id INT NOT NULL,
	type ENUM('Lost', 'Found') NOT NULL,
	item_name VARCHAR(150) NOT NULL,
	description TEXT NOT NULL,
	location VARCHAR(200),
	status VARCHAR(30) NOT NULL DEFAULT 'Open',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS laundry (
	laundry_id INT AUTO_INCREMENT PRIMARY KEY,
	student_id INT NOT NULL,
	clothes_count INT NOT NULL,
	request_date DATE NOT NULL,
	status ENUM('Pending', 'Collected', 'Completed') NOT NULL DEFAULT 'Pending',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CHECK (clothes_count > 0),
	FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

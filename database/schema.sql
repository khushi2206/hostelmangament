-- Create Database
CREATE DATABASE IF NOT EXISTS hostelhub;
USE hostelhub;

-- Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student'
);

-- Rooms Table
CREATE TABLE rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL,
    block VARCHAR(20) NOT NULL,
    floor INT NOT NULL,
    capacity INT NOT NULL,
    occupied INT NOT NULL DEFAULT 0,
    status VARCHAR(50) GENERATED ALWAYS AS (
        CASE
            WHEN occupied >= capacity THEN 'Full'
            ELSE 'Available'
        END
    ) STORED
);

-- Students Table
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    enrollment_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    course VARCHAR(100),
    semester INT,
    department VARCHAR(100),
    dob DATE,
    room_id INT,
    address TEXT,
    emergency_contact VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE SET NULL
);

-- Leave Requests Table
CREATE TABLE leave_requests (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    leave_type VARCHAR(100) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    admin_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Visitors Table
CREATE TABLE visitors (
    visitor_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    visitor_name VARCHAR(255) NOT NULL,
    relation VARCHAR(100),
    phone VARCHAR(20),
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Complaints Table
CREATE TABLE complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    room_id INT,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- Fees Table
CREATE TABLE fees (
    fee_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    remaining_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
    status VARCHAR(50) GENERATED ALWAYS AS (
        CASE
            WHEN amount - paid_amount <= 0 THEN 'Paid'
            WHEN paid_amount > 0 THEN 'Partial'
            ELSE 'Due'
        END
    ) STORED,
    payment_date DATE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Notices Table
CREATE TABLE notices (
    notice_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL DEFAULT (CURRENT_DATE),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Mess Menu Table
CREATE TABLE mess_menu (
    menu_id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week VARCHAR(20) NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    items TEXT NOT NULL
);

-- Mess Opt-Out Table
CREATE TABLE mess_opt_out (
    opt_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    opt_date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Room Change Requests Table
CREATE TABLE room_change_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    current_room_id INT,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (current_room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- Lost and Found Table
CREATE TABLE lost_and_found (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    type VARCHAR(20) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Laundry Requests Table
CREATE TABLE laundry_requests (
    laundry_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    clothes_count INT NOT NULL,
    request_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    status VARCHAR(50) DEFAULT 'Requested',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Insert sample data for testing
INSERT INTO users (email, password_hash, role) VALUES ('student@email.com', '$2b$10$hVXxwEND/Zh8SsKXX39xsOdJHktytoywrXxbup5UPWDfdcASP0VlO', 'student'); -- password123
INSERT INTO rooms (room_number, block, floor, capacity, occupied) VALUES ('H2-204', 'H2', 2, 3, 2);
INSERT INTO students (user_id, enrollment_no, name, phone, course, semester, department, dob, room_id, address, emergency_contact) VALUES (1, '22CS001', 'Student Name', '98XXXXXXXX', 'B.Tech CSE', 5, 'CSE', '2005-05-15', 1, 'Ahmedabad', '98XXXXXXXX');
INSERT INTO fees (student_id, amount, paid_amount, payment_date) VALUES (1, 50000, 30000, '2026-09-15');

INSERT INTO mess_menu (day_of_week, meal_type, items) VALUES 
('Monday', 'Breakfast', 'Poha, Jalebi, Tea, Coffee'),
('Monday', 'Lunch', 'Chapati, Dal, Rice, Mix Veg, Salad'),
('Monday', 'Dinner', 'Puri, Chole, Rice, Gulab Jamun'),
('Tuesday', 'Breakfast', 'Idli, Sambar, Coconut Chutney'),
('Tuesday', 'Lunch', 'Chapati, Rajma, Rice, Curd'),
('Tuesday', 'Dinner', 'Fried Rice, Manchurian, Soup');

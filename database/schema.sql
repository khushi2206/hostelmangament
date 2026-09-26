-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student'
);

-- Rooms Table
CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL,
    block VARCHAR(20) NOT NULL,
    floor INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    occupied INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) GENERATED ALWAYS AS (
        CASE
            WHEN occupied >= capacity THEN 'Full'
            ELSE 'Available'
        END
    ) STORED
);

-- Students Table
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    enrollment_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    course VARCHAR(100),
    semester INTEGER,
    department VARCHAR(100),
    dob DATE,
    room_id INTEGER REFERENCES rooms(room_id) ON DELETE SET NULL,
    address TEXT,
    emergency_contact VARCHAR(20)
);

-- Leave Requests Table
CREATE TABLE leave_requests (
    leave_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    leave_type VARCHAR(100) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    admin_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visitors Table
CREATE TABLE visitors (
    visitor_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    visitor_name VARCHAR(255) NOT NULL,
    relation VARCHAR(100),
    phone VARCHAR(20),
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints Table
CREATE TABLE complaints (
    complaint_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(room_id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fees Table
CREATE TABLE fees (
    fee_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    remaining_amount NUMERIC(10,2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
    status VARCHAR(50) GENERATED ALWAYS AS (
        CASE
            WHEN amount - paid_amount <= 0 THEN 'Paid'
            WHEN paid_amount > 0 THEN 'Partial'
            ELSE 'Due'
        END
    ) STORED,
    payment_date DATE
);

-- Notices Table
CREATE TABLE notices (
    notice_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO users (email, password_hash, role) VALUES ('student@email.com', '$2b$10$Y89Yf4Qj3XN0C0c9.19v7eI8yFzJz.x5gVz7eW4m/Vq8I2P6Zz9h2', 'student'); -- Password: password123
INSERT INTO rooms (room_number, block, floor, capacity, occupied) VALUES ('H2-204', 'H2', 2, 3, 2);
INSERT INTO students (user_id, enrollment_no, name, phone, course, semester, department, dob, room_id, address, emergency_contact) VALUES (1, '22CS001', 'Student Name', '98XXXXXXXX', 'B.Tech CSE', 5, 'CSE', '2005-05-15', 1, 'Ahmedabad', '98XXXXXXXX');
INSERT INTO fees (student_id, amount, paid_amount, payment_date) VALUES (1, 50000, 30000, '2026-09-15');

-- Mess Menu Table
CREATE TABLE mess_menu (
    menu_id SERIAL PRIMARY KEY,
    day_of_week VARCHAR(20) NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    items TEXT NOT NULL
);

-- Mess Opt-Out Table
CREATE TABLE mess_opt_out (
    opt_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    opt_date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room Change Requests Table
CREATE TABLE room_change_requests (
    request_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    current_room_id INTEGER REFERENCES rooms(room_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lost and Found Table
CREATE TABLE lost_and_found (
    item_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'Lost' or 'Found'
    item_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Laundry Requests Table
CREATE TABLE laundry_requests (
    laundry_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    clothes_count INTEGER NOT NULL,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Requested', -- Requested, Picked Up, Washing, Ready
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample mess menu
INSERT INTO mess_menu (day_of_week, meal_type, items) VALUES 
('Monday', 'Breakfast', 'Poha, Jalebi, Tea, Coffee'),
('Monday', 'Lunch', 'Chapati, Dal, Rice, Mix Veg, Salad'),
('Monday', 'Dinner', 'Puri, Chole, Rice, Gulab Jamun'),
('Tuesday', 'Breakfast', 'Idli, Sambar, Coconut Chutney'),
('Tuesday', 'Lunch', 'Chapati, Rajma, Rice, Curd'),
('Tuesday', 'Dinner', 'Fried Rice, Manchurian, Soup');

CREATE DATABASE IF NOT EXISTS exam_system_db1
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
use exam_system_db1;

DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
    department_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    department_code VARCHAR(20) NOT NULL COMMENT 'Mã khoa',

    department_name VARCHAR(100) NOT NULL COMMENT 'Tên khoa',

    description TEXT NULL COMMENT 'Mô tả',
    status ENUM('ACTIVE','INACTIVE')
        NOT NULL DEFAULT 'ACTIVE'
        COMMENT 'Trạng thái hoạt động',

    created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT 'Ngày tạo',

    updated_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
        COMMENT 'Ngày cập nhật',

    CONSTRAINT uq_department_code UNIQUE (department_code),

    CONSTRAINT uq_department_name UNIQUE (department_name)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Danh sách khoa';
DROP TABLE IF EXISTS academic_years;

CREATE TABLE academic_years (
    academic_year_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    academic_year_code VARCHAR(20) NOT NULL COMMENT 'Mã khóa học',

    academic_year_name VARCHAR(50) NOT NULL COMMENT 'Tên khóa học',

    start_year YEAR NOT NULL COMMENT 'Năm bắt đầu',

    end_year YEAR NOT NULL COMMENT 'Năm kết thúc',

    status ENUM('ACTIVE','INACTIVE')
        NOT NULL DEFAULT 'ACTIVE'
        COMMENT 'Trạng thái',

    created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_academic_year_code UNIQUE (academic_year_code),

    CONSTRAINT uq_academic_year_name UNIQUE (academic_year_name),

    CONSTRAINT chk_year CHECK (start_year < end_year)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Danh sách khóa học';
DROP TABLE IF EXISTS classes;

CREATE TABLE classes (
    class_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    class_code VARCHAR(20) NOT NULL COMMENT 'Mã lớp',

    class_name VARCHAR(100) NOT NULL COMMENT 'Tên lớp',

    department_id BIGINT NOT NULL COMMENT 'Khoa quản lý',

    academic_year_id BIGINT NOT NULL COMMENT 'Khóa học',

    description TEXT NULL COMMENT 'Mô tả',

    status ENUM('ACTIVE','INACTIVE')
        NOT NULL DEFAULT 'ACTIVE'
        COMMENT 'Trạng thái',

    created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_class_code UNIQUE (class_code),

    CONSTRAINT uq_class_name UNIQUE (class_name),

    INDEX idx_department (department_id),

    INDEX idx_academic_year (academic_year_id),

    CONSTRAINT fk_class_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_class_academic_year
        FOREIGN KEY (academic_year_id)
        REFERENCES academic_years(academic_year_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Danh sách lớp';
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    role_code VARCHAR(20) NOT NULL COMMENT 'Mã vai trò',

    role_name VARCHAR(100) NOT NULL COMMENT 'Tên vai trò',

    description TEXT NULL COMMENT 'Mô tả',

    status ENUM('ACTIVE','INACTIVE')
        NOT NULL DEFAULT 'ACTIVE'
        COMMENT 'Trạng thái',

    created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_role_code UNIQUE (role_code),

    CONSTRAINT uq_role_name UNIQUE (role_name)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Danh sách vai trò hệ thống';
DROP TABLE IF EXISTS students;

CREATE TABLE students (
    student_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    student_code VARCHAR(20) NOT NULL COMMENT 'Mã sinh viên',

    full_name VARCHAR(100) NOT NULL COMMENT 'Họ và tên',

    gender ENUM('MALE','FEMALE','OTHER')
        NOT NULL
        COMMENT 'Giới tính',

    date_of_birth DATE NOT NULL COMMENT 'Ngày sinh',

    email VARCHAR(100) NOT NULL COMMENT 'Email',

    phone VARCHAR(15) NULL COMMENT 'Số điện thoại',

    address VARCHAR(255) NULL COMMENT 'Địa chỉ',

    class_id BIGINT NOT NULL COMMENT 'Lớp',

    avatar LONGTEXT NULL COMMENT 'Ảnh đại diện (base64)',

    status ENUM('ACTIVE','INACTIVE')
        NOT NULL DEFAULT 'ACTIVE'
        COMMENT 'Trạng thái',

    created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_student_code UNIQUE (student_code),

    CONSTRAINT uq_student_email UNIQUE (email),

    INDEX idx_student_name (full_name),

    INDEX idx_student_class (class_id),

    CONSTRAINT fk_student_class
        FOREIGN KEY (class_id)
        REFERENCES classes(class_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Thông tin sinh viên';
DROP TABLE IF EXISTS teachers;

CREATE TABLE teachers (
    teacher_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    teacher_code VARCHAR(20) NOT NULL COMMENT 'Mã giảng viên',

    full_name VARCHAR(100) NOT NULL COMMENT 'Họ và tên',

    gender ENUM('MALE','FEMALE','OTHER')
        NOT NULL
        COMMENT 'Giới tính',

    date_of_birth DATE NOT NULL COMMENT 'Ngày sinh',

    email VARCHAR(100) NOT NULL COMMENT 'Email',

    phone VARCHAR(15) NULL COMMENT 'Số điện thoại',

    address VARCHAR(255) NULL COMMENT 'Địa chỉ',

    department_id BIGINT NOT NULL COMMENT 'Khoa',

    academic_degree VARCHAR(100) NULL COMMENT 'Học vị',

    avatar LONGTEXT NULL COMMENT 'Ảnh đại diện (base64)',

    status ENUM('ACTIVE','INACTIVE')
        NOT NULL DEFAULT 'ACTIVE'
        COMMENT 'Trạng thái',

    created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_teacher_code UNIQUE (teacher_code),

    CONSTRAINT uq_teacher_email UNIQUE (email),

    INDEX idx_teacher_name (full_name),

    INDEX idx_teacher_department (department_id),

    CONSTRAINT fk_teacher_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Thông tin giảng viên';
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    username VARCHAR(50) NOT NULL COMMENT 'Tên đăng nhập',

    password_hash VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã mã hóa',

    role_id BIGINT NOT NULL COMMENT 'Vai trò',

    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Trạng thái tài khoản',

    last_login DATETIME NULL COMMENT 'Lần đăng nhập cuối',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_username UNIQUE(username),

    INDEX idx_role(role_id),

    CONSTRAINT fk_user_role
        FOREIGN KEY(role_id)
        REFERENCES roles(role_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Tài khoản đăng nhập';
DROP TABLE IF EXISTS student_accounts;

CREATE TABLE student_accounts (

    user_id BIGINT PRIMARY KEY COMMENT 'Tài khoản',

    student_id BIGINT NOT NULL COMMENT 'Sinh viên',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_student UNIQUE(student_id),

    CONSTRAINT fk_sa_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_sa_student
        FOREIGN KEY(student_id)
        REFERENCES students(student_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Liên kết tài khoản sinh viên';
DROP TABLE IF EXISTS teacher_accounts;

CREATE TABLE teacher_accounts (

    user_id BIGINT PRIMARY KEY COMMENT 'Tài khoản',

    teacher_id BIGINT NOT NULL COMMENT 'Giảng viên',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_teacher UNIQUE(teacher_id),

    CONSTRAINT fk_ta_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_ta_teacher
        FOREIGN KEY(teacher_id)
        REFERENCES teachers(teacher_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Liên kết tài khoản giảng viên';
DROP TABLE IF EXISTS subjects;

CREATE TABLE subjects (
    subject_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    subject_code VARCHAR(20) NOT NULL COMMENT 'Mã môn học',

    subject_name VARCHAR(100) NOT NULL COMMENT 'Tên môn học',

    credits TINYINT UNSIGNED NOT NULL COMMENT 'Số tín chỉ',

    description TEXT NULL COMMENT 'Mô tả',

    status ENUM('ACTIVE','INACTIVE')
        NOT NULL DEFAULT 'ACTIVE'
        COMMENT 'Trạng thái',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_subject_code UNIQUE(subject_code),

    CONSTRAINT uq_subject_name UNIQUE(subject_name)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Danh sách môn học';
DROP TABLE IF EXISTS teacher_subjects;

CREATE TABLE teacher_subjects (

    teacher_subject_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    teacher_id BIGINT NOT NULL,

    subject_id BIGINT NOT NULL,

    assigned_date DATE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_teacher_subject
        UNIQUE(teacher_id, subject_id),

    INDEX idx_teacher(teacher_id),

    INDEX idx_subject(subject_id),

    CONSTRAINT fk_ts_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES teachers(teacher_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_ts_subject
        FOREIGN KEY(subject_id)
        REFERENCES subjects(subject_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COMMENT='Phân công giảng dạy';
DROP TABLE IF EXISTS chapters;

CREATE TABLE chapters (

    chapter_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    subject_id BIGINT NOT NULL,

    chapter_code VARCHAR(20) NOT NULL,

    chapter_name VARCHAR(100) NOT NULL,

    chapter_order INT NOT NULL,

    description TEXT NULL,

    status ENUM('ACTIVE','INACTIVE')
        DEFAULT 'ACTIVE',

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_chapter
        UNIQUE(subject_id, chapter_code),

    INDEX idx_subject(subject_id),

    CONSTRAINT fk_chapter_subject
        FOREIGN KEY(subject_id)
        REFERENCES subjects(subject_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COMMENT='Chương của môn học';
DROP TABLE IF EXISTS difficulty_levels;

CREATE TABLE difficulty_levels (

    difficulty_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    difficulty_name VARCHAR(50) NOT NULL,

    description TEXT NULL,

    CONSTRAINT uq_difficulty
        UNIQUE(difficulty_name)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COMMENT='Mức độ câu hỏi';
DROP TABLE IF EXISTS question_types;

CREATE TABLE question_types (

    question_type_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    type_name VARCHAR(50) NOT NULL,

    description TEXT NULL,

    CONSTRAINT uq_question_type
        UNIQUE(type_name)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COMMENT='Loại câu hỏi';
DROP TABLE IF EXISTS questions;

CREATE TABLE questions (
    question_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    subject_id BIGINT NOT NULL COMMENT 'Môn học',

    chapter_id BIGINT NOT NULL COMMENT 'Chương',

    difficulty_id BIGINT NOT NULL COMMENT 'Mức độ',

    question_type_id BIGINT NOT NULL COMMENT 'Loại câu hỏi',

    teacher_id BIGINT NOT NULL COMMENT 'Giảng viên tạo',

    question_content TEXT NOT NULL COMMENT 'Nội dung câu hỏi',

    explanation TEXT NULL COMMENT 'Lời giải',

    score DECIMAL(5,2) NOT NULL DEFAULT 1.00 COMMENT 'Điểm của câu hỏi',

    status ENUM('ACTIVE','INACTIVE')
        NOT NULL DEFAULT 'ACTIVE'
        COMMENT 'Trạng thái',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_subject(subject_id),

    INDEX idx_chapter(chapter_id),

    INDEX idx_teacher(teacher_id),

    INDEX idx_difficulty(difficulty_id),

    INDEX idx_question_type(question_type_id),

    CONSTRAINT fk_question_subject
        FOREIGN KEY(subject_id)
        REFERENCES subjects(subject_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_question_chapter
        FOREIGN KEY(chapter_id)
        REFERENCES chapters(chapter_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_question_difficulty
        FOREIGN KEY(difficulty_id)
        REFERENCES difficulty_levels(difficulty_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_question_type
        FOREIGN KEY(question_type_id)
        REFERENCES question_types(question_type_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_question_teacher
        FOREIGN KEY(teacher_id)
        REFERENCES teachers(teacher_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Ngân hàng câu hỏi';
DROP TABLE IF EXISTS answers;

CREATE TABLE answers (

    answer_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    question_id BIGINT NOT NULL COMMENT 'Câu hỏi',

    answer_content TEXT NOT NULL COMMENT 'Nội dung đáp án',

    is_correct BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đáp án đúng',

    answer_order TINYINT UNSIGNED NOT NULL COMMENT 'Thứ tự đáp án',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_question(question_id),

    CONSTRAINT fk_answer_question
        FOREIGN KEY(question_id)
        REFERENCES questions(question_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Đáp án của câu hỏi';
DROP TABLE IF EXISTS exams;

CREATE TABLE exams (
    exam_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    exam_code VARCHAR(20) NOT NULL COMMENT 'Mã đề',

    exam_name VARCHAR(200) NOT NULL COMMENT 'Tên đề thi',

    subject_id BIGINT NOT NULL COMMENT 'Môn học',

    teacher_id BIGINT NOT NULL COMMENT 'Giảng viên tạo',

    duration INT NOT NULL COMMENT 'Thời gian làm bài (phút)',

    total_score DECIMAL(5,2) NOT NULL DEFAULT 10.00 COMMENT 'Tổng điểm',

    pass_score DECIMAL(5,2) NOT NULL DEFAULT 5.00 COMMENT 'Điểm đạt',

    shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Trộn câu hỏi',

    shuffle_answers BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Trộn đáp án',

    description TEXT NULL COMMENT 'Mô tả',

    status ENUM('DRAFT','PUBLISHED','ARCHIVED')
        NOT NULL DEFAULT 'DRAFT'
        COMMENT 'Trạng thái',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_exam_code UNIQUE(exam_code),

    INDEX idx_subject(subject_id),

    INDEX idx_teacher(teacher_id),

    CONSTRAINT fk_exam_subject
        FOREIGN KEY(subject_id)
        REFERENCES subjects(subject_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_exam_teacher
        FOREIGN KEY(teacher_id)
        REFERENCES teachers(teacher_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Danh sách đề thi';
DROP TABLE IF EXISTS exam_questions;

CREATE TABLE exam_questions (

    exam_question_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    exam_id BIGINT NOT NULL,

    question_id BIGINT NOT NULL,

    question_order INT NOT NULL,

    score DECIMAL(5,2) NOT NULL DEFAULT 1.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_exam_question
        UNIQUE(exam_id, question_id),

    INDEX idx_exam(exam_id),

    INDEX idx_question(question_id),

    CONSTRAINT fk_eq_exam
        FOREIGN KEY(exam_id)
        REFERENCES exams(exam_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_eq_question
        FOREIGN KEY(question_id)
        REFERENCES questions(question_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Danh sách câu hỏi trong đề thi';
DROP TABLE IF EXISTS exam_rooms;

CREATE TABLE exam_rooms (
    room_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    room_code VARCHAR(20) NOT NULL COMMENT 'Mã phòng',

    room_name VARCHAR(200) NOT NULL COMMENT 'Tên phòng',

    exam_id BIGINT NOT NULL COMMENT 'Đề thi',

    teacher_id BIGINT NOT NULL COMMENT 'Giáo viên phụ trách',

    room_password VARCHAR(100) NULL COMMENT 'Mật khẩu phòng',

    max_students INT NOT NULL DEFAULT 50 COMMENT 'Số lượng tối đa',

    start_time DATETIME NOT NULL COMMENT 'Thời gian bắt đầu',

    end_time DATETIME NOT NULL COMMENT 'Thời gian kết thúc',

    status ENUM('WAITING','RUNNING','FINISHED','CANCELLED')
        NOT NULL DEFAULT 'WAITING'
        COMMENT 'Trạng thái phòng',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_room_code UNIQUE(room_code),

    INDEX idx_exam(exam_id),

    INDEX idx_teacher(teacher_id),

    CONSTRAINT fk_room_exam
        FOREIGN KEY(exam_id)
        REFERENCES exams(exam_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_room_teacher
        FOREIGN KEY(teacher_id)
        REFERENCES teachers(teacher_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COMMENT='Phòng thi';
DROP TABLE IF EXISTS room_students;

CREATE TABLE room_students (

    room_student_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    room_id BIGINT NOT NULL,

    student_id BIGINT NOT NULL,

    join_time DATETIME NULL,

    status ENUM('PENDING','APPROVED','REJECTED')
        DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_room_student
        UNIQUE(room_id,student_id),

    INDEX idx_room(room_id),

    INDEX idx_student(student_id),

    CONSTRAINT fk_rs_room
        FOREIGN KEY(room_id)
        REFERENCES exam_rooms(room_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_rs_student
        FOREIGN KEY(student_id)
        REFERENCES students(student_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COMMENT='Danh sách sinh viên trong phòng';
DROP TABLE IF EXISTS exam_attempts;

CREATE TABLE exam_attempts (

    attempt_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    room_id BIGINT NOT NULL,

    exam_id BIGINT NOT NULL,

    student_id BIGINT NOT NULL,

    start_time DATETIME NOT NULL,

    submit_time DATETIME NULL,

    duration_seconds INT DEFAULT 0,

    score DECIMAL(5,2) DEFAULT 0,

    total_questions INT DEFAULT 0,

    correct_answers INT DEFAULT 0,

    status ENUM(
        'IN_PROGRESS',
        'SUBMITTED',
        'AUTO_SUBMITTED'
    ) DEFAULT 'IN_PROGRESS',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_room(room_id),

    INDEX idx_exam(exam_id),

    INDEX idx_student(student_id),

    CONSTRAINT uq_attempt UNIQUE(room_id,student_id),

    CONSTRAINT fk_attempt_room
        FOREIGN KEY(room_id)
        REFERENCES exam_rooms(room_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_attempt_exam
        FOREIGN KEY(exam_id)
        REFERENCES exams(exam_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_attempt_student
        FOREIGN KEY(student_id)
        REFERENCES students(student_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COMMENT='Lần làm bài của sinh viên';
DROP TABLE IF EXISTS student_answers;

CREATE TABLE student_answers (

    student_answer_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    attempt_id BIGINT NOT NULL,

    question_id BIGINT NOT NULL,

    answer_id BIGINT NOT NULL,

    is_correct BOOLEAN DEFAULT FALSE,

    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_student_answer
        UNIQUE(attempt_id,question_id,answer_id),

    INDEX idx_attempt(attempt_id),

    INDEX idx_question(question_id),

    INDEX idx_answer(answer_id),

    CONSTRAINT fk_sa_attempt
        FOREIGN KEY(attempt_id)
        REFERENCES exam_attempts(attempt_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_sa_question
        FOREIGN KEY(question_id)
        REFERENCES questions(question_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_sa_answer
        FOREIGN KEY(answer_id)
        REFERENCES answers(answer_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COMMENT='Đáp án sinh viên';
DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (

    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    title VARCHAR(255) NOT NULL,

    content TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user(user_id),

    CONSTRAINT fk_notification_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COMMENT='Thông báo';
DROP TABLE IF EXISTS activity_logs;

CREATE TABLE activity_logs (

    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    action VARCHAR(255) NOT NULL,

    description TEXT,

    ip_address VARCHAR(45),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user(user_id),

    CONSTRAINT fk_log_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COMMENT='Nhật ký hoạt động';
DROP TABLE IF EXISTS permissions;

CREATE TABLE permissions (
    permission_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    permission_code VARCHAR(50) NOT NULL COMMENT 'Mã quyền',

    permission_name VARCHAR(100) NOT NULL COMMENT 'Tên quyền',

    description TEXT NULL COMMENT 'Mô tả',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_permission_code UNIQUE(permission_code),

    CONSTRAINT uq_permission_name UNIQUE(permission_name)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Danh sách quyền hệ thống';
DROP TABLE IF EXISTS role_permissions;

CREATE TABLE role_permissions (
    role_permission_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    role_id BIGINT NOT NULL,

    permission_id BIGINT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_role_permission
        UNIQUE(role_id, permission_id),

    INDEX idx_role(role_id),

    INDEX idx_permission(permission_id),

    CONSTRAINT fk_rp_role
        FOREIGN KEY(role_id)
        REFERENCES roles(role_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_rp_permission
        FOREIGN KEY(permission_id)
        REFERENCES permissions(permission_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Phân quyền theo vai trò';
DROP TABLE IF EXISTS exam_room_logs;

CREATE TABLE exam_room_logs (
    room_log_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính',

    room_id BIGINT NOT NULL COMMENT 'Phòng thi',

    user_id BIGINT NOT NULL COMMENT 'Người thực hiện',

    action VARCHAR(100) NOT NULL COMMENT 'Hành động',

    description TEXT NULL COMMENT 'Mô tả',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_room(room_id),

    INDEX idx_user(user_id),

    CONSTRAINT fk_room_log_room
        FOREIGN KEY(room_id)
        REFERENCES exam_rooms(room_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_room_log_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Nhật ký hoạt động trong phòng thi';


INSERT INTO roles (role_id, role_code, role_name, description) VALUES
(1, 'ADMIN', 'Quản trị viên', 'Toàn quyền quản lý hệ thống'),
(2, 'TEACHER', 'Giảng viên', 'Quản lý ngân hàng câu hỏi, đề thi, phòng thi'),
(3, 'STUDENT', 'Sinh viên', 'Tham gia thi trắc nghiệm');

INSERT INTO users (user_id, username, password_hash, role_id, is_active) VALUES
(1, 'admin', '$2b$10$/tL00y4KDDD9PpmQDbu3r.jKNBnxfvFuOKd0843XrT4U72kKg.QrG', 1, TRUE),
(2, 'teacher', '$2b$10$skDJ0lfwVaDf.KX1lSWoGunLUM1rcMuxerV1pL3G0ino0m9Awk9TC', 2, TRUE),
(3, 'student', '$2b$10$/YL3J89XdJER.VWFb.rvceNAqKw2ckuh3XMF5c6fh9i.YnDml.xWG', 3, TRUE);

INSERT INTO difficulty_levels (difficulty_id, difficulty_name, description) VALUES
(1, 'Dễ', 'Câu hỏi cơ bản, kiến thức nền tảng'),
(2, 'Trung bình', 'Câu hỏi yêu cầu hiểu và vận dụng'),
(3, 'Khó', 'Câu hỏi nâng cao, phân tích tổng hợp'),
(4, 'Rất khó', 'Câu hỏi chuyên sâu, tư duy phản biện');

INSERT INTO question_types (question_type_id, type_name, description) VALUES
(1, 'Trắc nghiệm một đáp án', 'Chọn duy nhất 1 đáp án đúng trong các phương án'),
(2, 'Trắc nghiệm nhiều đáp án', 'Chọn nhiều đáp án đúng trong các phương án');

INSERT INTO departments (department_id, department_code, department_name, description) VALUES
(1, 'CNTT', 'Khoa Công nghệ Thông tin', 'Đào tạo chuyên ngành Công nghệ thông tin'),
(2, 'QTKD', 'Khoa Quản trị Kinh doanh', 'Đào tạo chuyên ngành Quản trị kinh doanh');

INSERT INTO academic_years (academic_year_id, academic_year_code, academic_year_name, start_year, end_year) VALUES
(1, 'K2023', 'Khóa 2023-2027', 2023, 2027),
(2, 'K2024', 'Khóa 2024-2028', 2024, 2028);

INSERT INTO classes (class_id, class_code, class_name, department_id, academic_year_id, description) VALUES
(1, 'CNTT01', 'CNTT - Lớp 01', 1, 1, 'Lớp Công nghệ thông tin 01 - Khóa 2023'),
(2, 'CNTT02', 'CNTT - Lớp 02', 1, 1, 'Lớp Công nghệ thông tin 02 - Khóa 2023'),
(3, 'QTKD01', 'QTKD - Lớp 01', 2, 2, 'Lớp Quản trị kinh doanh 01 - Khóa 2024');

INSERT INTO teachers (teacher_id, teacher_code, full_name, gender, date_of_birth, email, phone, department_id) VALUES
(1, 'GV001', 'Giảng Viên Mẫu', 'MALE', '1985-05-15', 'teacher@gmail.com', '0912345678', 1);

INSERT INTO teacher_accounts (user_id, teacher_id) VALUES (2, 1);

INSERT INTO students (student_id, student_code, full_name, gender, date_of_birth, email, phone, class_id) VALUES
(1, 'SV001', 'Sinh Viên Mẫu', 'FEMALE', '2003-10-20', 'student@gmail.com', '0987654321', 1);

INSERT INTO student_accounts (user_id, student_id) VALUES (3, 1);

INSERT INTO subjects (subject_id, subject_code, subject_name, credits, description) VALUES
(1, 'IT001', 'Nhập môn lập trình', 3, 'Môn học cơ sở về lập trình'),
(2, 'IT002', 'Cơ sở dữ liệu', 3, 'Thiết kế và quản trị cơ sở dữ liệu'),
(3, 'IT003', 'Mạng máy tính', 3, 'Kiến thức nền tảng về mạng máy tính');

INSERT INTO teacher_subjects (teacher_id, subject_id, assigned_date) VALUES
(1, 1, CURDATE()),
(1, 2, CURDATE()),
(1, 3, CURDATE());

INSERT INTO chapters (subject_id, chapter_code, chapter_name, chapter_order, description) VALUES
(1, 'C1', 'Tổng quan về lập trình', 1, 'Giới thiệu ngôn ngữ lập trình, biến, kiểu dữ liệu'),
(1, 'C2', 'Cấu trúc điều khiển', 2, 'If-else, switch-case, vòng lặp'),
(1, 'C3', 'Hàm và mảng', 3, 'Khai báo hàm, truyền tham số, mảng một chiều'),
(2, 'C1', 'Mô hình quan hệ', 1, 'Khái niệm bảng, khóa chính, khóa ngoại'),
(2, 'C2', 'Ngôn ngữ SQL', 2, 'SELECT, INSERT, UPDATE, DELETE'),
(2, 'C3', 'Chuẩn hóa dữ liệu', 3, '1NF, 2NF, 3NF, BCNF'),
(3, 'C1', 'Tổng quan mạng máy tính', 1, 'Mô hình OSI, TCP/IP'),
(3, 'C2', 'Tầng mạng', 2, 'Địa chỉ IP, định tuyến'),
(3, 'C3', 'Tầng ứng dụng', 3, 'HTTP, DNS, DHCP, FTP');

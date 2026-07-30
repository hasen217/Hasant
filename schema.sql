-- Create Database
CREATE DATABASE IF NOT EXISTS islamic_quiz;
USE islamic_quiz;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    score INT DEFAULT 0,
    games_played INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
    category VARCHAR(50) DEFAULT 'General',
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz History Table
CREATE TABLE IF NOT EXISTS quiz_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    score INT,
    total_questions INT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Sample Questions
INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty) VALUES
('Quran mein kitne Surah hain?', '110', '114', '120', '100', 'b', 'Quran', 'Easy'),
('Islam ka pehla pillar kya hai?', 'Namaz', 'Roza', 'Shahadah', 'Zakat', 'c', 'Pillars', 'Easy'),
('Hajj kaise maheene mein hota hai?', 'Ramadan', 'Shawwal', 'Dhul Hijjah', 'Muharram', 'c', 'Hajj', 'Medium'),
('Jibraeel (AS) ko kaun sa farishta kehte hain?', 'Ruh-ul-Qudus', 'Mikael', 'Israfil', 'Azrael', 'a', 'Angels', 'Medium'),
('Zakat ka nisab (gold) kitna hai?', '7.5 Tola', '10 Tola', '5 Tola', '12 Tola', 'a', 'Zakat', 'Hard'),
('Surah Fatiha ko aur kya kehte hain?', 'Umm-ul-Quran', 'Khatam-ul-Quran', 'Ayat-ul-Kursi', 'Surah Mulk', 'a', 'Quran', 'Easy'),
('Tahajjud ki namaz ka waqt?', 'Isha ke baad', 'Raat ke aakhri hissa', 'Fajr se pehle', 'B aur C dono', 'd', 'Prayer', 'Medium'),
('Hajj ke dauran kaun si jagah se shaitan ko patthar maarte hain?', 'Mina', 'Muzdalifah', 'Safa-Marwah', 'Arafat', 'a', 'Hajj', 'Hard'),
('Quran mein kaun si surah "Qalb-ul-Quran" kehlati hai?', 'Surah Yaseen', 'Surah Rahman', 'Surah Mulk', 'Surah Falaq', 'a', 'Quran', 'Medium'),
('Namaz mein kitne Rakat farz hain?', '17', '20', '22', '24', 'a', 'Prayer', 'Easy'),
('Roza kis mahine mein farz hai?', 'Muharram', 'Rajab', 'Ramadan', 'Shawwal', 'c', 'Fasting', 'Easy'),
('Allah ke kitne naam hain?', '97', '99', '100', '101', 'b', 'General', 'Easy'),
('Surah Ikhlas kaun si category mein aati hai?', 'Makki', 'Madani', 'Dono', 'None', 'a', 'Quran', 'Medium'),
('Jannat ke kitne darwaze hain?', '5', '7', '8', '10', 'c', 'General', 'Hard'),
('Sawab ka matlab kya hai?', 'Gunah', 'Ne'ki', 'Dua', 'Namaz', 'b', 'General', 'Easy');
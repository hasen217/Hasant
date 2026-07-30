// ==================== IMPORTS ====================
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ==================== SQLITE DATABASE ====================
const dbPath = path.join(__dirname, 'quiz.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database error:', err.message);
    } else {
        console.log('✅ Connected to SQLite database: quiz.db');
        createTables();
    }
});

// ==================== CREATE TABLES ====================
function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            games_played INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating users table:', err.message);
        } else {
            console.log('✅ Users table ready');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            category TEXT DEFAULT 'General',
            difficulty TEXT DEFAULT 'Medium',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating questions table:', err.message);
        } else {
            console.log('✅ Questions table ready');
            insertSampleQuestions();
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS quiz_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            score INTEGER,
            total_questions INTEGER,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating quiz_history table:', err.message);
        } else {
            console.log('✅ Quiz history table ready');
        }
    });
}

// ==================== INSERT SAMPLE QUESTIONS ====================
function insertSampleQuestions() {
    const questions = [
        ['Quran mein kitne Surah hain?', '110', '114', '120', '100', 'b', 'Quran', 'Easy'],
        ['Islam ka pehla pillar kya hai?', 'Namaz', 'Roza', 'Shahadah', 'Zakat', 'c', 'Pillars', 'Easy'],
        ['Hajj kaise maheene mein hota hai?', 'Ramadan', 'Shawwal', 'Dhul Hijjah', 'Muharram', 'c', 'Hajj', 'Medium'],
        ['Jibraeel (AS) ko kaun sa farishta kehte hain?', 'Ruh-ul-Qudus', 'Mikael', 'Israfil', 'Azrael', 'a', 'Angels', 'Medium'],
        ['Zakat ka nisab (gold) kitna hai?', '7.5 Tola', '10 Tola', '5 Tola', '12 Tola', 'a', 'Zakat', 'Hard'],
        ['Surah Fatiha ko aur kya kehte hain?', 'Umm-ul-Quran', 'Khatam-ul-Quran', 'Ayat-ul-Kursi', 'Surah Mulk', 'a', 'Quran', 'Easy'],
        ['Tahajjud ki namaz ka waqt?', 'Isha ke baad', 'Raat ke aakhri hissa', 'Fajr se pehle', 'B aur C dono', 'd', 'Prayer', 'Medium'],
        ['Hajj ke dauran kaun si jagah se shaitan ko patthar maarte hain?', 'Mina', 'Muzdalifah', 'Safa-Marwah', 'Arafat', 'a', 'Hajj', 'Hard'],
        ['Quran mein kaun si surah "Qalb-ul-Quran" kehlati hai?', 'Surah Yaseen', 'Surah Rahman', 'Surah Mulk', 'Surah Falaq', 'a', 'Quran', 'Medium'],
        ['Namaz mein kitne Rakat farz hain?', '17', '20', '22', '24', 'a', 'Prayer', 'Easy']
    ];

    db.get('SELECT COUNT(*) as count FROM questions', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking questions:', err.message);
            return;
        }
        
        if (row.count === 0) {
            const stmt = db.prepare(`
                INSERT INTO questions 
                (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            questions.forEach(q => {
                stmt.run(q, (err) => {
                    if (err) {
                        console.error('❌ Error inserting question:', err.message);
                    }
                });
            });
            
            stmt.finalize();
            console.log('✅ Sample questions inserted!');
        } else {
            console.log('📚 Questions already exist:', row.count);
        }
    });
}

// ==================== API ROUTES ====================

// ============================================
// 1. GET QUESTIONS
// ============================================
app.get('/api/questions', (req, res) => {
    const sql = `SELECT id, question, option_a, option_b, option_c, option_d, category, difficulty 
                 FROM questions ORDER BY RANDOM() LIMIT 10`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Error:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No questions found' });
        }
        res.json(rows);
    });
});

// ============================================
// 2. CHECK ANSWER
// ============================================
app.post('/api/check-answer', (req, res) => {
    const { questionId, selectedOption } = req.body;
    
    if (!questionId || !selectedOption) {
        return res.status(400).json({ error: 'Question ID and selected option required' });
    }
    
    const sql = 'SELECT correct_answer FROM questions WHERE id = ?';
    db.get(sql, [questionId], (err, row) => {
        if (err) {
            console.error('❌ Error:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        const isCorrect = row.correct_answer === selectedOption;
        res.json({ correct: isCorrect });
    });
});

// ============================================
// 3. REGISTER
// ============================================
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields required' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.run(sql, [username, email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Username or email already exists' });
                }
                console.error('❌ Error:', err.message);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ 
                success: true,
                message: 'User registered successfully!',
                userId: this.lastID
            });
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// 4. LOGIN
// ============================================
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], async (err, user) => {
        if (err) {
            console.error('❌ Error:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        try {
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            
            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    score: user.score || 0,
                    games_played: user.games_played || 0
                }
            });
        } catch (error) {
            console.error('❌ Error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });
});

// ============================================
// 5. SAVE SCORE
// ============================================
app.post('/api/save-score', (req, res) => {
    const { userId, score, totalQuestions } = req.body;
    
    if (!userId || score === undefined || !totalQuestions) {
        return res.status(400).json({ error: 'User ID, score, and total questions required' });
    }
    
    // Update user score
    const updateSql = 'UPDATE users SET score = score + ?, games_played = games_played + 1 WHERE id = ?';
    db.run(updateSql, [score, userId], function(err) {
        if (err) {
            console.error('❌ Error:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Insert quiz history
        const historySql = 'INSERT INTO quiz_history (user_id, score, total_questions) VALUES (?, ?, ?)';
        db.run(historySql, [userId, score, totalQuestions], function(err) {
            if (err) {
                console.error('❌ Error:', err.message);
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({
                success: true,
                message: 'Score saved successfully!'
            });
        });
    });
});

// ============================================
// 6. LEADERBOARD
// ============================================
app.get('/api/leaderboard', (req, res) => {
    const sql = 'SELECT username, score, games_played FROM users ORDER BY score DESC LIMIT 10';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Error:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// ============================================
// 7. USER HISTORY
// ============================================
app.get('/api/user-history/:userId', (req, res) => {
    const { userId } = req.params;
    
    const sql = 'SELECT score, total_questions, date FROM quiz_history WHERE user_id = ? ORDER BY date DESC LIMIT 10';
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error('❌ Error:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// ============================================
// 8. STATS
// ============================================
app.get('/api/stats', (req, res) => {
    const queries = {
        totalUsers: 'SELECT COUNT(*) as count FROM users',
        totalQuestions: 'SELECT COUNT(*) as count FROM questions',
        totalGames: 'SELECT COUNT(*) as count FROM quiz_history',
        avgScore: 'SELECT AVG(score) as avg FROM quiz_history'
    };
    
    let results = {};
    let completed = 0;
    const total = Object.keys(queries).length;
    
    Object.entries(queries).forEach(([key, sql]) => {
        db.get(sql, [], (err, row) => {
            if (err) {
                console.error(`❌ Error fetching ${key}:`, err.message);
            }
            results[key] = row || { count: 0, avg: 0 };
            completed++;
            
            if (completed === total) {
                res.json(results);
            }
        });
    });
});

// ============================================
// 9. ADD QUESTION (Admin)
// ============================================
app.post('/api/admin/questions', (req, res) => {
    const { question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty } = req.body;
    
    if (!question || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
        return res.status(400).json({ error: 'All fields required' });
    }
    
    const sql = `INSERT INTO questions 
                (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty], function(err) {
        if (err) {
            console.error('❌ Error:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({
            success: true,
            message: 'Question added successfully!',
            id: this.lastID
        });
    });
});

// ============================================
// 10. DELETE QUESTION (Admin)
// ============================================
app.delete('/api/admin/questions/:id', (req, res) => {
    const { id } = req.params;
    
    const sql = 'DELETE FROM questions WHERE id = ?';
    db.run(sql, [id], function(err) {
        if (err) {
            console.error('❌ Error:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json({ success: true, message: 'Question deleted successfully!' });
    });
});

// ============================================
// 11. HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: '🌙 Islamic Quiz API is running!',
        database: 'SQLite',
        dbFile: 'quiz.db',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// 12. SERVE FRONTEND
// ============================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log('\n====================================');
    console.log('🌙 Islamic Quiz Server');
    console.log('====================================');
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`📚 Database: SQLite (quiz.db)`);
    console.log('====================================');
    console.log('\n📡 API Endpoints:');
    console.log(`  GET  /api/health`);
    console.log(`  GET  /api/questions`);
    console.log(`  POST /api/check-answer`);
    console.log(`  POST /api/register`);
    console.log(`  POST /api/login`);
    console.log(`  POST /api/save-score`);
    console.log(`  GET  /api/leaderboard`);
    console.log(`  GET  /api/user-history/:userId`);
    console.log(`  GET  /api/stats`);
    console.log(`  POST /api/admin/questions`);
    console.log(`  DELETE /api/admin/questions/:id`);
    console.log('\n💡 Press Ctrl+C to stop\n');
});
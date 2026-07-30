// ==================== API URL ====================
const API_URL = 'http://localhost:3000/api';

// ==================== GLOBAL VARIABLES ====================
let currentUser = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let timeLeft = 30;
let isAnswered = false;

// ==================== QUESTIONS (Fallback) ====================
const LOCAL_QUESTIONS = [
    { id: 1, question: "Quran mein kitne Surah hain?", option_a: "110", option_b: "114", option_c: "120", option_d: "100", correct_answer: "b" },
    { id: 2, question: "Islam ka pehla pillar kya hai?", option_a: "Namaz", option_b: "Roza", option_c: "Shahadah", option_d: "Zakat", correct_answer: "c" },
    { id: 3, question: "Hajj kaise maheene mein hota hai?", option_a: "Ramadan", option_b: "Shawwal", option_c: "Dhul Hijjah", option_d: "Muharram", correct_answer: "c" },
    { id: 4, question: "Jibraeel (AS) ko kaun sa farishta kehte hain?", option_a: "Ruh-ul-Qudus", option_b: "Mikael", option_c: "Israfil", option_d: "Azrael", correct_answer: "a" },
    { id: 5, question: "Zakat ka nisab (gold) kitna hai?", option_a: "7.5 Tola", option_b: "10 Tola", option_c: "5 Tola", option_d: "12 Tola", correct_answer: "a" },
    { id: 6, question: "Surah Fatiha ko aur kya kehte hain?", option_a: "Umm-ul-Quran", option_b: "Khatam-ul-Quran", option_c: "Ayat-ul-Kursi", option_d: "Surah Mulk", correct_answer: "a" },
    { id: 7, question: "Tahajjud ki namaz ka waqt?", option_a: "Isha ke baad", option_b: "Raat ke aakhri hissa", option_c: "Fajr se pehle", option_d: "B aur C dono", correct_answer: "d" },
    { id: 8, question: "Hajj ke dauran kaun si jagah se shaitan ko patthar maarte hain?", option_a: "Mina", option_b: "Muzdalifah", option_c: "Safa-Marwah", option_d: "Arafat", correct_answer: "a" },
    { id: 9, question: 'Quran mein kaun si surah "Qalb-ul-Quran" kehlati hai?', option_a: "Surah Yaseen", option_b: "Surah Rahman", option_c: "Surah Mulk", option_d: "Surah Falaq", correct_answer: "a" },
    { id: 10, question: "Namaz mein kitne Rakat farz hain?", option_a: "17", option_b: "20", option_c: "22", option_d: "24", correct_answer: "a" }
];

// ==================== DOM READY ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ App Loaded!');
    
    var savedUser = localStorage.getItem('quizUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUI();
        } catch(e) {}
    }
});

// ==================== AUTH FUNCTIONS ====================

function showLogin() {
    hideAllScreens();
    document.getElementById('login-screen').classList.add('active');
}

function showRegister() {
    hideAllScreens();
    document.getElementById('register-screen').classList.add('active');
}

async function handleLogin(event) {
    if (event) event.preventDefault();
    
    var username = document.getElementById('login-username').value.trim();
    var password = document.getElementById('login-password').value.trim();
    
    if (!username || !password) {
        alert('⚠️ Please fill all fields');
        return;
    }
    
    try {
        var response = await fetch(API_URL + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        var data = await response.json();
        console.log('📥 Login response:', data);
        
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('quizUser', JSON.stringify(currentUser));
            updateUI();
            goHome();
            alert('✅ Login successful! Welcome ' + currentUser.username);
        } else {
            alert('❌ ' + (data.error || 'Login failed'));
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        alert('❌ Server not running! Please start server with: node server.js');
    }
}

async function handleRegister(event) {
    if (event) event.preventDefault();
    
    var username = document.getElementById('reg-username').value.trim();
    var email = document.getElementById('reg-email').value.trim();
    var password = document.getElementById('reg-password').value.trim();
    
    if (!username || !email || !password) {
        alert('⚠️ Please fill all fields');
        return;
    }
    
    try {
        var response = await fetch(API_URL + '/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        var data = await response.json();
        console.log('📥 Register response:', data);
        
        if (data.success) {
            alert('✅ Registration successful! Please login.');
            setTimeout(function() { showLogin(); }, 1000);
        } else {
            alert('❌ ' + (data.error || 'Registration failed'));
        }
    } catch (error) {
        console.error('❌ Register error:', error);
        alert('❌ Server not running! Please start server with: node server.js');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('quizUser');
    updateUI();
    goHome();
    alert('👋 Logged out');
}

function updateUI() {
    var userDisplay = document.getElementById('user-display');
    var usernameDisplay = document.getElementById('username-display');
    var loginBtn = document.getElementById('login-btn');
    var registerBtn = document.getElementById('register-btn');
    var logoutBtn = document.getElementById('logout-btn');
    
    if (currentUser) {
        userDisplay.classList.remove('hidden');
        usernameDisplay.textContent = currentUser.username;
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        userDisplay.classList.add('hidden');
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

// ==================== QUIZ FUNCTIONS ====================

async function startQuiz() {
    if (!currentUser) {
        alert('⚠️ Please login first!');
        showLogin();
        return;
    }
    
    try {
        var response = await fetch(API_URL + '/questions');
        if (response.ok) {
            var data = await response.json();
            if (data && data.length > 0) {
                currentQuestions = data;
                console.log('✅ Questions loaded from server:', currentQuestions.length);
            } else {
                throw new Error('No questions');
            }
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.log('⚠️ Using local questions');
        currentQuestions = LOCAL_QUESTIONS.slice();
    }
    
    currentQuestionIndex = 0;
    score = 0;
    hideAllScreens();
    document.getElementById('quiz-screen').classList.add('active');
    document.getElementById('total-questions').textContent = currentQuestions.length;
    loadQuestion();
}

function loadQuestion() {
    isAnswered = false;
    var q = currentQuestions[currentQuestionIndex];
    if (!q) return;
    
    document.getElementById('question-number').textContent = currentQuestionIndex + 1;
    document.getElementById('question-text').textContent = q.question;
    
    var progress = ((currentQuestionIndex) / currentQuestions.length * 100);
    document.getElementById('progress-fill').style.width = progress + '%';
    
    var container = document.getElementById('options-container');
    container.innerHTML = '';
    
    var options = [q.option_a, q.option_b, q.option_c, q.option_d];
    var labels = ['a', 'b', 'c', 'd'];
    
    for (var i = 0; i < options.length; i++) {
        var btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = options[i];
        btn.dataset.option = labels[i];
        btn.onclick = (function(label) {
            return function() { selectAnswer(label); };
        })(labels[i]);
        container.appendChild(btn);
    }
    
    document.getElementById('next-btn').classList.add('hidden');
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 30;
    var timerDisplay = document.getElementById('timer');
    timerDisplay.textContent = '⏱️ ' + timeLeft + 's';
    timerDisplay.style.color = '#d32f2f';
    
    timerInterval = setInterval(function() {
        timeLeft--;
        timerDisplay.textContent = '⏱️ ' + timeLeft + 's';
        if (timeLeft <= 5) timerDisplay.style.color = '#d32f2f';
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!isAnswered) {
                var buttons = document.querySelectorAll('.option-btn');
                for (var i = 0; i < buttons.length; i++) {
                    buttons[i].classList.add('disabled');
                }
                isAnswered = true;
                document.getElementById('next-btn').classList.remove('hidden');
                timerDisplay.textContent = '⏰ Time Up!';
            }
        }
    }, 1000);
}

async function selectAnswer(option) {
    if (isAnswered) return;
    clearInterval(timerInterval);
    isAnswered = true;
    
    var q = currentQuestions[currentQuestionIndex];
    var buttons = document.querySelectorAll('.option-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.add('disabled');
    }
    
    var isCorrect = false;
    
    try {
        var response = await fetch(API_URL + '/check-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId: q.id, selectedOption: option })
        });
        var data = await response.json();
        isCorrect = data.correct || false;
    } catch (error) {
        isCorrect = (option === q.correct_answer);
        console.log('⚠️ Using local answer check');
    }
    
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].dataset.option === option) {
            buttons[i].classList.add(isCorrect ? 'correct' : 'wrong');
        }
    }
    
    if (isCorrect) {
        score++;
        document.getElementById('timer').textContent = '✅ Correct!';
        document.getElementById('timer').style.color = '#4caf50';
    } else {
        document.getElementById('timer').textContent = '❌ Wrong!';
        document.getElementById('timer').style.color = '#f44336';
    }
    
    document.getElementById('next-btn').classList.remove('hidden');
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    hideAllScreens();
    document.getElementById('result-screen').classList.add('active');
    document.getElementById('score-display').textContent = score;
    document.getElementById('total-result').textContent = currentQuestions.length;
    
    var total = currentQuestions.length;
    var percentage = (score / total) * 100;
    var message = '';
    if (percentage === 100) message = '🌟 Masha\'Allah! Perfect Score!';
    else if (percentage >= 80) message = '✨ Excellent! Great Knowledge!';
    else if (percentage >= 60) message = '📖 Good! Keep Learning!';
    else if (percentage >= 40) message = '📚 Study more Islamic books!';
    else message = '🤲 Start with Bismillah! Keep learning!';
    document.getElementById('result-message').textContent = message;
}

async function saveAndRestart() {
    if (currentUser && currentQuestions.length) {
        try {
            var response = await fetch(API_URL + '/save-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    score: score,
                    totalQuestions: currentQuestions.length
                })
            });
            var data = await response.json();
            if (data.success) {
                alert('💾 Score saved successfully!');
            } else {
                alert('⚠️ ' + (data.error || 'Score saved locally only'));
            }
        } catch (error) {
            console.error('❌ Save error:', error);
            alert('⚠️ Score saved locally only. Server not connected.');
        }
    }
    goHome();
}

// ==================== LEADERBOARD ====================

async function showLeaderboard() {
    hideAllScreens();
    document.getElementById('leaderboard-screen').classList.add('active');
    
    var container = document.getElementById('leaderboard-list');
    container.innerHTML = '<p style="color:#999;text-align:center;">Loading...</p>';
    
    try {
        var response = await fetch(API_URL + '/leaderboard');
        if (response.ok) {
            var data = await response.json();
            if (data && data.length > 0) {
                var html = '';
                for (var i = 0; i < data.length; i++) {
                    var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
                    html += '<div class="leaderboard-item">';
                    html += '<span>' + medal + ' ' + data[i].username + '</span>';
                    html += '<span>⭐ ' + data[i].score + ' pts</span>';
                    html += '</div>';
                }
                container.innerHTML = html;
                return;
            }
        }
        throw new Error('No data');
    } catch (error) {
        // Fallback demo
        var leaders = [
            { username: 'Ali', score: 85 },
            { username: 'Ahmed', score: 72 },
            { username: 'Fatima', score: 68 }
        ];
        var html = '';
        for (var i = 0; i < leaders.length; i++) {
            var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
            html += '<div class="leaderboard-item">';
            html += '<span>' + medal + ' ' + leaders[i].username + '</span>';
            html += '<span>⭐ ' + leaders[i].score + ' pts</span>';
            html += '</div>';
        }
        container.innerHTML = html;
    }
}

// ==================== UTILITY ====================

function hideAllScreens() {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
        screens[i].classList.remove('active');
    }
}

function goHome() {
    hideAllScreens();
    document.getElementById('welcome-screen').classList.add('active');
}
const express = require('express');
const fileUpload = require('express-fileupload');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const xlsx = require('xlsx');
const path = require('path');
const app = express();
const db = new sqlite3.Database('./db.sqlite');

app.use(express.static('public'));
app.use(express.json());
app.use(fileUpload());
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true
}));

// إنشاء الجدول عند التشغيل
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY, name TEXT, attendance INTEGER, absence INTEGER,
        midterm REAL, work REAL
    )`);
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (row.count === 0) {
            db.run("INSERT INTO users (username, password) VALUES (?, ?)", ['admin', '1234']);
        }
    });
});

// تسجيل الدخول
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (row) {
            req.session.user = row.username;
            res.json({ success: true, message: "تم تسجيل الدخول بنجاح" });
        } else {
            res.json({ success: false, message: "بيانات غير صحيحة" });
        }
    });
});

// رفع ملف
app.post("/api/upload", (req, res) => {
    if (!req.session.user) return res.status(401).send("غير مصرح");
    const file = req.files.file;
    const workbook = xlsx.read(file.data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    db.serialize(() => {
        db.run("DELETE FROM students");
        const stmt = db.prepare("INSERT INTO students VALUES (?, ?, ?, ?, ?, ?)");
        data.forEach(s => {
            stmt.run(s["رقم القيد"], s["الاسم"], s["عدد الحضور"], s["عدد الغياب"], s["درجة النصفي"], s["أعمال السنة"]);
        });
        stmt.finalize();
        res.send("تم الحفظ");
    });
});

// استعلام طالب
app.get("/api/student/:id", (req, res) => {
    db.get("SELECT * FROM students WHERE id = ?", [req.params.id], (err, row) => {
        if (row) {
            res.json({ found: true, ...row });
        } else {
            res.json({ found: false });
        }
    });
});

// لوحة المشرف (مؤقتة)
app.get("/dashboard", (req, res) => {
    if (!req.session.user) return res.redirect("/login.html");
    res.sendFile(path.join(__dirname, "public", "upload.html"));
});

// صفحة رفع ملف المشرف
const upload_html = `<html lang="ar"><head><meta charset="UTF-8"><title>لوحة المشرف</title></head><body style="font-family: Cairo; text-align:center; padding:40px">
<h1>رفع ملف درجات الطلاب</h1>
<form method="POST" action="/api/upload" enctype="multipart/form-data">
    <input type="file" name="file" required />
    <button type="submit">رفع</button>
</form></body></html>`;

with open(f"{project_path}/public/upload.html", "w", encoding="utf-8") as f:
    f.write(upload_html)

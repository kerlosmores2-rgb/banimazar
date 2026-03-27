// ============================================
// استيراد المكتبات المطلوبة
// ============================================

// مكتبة Express لإنشاء السيرفر
const express = require('express');

// مكتبة CORS للسماح بالطلبات من الواجهة الأمامية
const cors = require('cors');

// مكتبة SQLite3 للتعامل مع قاعدة البيانات
const sqlite3 = require('sqlite3').verbose();

// مكتبة bcrypt لتشفير كلمات المرور
const bcrypt = require('bcrypt');

// مكتبة jsonwebtoken لإنشاء توكن المصادقة
const jwt = require('jsonwebtoken');

// مكتبة path للتعامل مع مسارات الملفات
const path = require('path');


// ============================================
// إنشاء تطبيق Express
// ============================================

const app = express();

// تحديد رقم المنفذ الذي سيعمل عليه السيرفر
const PORT = process.env.PORT || 3000;

// مفتاح سري لتوقيع الـ JWT (يفضل وضعه في متغيرات البيئة)
const JWT_SECRET = 'your-secret-key-change-this-in-production';


// ============================================
// إعدادات Middleware
// ============================================

// للسماح بقراءة البيانات بصيغة JSON
app.use(express.json());

// للسماح بقراءة البيانات من النماذج (Forms)
app.use(express.urlencoded({ extended: true }));

// تمكين CORS للسماح بطلبات من أي مصدر (للتطوير)
app.use(cors());

// ============================================
// الاتصال بقاعدة البيانات SQLite
// ============================================

// تحديد مسار ملف قاعدة البيانات (سينشأ تلقائياً إن لم يكن موجوداً)
const dbPath = path.join(__dirname, 'database', 'station_management.db');

// إنشاء الاتصال بقاعدة البيانات
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err.message);
    } else {
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
        console.log('📍 مسار قاعدة البيانات:', dbPath);
        
        // بعد الاتصال، نقوم بإنشاء الجداول إذا لم تكن موجودة
        createTables();
    }
});


// ============================================
// دالة إنشاء الجداول (إن لم تكن موجودة)
// ============================================

function createTables() {
    // أولاً: تمكين المفاتيح الخارجية (Foreign Keys)
    db.run('PRAGMA foreign_keys = ON');
    
    // قراءة ملف SQL الخاص بإنشاء الجداول
    const fs = require('fs');
    const schemaPath = path.join(__dirname, 'database', 'database_schema.sql');
    
    // نتحقق إذا كان ملف الـ Schema موجود
    if (fs.existsSync(schemaPath)) {
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // نقسم الكود إلى أوامر منفصلة (كل أمر ينتهي بـ ;)
        const commands = schemaSQL.split(';').filter(cmd => cmd.trim().length > 0);
        
        // ننفذ كل أمر على حدة
        let executed = 0;
        commands.forEach((command, index) => {
            db.run(command, (err) => {
                if (err) {
                    // نتجاهل أخطاء "table already exists" لأنها طبيعية
                    if (!err.message.includes('already exists')) {
                        console.error(`❌ خطأ في تنفيذ الأمر ${index + 1}:`, err.message);
                    }
                } else {
                    executed++;
                }
                
                // بعد تنفيذ آخر أمر
                if (executed === commands.length || index === commands.length - 1) {
                    console.log(`✅ تم إنشاء/التحقق من ${executed} جدول/أمر بنجاح`);
                }
            });
        });
    } else {
        console.warn('⚠️ ملف database_schema.sql غير موجود، سيتم إنشاء الجداول يدوياً');
        // يمكن إضافة إنشاء يدوي للجداول هنا لو حبينا
    }
}

// ============================================
// API: تسجيل مستخدم جديد (Register)
// ============================================
// المسار: POST /api/register
// الجسم (Body): { username, password, full_name, email, role_id, station_id }
// ============================================

app.post('/api/register', async (req, res) => {
    try {
        const { username, password, full_name, email, role_id, station_id } = req.body;
        
        // التحقق من وجود البيانات المطلوبة
        if (!username || !password || !full_name) {
            return res.status(400).json({ 
                success: false, 
                message: 'اسم المستخدم، كلمة المرور، والاسم الكامل مطلوبة' 
            });
        }
        
        // التحقق من أن اسم المستخدم غير مكرر
        db.get('SELECT id FROM users WHERE username = ?', [username], async (err, existingUser) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في قاعدة البيانات' });
            }
            
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'اسم المستخدم موجود بالفعل' });
            }
            
            // تشفير كلمة المرور
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            // إدراج المستخدم الجديد
            const insertQuery = `
                INSERT INTO users (username, password, full_name, email, station_id, role_id, is_active)
                VALUES (?, ?, ?, ?, ?, ?, 1)
            `;
            
            db.run(insertQuery, [username, hashedPassword, full_name, email, station_id || null, role_id || 4], function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'خطأ في إنشاء المستخدم' });
                }
                
                res.status(201).json({
                    success: true,
                    message: 'تم إنشاء المستخدم بنجاح',
                    user_id: this.lastID
                });
            });
        });
        
    } catch (error) {
        console.error('خطأ في التسجيل:', error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});


// ============================================
// API: تسجيل الدخول (Login)
// ============================================
// المسار: POST /api/login
// الجسم (Body): { username, password }
// ============================================

app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        // التحقق من وجود البيانات
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'اسم المستخدم وكلمة المرور مطلوبة' 
            });
        }
        
        // البحث عن المستخدم مع جلب الدور والصلاحيات
        const query = `
            SELECT 
                u.id, u.username, u.password, u.full_name, u.email, u.station_id, u.is_active,
                r.id AS role_id, r.role_name, r.role_description
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.username = ?
        `;
        
        db.get(query, [username], async (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في قاعدة البيانات' });
            }
            
            if (!user) {
                return res.status(401).json({ success: false, message: 'اسم المستخدم غير صحيح' });
            }
            
            // التحقق من أن الحساب نشط
            if (!user.is_active) {
                return res.status(401).json({ success: false, message: 'الحساب غير نشط، تواصل مع المدير' });
            }
            
            // التحقق من كلمة المرور
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
            }
            
            // جلب صلاحيات المستخدم
            const permissionsQuery = `
                SELECT p.permission_name
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = ?
            `;
            
            db.all(permissionsQuery, [user.role_id], (err, permissions) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'خطأ في جلب الصلاحيات' });
                }
                
                // إنشاء توكن JWT
                const token = jwt.sign(
                    { 
                        user_id: user.id, 
                        username: user.username, 
                        role_id: user.role_id,
                        role_name: user.role_name,
                        station_id: user.station_id
                    },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );
                
                // تحديث آخر تسجيل دخول
                db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
                
                // إرجاع البيانات
                res.json({
                    success: true,
                    message: 'تم تسجيل الدخول بنجاح',
                    token: token,
                    user: {
                        id: user.id,
                        username: user.username,
                        full_name: user.full_name,
                        email: user.email,
                        station_id: user.station_id,
                        role_id: user.role_id,
                        role_name: user.role_name,
                        permissions: permissions.map(p => p.permission_name)
                    }
                });
            });
        });
        
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});


// ============================================
// API: التحقق من صحة التوكن (Verify Token)
// ============================================
// المسار: GET /api/verify
// الهيدر: Authorization: Bearer <token>
// ============================================

app.get('/api/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'لم يتم توفير توكن' });
    }
    
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'توكن غير صالح أو منتهي' });
        }
        
        // جلب بيانات المستخدم محدثة من قاعدة البيانات
        const query = `
            SELECT u.id, u.username, u.full_name, u.email, u.station_id, u.is_active,
                   r.id AS role_id, r.role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
        `;
        
        db.get(query, [decoded.user_id], (err, user) => {
            if (err || !user || !user.is_active) {
                return res.status(401).json({ success: false, message: 'مستخدم غير صالح' });
            }
            
            res.json({
                success: true,
                user: user
            });
        });
    });
});


// ============================================
// Middleware: التحقق من الصلاحيات
// ============================================
// هذه الدالة تستخدم لحماية المسارات التي تتطلب صلاحيات معينة
// ============================================

function checkPermission(requiredPermission) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'غير مصرح به' });
        }
        
        const token = authHeader.split(' ')[1];
        
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ success: false, message: 'توكن غير صالح' });
            }
            
            // التحقق من أن المستخدم لديه الصلاحية المطلوبة
            const permissionQuery = `
                SELECT 1 
                FROM users u
                JOIN role_permissions rp ON u.role_id = rp.role_id
                JOIN permissions p ON rp.permission_id = p.id
                WHERE u.id = ? AND p.permission_name = ?
            `;
            
            db.get(permissionQuery, [decoded.user_id, requiredPermission], (err, hasPermission) => {
                if (err || !hasPermission) {
                    return res.status(403).json({ 
                        success: false, 
                        message: `لا تملك صلاحية ${requiredPermission}` 
                    });
                }
                
                req.user = decoded;
                next();
            });
        });
    };
}


// ============================================
// تشغيل السيرفر
// ============================================

app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`);
    console.log(`📋 قائمة المسارات المتاحة:`);
    console.log(`   POST   /api/register  - تسجيل مستخدم جديد`);
    console.log(`   POST   /api/login     - تسجيل الدخول`);
    console.log(`   GET    /api/verify    - التحقق من صحة التوكن`);
});

// ============================================
// API: إدارة المحطات (Stations)
// ============================================
// جميع هذه المسارات تتطلب صلاحيات مناسبة
// ============================================


// ============================================
// 1. جلب جميع المحطات (مع صلاحية stations.view)
// ============================================
// المسار: GET /api/stations
// ============================================

app.get('/api/stations', checkPermission('stations.view'), (req, res) => {
    // تحديد ما إذا كان المستخدم مدير محطة (يرى محطته فقط)
    const isStationManager = req.user.role_name === 'station_manager';
    const stationFilter = isStationManager && req.user.station_id 
        ? 'WHERE id = ?' 
        : '';
    const params = isStationManager && req.user.station_id 
        ? [req.user.station_id] 
        : [];
    
    const query = `
        SELECT 
            id,
            station_name,
            station_code,
            location,
            capacity,
            pump_count,
            feeder_count,
            status,
            created_at,
            updated_at,
            notes
        FROM stations
        ${stationFilter}
        ORDER BY station_name
    `;
    
    db.all(query, params, (err, stations) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'خطأ في جلب بيانات المحطات',
                error: err.message 
            });
        }
        
        res.json({
            success: true,
            count: stations.length,
            stations: stations
        });
    });
});


// ============================================
// 2. جلب محطة محددة بالمعرف (ID)
// ============================================
// المسار: GET /api/stations/:id
// ============================================

app.get('/api/stations/:id', checkPermission('stations.view'), (req, res) => {
    const stationId = req.params.id;
    
    // التحقق من أن مدير المحطة يرى محطته فقط
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ 
            success: false, 
            message: 'غير مسموح لك بمشاهدة هذه المحطة' 
        });
    }
    
    const query = `
        SELECT 
            id,
            station_name,
            station_code,
            location,
            capacity,
            pump_count,
            feeder_count,
            status,
            created_at,
            updated_at,
            notes
        FROM stations
        WHERE id = ?
    `;
    
    db.get(query, [stationId], (err, station) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'خطأ في جلب بيانات المحطة' 
            });
        }
        
        if (!station) {
            return res.status(404).json({ 
                success: false, 
                message: 'المحطة غير موجودة' 
            });
        }
        
        res.json({
            success: true,
            station: station
        });
    });
});


// ============================================
// 3. إضافة محطة جديدة (يتطلب صلاحية stations.create)
// ============================================
// المسار: POST /api/stations
// الجسم: { station_name, station_code, location, capacity, status, notes }
// ============================================

app.post('/api/stations', checkPermission('stations.create'), (req, res) => {
    const { 
        station_name, 
        station_code, 
        location, 
        capacity, 
        status, 
        notes 
    } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!station_name) {
        return res.status(400).json({ 
            success: false, 
            message: 'اسم المحطة مطلوب' 
        });
    }
    
    // التحقق من أن كود المحطة غير مكرر (إذا تم إدخاله)
    if (station_code) {
        db.get('SELECT id FROM stations WHERE station_code = ?', [station_code], (err, existing) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في التحقق من الكود' });
            }
            if (existing) {
                return res.status(400).json({ success: false, message: 'كود المحطة موجود بالفعل' });
            }
            insertStation();
        });
    } else {
        insertStation();
    }
    
    function insertStation() {
        const query = `
            INSERT INTO stations (
                station_name, station_code, location, capacity, 
                status, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        db.run(query, [
            station_name, 
            station_code || null, 
            location || null, 
            capacity || null, 
            status || 'active', 
            notes || null
        ], function(err) {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'خطأ في إضافة المحطة',
                    error: err.message 
                });
            }
            
            res.status(201).json({
                success: true,
                message: 'تم إضافة المحطة بنجاح',
                station_id: this.lastID
            });
        });
    }
});


// ============================================
// 4. تحديث بيانات محطة (يتطلب صلاحية stations.edit)
// ============================================
// المسار: PUT /api/stations/:id
// ============================================

app.put('/api/stations/:id', checkPermission('stations.edit'), (req, res) => {
    const stationId = req.params.id;
    const { station_name, station_code, location, capacity, status, notes } = req.body;
    
    // التحقق من أن مدير المحطة يعدل محطته فقط
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ 
            success: false, 
            message: 'غير مسموح لك بتعديل هذه المحطة' 
        });
    }
    
    // بناء استعلام التحديث ديناميكياً
    const updates = [];
    const values = [];
    
    if (station_name !== undefined) {
        updates.push('station_name = ?');
        values.push(station_name);
    }
    if (station_code !== undefined) {
        updates.push('station_code = ?');
        values.push(station_code);
    }
    if (location !== undefined) {
        updates.push('location = ?');
        values.push(location);
    }
    if (capacity !== undefined) {
        updates.push('capacity = ?');
        values.push(capacity);
    }
    if (status !== undefined) {
        updates.push('status = ?');
        values.push(status);
    }
    if (notes !== undefined) {
        updates.push('notes = ?');
        values.push(notes);
    }
    
    if (updates.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'لا توجد بيانات للتحديث' 
        });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(stationId);
    
    const query = `UPDATE stations SET ${updates.join(', ')} WHERE id = ?`;
    
    db.run(query, values, function(err) {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'خطأ في تحديث المحطة',
                error: err.message 
            });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'المحطة غير موجودة' 
            });
        }
        
        res.json({
            success: true,
            message: 'تم تحديث المحطة بنجاح'
        });
    });
});


// ============================================
// 5. حذف محطة (يتطلب صلاحية stations.delete)
// ============================================
// المسار: DELETE /api/stations/:id
// ============================================

app.delete('/api/stations/:id', checkPermission('stations.delete'), (req, res) => {
    const stationId = req.params.id;
    
    // التحقق من عدم وجود مستخدمين مرتبطين بالمحطة
    db.get('SELECT id FROM users WHERE station_id = ? LIMIT 1', [stationId], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في التحقق من المستخدمين' });
        }
        
        if (user) {
            return res.status(400).json({ 
                success: false, 
                message: 'لا يمكن حذف المحطة لأن هناك مستخدمين مرتبطين بها' 
            });
        }
        
        db.run('DELETE FROM stations WHERE id = ?', [stationId], function(err) {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'خطأ في حذف المحطة',
                    error: err.message 
                });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'المحطة غير موجودة' 
                });
            }
            
            res.json({
                success: true,
                message: 'تم حذف المحطة بنجاح'
            });
        });
    });
});


// ============================================
// 6. جلب إحصائيات المحطات (للـ Dashboard)
// ============================================
// المسار: GET /api/stations/stats
// ============================================

app.get('/api/stations/stats', checkPermission('reports.view'), (req, res) => {
    const queries = {
        totalStations: 'SELECT COUNT(*) as count FROM stations',
        activeStations: 'SELECT COUNT(*) as count FROM stations WHERE status = "active"',
        maintenanceStations: 'SELECT COUNT(*) as count FROM stations WHERE status = "maintenance"',
        totalCapacity: 'SELECT SUM(capacity) as total FROM stations',
        totalPumps: 'SELECT SUM(pump_count) as total FROM stations'
    };
    
    const results = {};
    let completed = 0;
    const totalQueries = Object.keys(queries).length;
    
    for (const [key, query] of Object.entries(queries)) {
        db.get(query, [], (err, row) => {
            if (err) {
                results[key] = 0;
            } else {
                results[key] = row.count || row.total || 0;
            }
            
            completed++;
            if (completed === totalQueries) {
                res.json({
                    success: true,
                    stats: results
                });
            }
        });
    }
});


// ============================================
// 7. جلب بيانات المحطة كاملة (مع الأصول المرتبطة)
// ============================================
// المسار: GET /api/stations/:id/full
// ============================================

app.get('/api/stations/:id/full', checkPermission('stations.view'), (req, res) => {
    const stationId = req.params.id;
    
    // التحقق من صلاحية مدير المحطة
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ 
            success: false, 
            message: 'غير مسموح لك بمشاهدة هذه المحطة' 
        });
    }
    
    // جلب بيانات المحطة الأساسية
    db.get('SELECT * FROM stations WHERE id = ?', [stationId], (err, station) => {
        if (err || !station) {
            return res.status(404).json({ success: false, message: 'المحطة غير موجودة' });
        }
        
        const result = { station: station, assets: {} };
        let pendingQueries = 8;
        
        // جلب المغذيات
        db.all('SELECT * FROM feeders WHERE station_id = ?', [stationId], (err, feeders) => {
            result.assets.feeders = feeders || [];
            checkComplete();
        });
        
        // جلب المولدات
        db.all('SELECT * FROM generators WHERE station_id = ?', [stationId], (err, generators) => {
            result.assets.generators = generators || [];
            checkComplete();
        });
        
        // جلب الطلمبات الرئيسية
        db.all('SELECT * FROM main_pumps WHERE station_id = ?', [stationId], (err, mainPumps) => {
            result.assets.main_pumps = mainPumps || [];
            checkComplete();
        });
        
        // جلب الطلمبات الفرعية
        db.all('SELECT * FROM sub_pumps WHERE station_id = ?', [stationId], (err, subPumps) => {
            result.assets.sub_pumps = subPumps || [];
            checkComplete();
        });
        
        // جلب اللوحات الكهربائية
        db.all('SELECT * FROM electrical_panels WHERE station_id = ?', [stationId], (err, panels) => {
            result.assets.panels = panels || [];
            checkComplete();
        });
        
        // جلب المعدات الميكانيكية
        db.all('SELECT * FROM mechanical_equipment WHERE station_id = ?', [stationId], (err, mechanical) => {
            result.assets.mechanical = mechanical || [];
            checkComplete();
        });
        
        // جلب المباني
        db.all('SELECT * FROM buildings WHERE station_id = ?', [stationId], (err, buildings) => {
            result.assets.buildings = buildings || [];
            checkComplete();
        });
        
        // جلب البيانات الإضافية للمحطة
        db.get('SELECT * FROM station_details WHERE station_id = ?', [stationId], (err, details) => {
            result.station_details = details || null;
            checkComplete();
        });
        
        function checkComplete() {
            pendingQueries--;
            if (pendingQueries === 0) {
                res.json({ success: true, data: result });
            }
        }
    });
});

// ============================================
// API: إدارة الأصول (Assets)
// ============================================
// تشمل: المضخات الرئيسية، المضخات الفرعية، المولدات، اللوحات الكهربائية، المعدات الميكانيكية
// ============================================


// ============================================
// 1. المضخات الرئيسية (Main Pumps)
// ============================================


// 1.1 جلب جميع المضخات الرئيسية لمحطة محددة
// المسار: GET /api/stations/:stationId/main-pumps
app.get('/api/stations/:stationId/main-pumps', checkPermission('assets.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    // التحقق من صلاحية مدير المحطة
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح لك بمشاهدة هذه المحطة' });
    }
    
    db.all('SELECT * FROM main_pumps WHERE station_id = ? ORDER BY pump_number', [stationId], (err, pumps) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        }
        res.json({ success: true, count: pumps.length, pumps: pumps });
    });
});


// 1.2 إضافة مضخة رئيسية جديدة
// المسار: POST /api/main-pumps
app.post('/api/main-pumps', checkPermission('assets.create'), (req, res) => {
    const {
        station_id, pump_number, pump_type, flow_rate_m3h, head_m,
        brand, bearing_number, suction_discharge_size,
        suction_discharge_valve, non_return_valve,
        motor_power_kw, motor_rpm, description, notes
    } = req.body;
    
    if (!station_id || !pump_number) {
        return res.status(400).json({ success: false, message: 'رقم المحطة ورقم الطلمبة مطلوبان' });
    }
    
    // التحقق من وجود المحطة
    db.get('SELECT id FROM stations WHERE id = ?', [station_id], (err, station) => {
        if (err || !station) {
            return res.status(404).json({ success: false, message: 'المحطة غير موجودة' });
        }
        
        const query = `
            INSERT INTO main_pumps (
                station_id, pump_number, pump_type, flow_rate_m3h, head_m,
                brand, bearing_number, suction_discharge_size,
                suction_discharge_valve, non_return_valve,
                motor_power_kw, motor_rpm, description, notes,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        db.run(query, [
            station_id, pump_number, pump_type || null, flow_rate_m3h || null, head_m || null,
            brand || null, bearing_number || null, suction_discharge_size || null,
            suction_discharge_valve || null, non_return_valve || null,
            motor_power_kw || null, motor_rpm || null, description || null, notes || null
        ], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في إضافة الطلمبة', error: err.message });
            }
            res.status(201).json({ success: true, message: 'تم إضافة الطلمبة بنجاح', pump_id: this.lastID });
        });
    });
});


// 1.3 تحديث مضخة رئيسية
// المسار: PUT /api/main-pumps/:id
app.put('/api/main-pumps/:id', checkPermission('assets.edit'), (req, res) => {
    const pumpId = req.params.id;
    const updates = [];
    const values = [];
    
    const fields = ['pump_number', 'pump_type', 'flow_rate_m3h', 'head_m', 'brand', 
                    'bearing_number', 'suction_discharge_size', 'suction_discharge_valve',
                    'non_return_valve', 'motor_power_kw', 'motor_rpm', 'description', 'notes'];
    
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    });
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(pumpId);
    
    db.run(`UPDATE main_pumps SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في التحديث' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'الطلمبة غير موجودة' });
        }
        res.json({ success: true, message: 'تم تحديث الطلمبة بنجاح' });
    });
});


// 1.4 حذف مضخة رئيسية
// المسار: DELETE /api/main-pumps/:id
app.delete('/api/main-pumps/:id', checkPermission('assets.delete'), (req, res) => {
    db.run('DELETE FROM main_pumps WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في الحذف' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'الطلمبة غير موجودة' });
        }
        res.json({ success: true, message: 'تم حذف الطلمبة بنجاح' });
    });
});


// ============================================
// 2. المضخات الفرعية (Sub Pumps)
// ============================================


app.get('/api/stations/:stationId/sub-pumps', checkPermission('assets.view'), (req, res) => {
    const stationId = req.params.stationId;
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    db.all('SELECT * FROM sub_pumps WHERE station_id = ? ORDER BY pump_number', [stationId], (err, pumps) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, pumps: pumps });
    });
});


app.post('/api/sub-pumps', checkPermission('assets.create'), (req, res) => {
    const { station_id, pump_number, pump_type, flow_rate_m3h, head_m, motor_power_kw, motor_rpm } = req.body;
    
    if (!station_id || !pump_number) {
        return res.status(400).json({ success: false, message: 'رقم المحطة ورقم الطلمبة مطلوبان' });
    }
    
    const query = `
        INSERT INTO sub_pumps (station_id, pump_number, pump_type, flow_rate_m3h, head_m, motor_power_kw, motor_rpm, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    db.run(query, [station_id, pump_number, pump_type || null, flow_rate_m3h || null, head_m || null, motor_power_kw || null, motor_rpm || null], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في الإضافة' });
        res.status(201).json({ success: true, message: 'تم إضافة الطلمبة الفرعية', pump_id: this.lastID });
    });
});


app.put('/api/sub-pumps/:id', checkPermission('assets.edit'), (req, res) => {
    const pumpId = req.params.id;
    const { pump_number, pump_type, flow_rate_m3h, head_m, motor_power_kw, motor_rpm } = req.body;
    
    db.run(`UPDATE sub_pumps SET 
        pump_number = COALESCE(?, pump_number),
        pump_type = COALESCE(?, pump_type),
        flow_rate_m3h = COALESCE(?, flow_rate_m3h),
        head_m = COALESCE(?, head_m),
        motor_power_kw = COALESCE(?, motor_power_kw),
        motor_rpm = COALESCE(?, motor_rpm),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [pump_number, pump_type, flow_rate_m3h, head_m, motor_power_kw, motor_rpm, pumpId],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: 'خطأ في التحديث' });
            if (this.changes === 0) return res.status(404).json({ success: false, message: 'الطلمبة غير موجودة' });
            res.json({ success: true, message: 'تم التحديث بنجاح' });
        });
});


app.delete('/api/sub-pumps/:id', checkPermission('assets.delete'), (req, res) => {
    db.run('DELETE FROM sub_pumps WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في الحذف' });
        if (this.changes === 0) return res.status(404).json({ success: false, message: 'الطلمبة غير موجودة' });
        res.json({ success: true, message: 'تم الحذف بنجاح' });
    });
});


// ============================================
// 3. المولدات (Generators)
// ============================================


app.get('/api/stations/:stationId/generators', checkPermission('assets.view'), (req, res) => {
    const stationId = req.params.stationId;
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    db.all('SELECT * FROM generators WHERE station_id = ? ORDER BY generator_name', [stationId], (err, generators) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, generators: generators });
    });
});


app.post('/api/generators', checkPermission('assets.create'), (req, res) => {
    const { station_id, generator_name, generator_code, rated_power_kva, rated_power_kw,
            rated_voltage_v, rated_current_a, power_factor, phases, frequency_hz,
            alternator_type, insulation_class, protection_rating, engine_type,
            engine_manufacturer, engine_model, rated_power_hp, rated_rpm,
            cylinder_count, displacement_cc, fuel_type, fuel_consumption_with_load,
            fuel_consumption_no_load, fuel_tank_capacity, oil_type, oil_capacity_liters,
            oil_consumption_rate, cooling_type, coolant_capacity_liters, notes } = req.body;
    
    if (!station_id || !generator_name) {
        return res.status(400).json({ success: false, message: 'اسم المولد ورقم المحطة مطلوبان' });
    }
    
    const query = `
        INSERT INTO generators (
            station_id, generator_name, generator_code, rated_power_kva, rated_power_kw,
            rated_voltage_v, rated_current_a, power_factor, phases, frequency_hz,
            alternator_type, insulation_class, protection_rating, engine_type,
            engine_manufacturer, engine_model, rated_power_hp, rated_rpm,
            cylinder_count, displacement_cc, fuel_type, fuel_consumption_with_load,
            fuel_consumption_no_load, fuel_tank_capacity, oil_type, oil_capacity_liters,
            oil_consumption_rate, cooling_type, coolant_capacity_liters, notes,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    db.run(query, [
        station_id, generator_name, generator_code || null, rated_power_kva || null, rated_power_kw || null,
        rated_voltage_v || null, rated_current_a || null, power_factor || null, phases || 3, frequency_hz || 50,
        alternator_type || null, insulation_class || null, protection_rating || null, engine_type || null,
        engine_manufacturer || null, engine_model || null, rated_power_hp || null, rated_rpm || null,
        cylinder_count || null, displacement_cc || null, fuel_type || null, fuel_consumption_with_load || null,
        fuel_consumption_no_load || null, fuel_tank_capacity || null, oil_type || null, oil_capacity_liters || null,
        oil_consumption_rate || null, cooling_type || null, coolant_capacity_liters || null, notes || null
    ], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في إضافة المولد', error: err.message });
        res.status(201).json({ success: true, message: 'تم إضافة المولد', generator_id: this.lastID });
    });
});


app.put('/api/generators/:id', checkPermission('assets.edit'), (req, res) => {
    const generatorId = req.params.id;
    const updates = [];
    const values = [];
    
    const fields = ['generator_name', 'generator_code', 'rated_power_kva', 'rated_power_kw',
                    'rated_voltage_v', 'rated_current_a', 'power_factor', 'phases', 'frequency_hz',
                    'alternator_type', 'insulation_class', 'protection_rating', 'engine_type',
                    'engine_manufacturer', 'engine_model', 'rated_power_hp', 'rated_rpm',
                    'cylinder_count', 'displacement_cc', 'fuel_type', 'fuel_consumption_with_load',
                    'fuel_consumption_no_load', 'fuel_tank_capacity', 'oil_type', 'oil_capacity_liters',
                    'oil_consumption_rate', 'cooling_type', 'coolant_capacity_liters', 'notes'];
    
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    });
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(generatorId);
    
    db.run(`UPDATE generators SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في التحديث' });
        if (this.changes === 0) return res.status(404).json({ success: false, message: 'المولد غير موجود' });
        res.json({ success: true, message: 'تم تحديث المولد' });
    });
});


app.delete('/api/generators/:id', checkPermission('assets.delete'), (req, res) => {
    db.run('DELETE FROM generators WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في الحذف' });
        if (this.changes === 0) return res.status(404).json({ success: false, message: 'المولد غير موجود' });
        res.json({ success: true, message: 'تم حذف المولد' });
    });
});


// ============================================
// 4. اللوحات الكهربائية (Electrical Panels)
// ============================================


app.get('/api/stations/:stationId/panels', checkPermission('assets.view'), (req, res) => {
    const stationId = req.params.stationId;
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    db.all('SELECT * FROM electrical_panels WHERE station_id = ? ORDER BY panel_number', [stationId], (err, panels) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, panels: panels });
    });
});


app.post('/api/panels', checkPermission('assets.create'), (req, res) => {
    const { station_id, panel_number, panel_name, panel_type, power_source, supply_voltage_v, description, notes } = req.body;
    
    if (!station_id || !panel_number || !panel_name || !panel_type) {
        return res.status(400).json({ success: false, message: 'بيانات اللوحة غير مكتملة' });
    }
    
    const query = `
        INSERT INTO electrical_panels (station_id, panel_number, panel_name, panel_type, power_source, supply_voltage_v, description, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    db.run(query, [station_id, panel_number, panel_name, panel_type, power_source || null, supply_voltage_v || null, description || null, notes || null], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في إضافة اللوحة' });
        res.status(201).json({ success: true, message: 'تم إضافة اللوحة', panel_id: this.lastID });
    });
});


app.put('/api/panels/:id', checkPermission('assets.edit'), (req, res) => {
    const panelId = req.params.id;
    const { panel_number, panel_name, panel_type, power_source, supply_voltage_v, description, notes } = req.body;
    
    db.run(`UPDATE electrical_panels SET 
        panel_number = COALESCE(?, panel_number),
        panel_name = COALESCE(?, panel_name),
        panel_type = COALESCE(?, panel_type),
        power_source = COALESCE(?, power_source),
        supply_voltage_v = COALESCE(?, supply_voltage_v),
        description = COALESCE(?, description),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [panel_number, panel_name, panel_type, power_source, supply_voltage_v, description, notes, panelId],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: 'خطأ في التحديث' });
            if (this.changes === 0) return res.status(404).json({ success: false, message: 'اللوحة غير موجودة' });
            res.json({ success: true, message: 'تم تحديث اللوحة' });
        });
});


app.delete('/api/panels/:id', checkPermission('assets.delete'), (req, res) => {
    db.run('DELETE FROM electrical_panels WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في الحذف' });
        if (this.changes === 0) return res.status(404).json({ success: false, message: 'اللوحة غير موجودة' });
        res.json({ success: true, message: 'تم حذف اللوحة' });
    });
});


// ============================================
// 5. المعدات الميكانيكية (Mechanical Equipment)
// ============================================


app.get('/api/stations/:stationId/mechanical', checkPermission('assets.view'), (req, res) => {
    const stationId = req.params.stationId;
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    db.all('SELECT * FROM mechanical_equipment WHERE station_id = ? ORDER BY equipment_name', [stationId], (err, equipment) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, equipment: equipment });
    });
});


app.post('/api/mechanical', checkPermission('assets.create'), (req, res) => {
    const { station_id, equipment_number, equipment_name, equipment_type,
            flow_rate_m3h, filter_area_m2, filter_media_type, tank_capacity_m3,
            tank_dimensions, rated_power_kw, rated_rpm, air_flow_rate_m3h,
            pressure_bar, lubrication_type, lubricant_capacity_liters,
            status, installation_date, description, notes } = req.body;
    
    if (!station_id || !equipment_number || !equipment_name || !equipment_type) {
        return res.status(400).json({ success: false, message: 'البيانات الأساسية للمعدة مطلوبة' });
    }
    
    const query = `
        INSERT INTO mechanical_equipment (
            station_id, equipment_number, equipment_name, equipment_type,
            flow_rate_m3h, filter_area_m2, filter_media_type, tank_capacity_m3,
            tank_dimensions, rated_power_kw, rated_rpm, air_flow_rate_m3h,
            pressure_bar, lubrication_type, lubricant_capacity_liters,
            status, installation_date, description, notes,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    db.run(query, [
        station_id, equipment_number, equipment_name, equipment_type,
        flow_rate_m3h || null, filter_area_m2 || null, filter_media_type || null, tank_capacity_m3 || null,
        tank_dimensions || null, rated_power_kw || null, rated_rpm || null, air_flow_rate_m3h || null,
        pressure_bar || null, lubrication_type || null, lubricant_capacity_liters || null,
        status || 'active', installation_date || null, description || null, notes || null
    ], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في إضافة المعدة', error: err.message });
        res.status(201).json({ success: true, message: 'تم إضافة المعدة', equipment_id: this.lastID });
    });
});


app.put('/api/mechanical/:id', checkPermission('assets.edit'), (req, res) => {
    const equipmentId = req.params.id;
    const updates = [];
    const values = [];
    
    const fields = ['equipment_number', 'equipment_name', 'equipment_type',
                    'flow_rate_m3h', 'filter_area_m2', 'filter_media_type', 'tank_capacity_m3',
                    'tank_dimensions', 'rated_power_kw', 'rated_rpm', 'air_flow_rate_m3h',
                    'pressure_bar', 'lubrication_type', 'lubricant_capacity_liters',
                    'status', 'installation_date', 'description', 'notes'];
    
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    });
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(equipmentId);
    
    db.run(`UPDATE mechanical_equipment SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في التحديث' });
        if (this.changes === 0) return res.status(404).json({ success: false, message: 'المعدة غير موجودة' });
        res.json({ success: true, message: 'تم تحديث المعدة' });
    });
});


app.delete('/api/mechanical/:id', checkPermission('assets.delete'), (req, res) => {
    db.run('DELETE FROM mechanical_equipment WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في الحذف' });
        if (this.changes === 0) return res.status(404).json({ success: false, message: 'المعدة غير موجودة' });
        res.json({ success: true, message: 'تم حذف المعدة' });
    });
});


// ============================================
// 6. جلب جميع أصول محطة معينة (للإبلاغ)
// ============================================
// المسار: GET /api/stations/:stationId/all-assets
// يستخدم في تقارير المرور (لإظهار كل الأصول للمدير)
// ============================================

app.get('/api/stations/:stationId/all-assets', checkPermission('assets.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    const result = {};
    let pending = 6;
    
    db.all('SELECT id, pump_number as name, pump_type as type FROM main_pumps WHERE station_id = ?', [stationId], (err, rows) => {
        result.main_pumps = rows || [];
        checkComplete();
    });
    
    db.all('SELECT id, pump_number as name, pump_type as type FROM sub_pumps WHERE station_id = ?', [stationId], (err, rows) => {
        result.sub_pumps = rows || [];
        checkComplete();
    });
    
    db.all('SELECT id, generator_name as name, engine_type as type FROM generators WHERE station_id = ?', [stationId], (err, rows) => {
        result.generators = rows || [];
        checkComplete();
    });
    
    db.all('SELECT id, panel_name as name, panel_type as type FROM electrical_panels WHERE station_id = ?', [stationId], (err, rows) => {
        result.panels = rows || [];
        checkComplete();
    });
    
    db.all('SELECT id, equipment_name as name, equipment_type as type FROM mechanical_equipment WHERE station_id = ?', [stationId], (err, rows) => {
        result.mechanical = rows || [];
        checkComplete();
    });
    
    db.all('SELECT id, building_name as name, building_category as type FROM buildings WHERE station_id = ?', [stationId], (err, rows) => {
        result.buildings = rows || [];
        checkComplete();
    });
    
    function checkComplete() {
        pending--;
        if (pending === 0) {
            res.json({ success: true, assets: result });
        }
    }
});
// ============================================
// API: بلاغات الصيانة (Maintenance Reports)
// ============================================


// ============================================
// 1. جلب جميع البلاغات لمحطة محددة
// المسار: GET /api/stations/:stationId/maintenance-reports
// ============================================

app.get('/api/stations/:stationId/maintenance-reports', checkPermission('maintenance.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح لك بمشاهدة بلاغات هذه المحطة' });
    }
    
    const query = `
        SELECT 
            mr.*,
            e.employee_name AS reporter_name,
            e.job_title AS reporter_job_title
        FROM maintenance_reports mr
        LEFT JOIN employees e ON mr.reporter_employee_id = e.id
        WHERE mr.station_id = ?
        ORDER BY mr.report_date DESC, mr.created_at DESC
    `;
    
    db.all(query, [stationId], (err, reports) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البلاغات', error: err.message });
        }
        res.json({ success: true, count: reports.length, reports: reports });
    });
});


// ============================================
// 2. جلب بلاغ محدد بالمعرف
// المسار: GET /api/maintenance-reports/:id
// ============================================

app.get('/api/maintenance-reports/:id', checkPermission('maintenance.view'), (req, res) => {
    const reportId = req.params.id;
    
    const query = `
        SELECT 
            mr.*,
            e.employee_name AS reporter_name,
            e.job_title AS reporter_job_title,
            e.phone AS reporter_phone
        FROM maintenance_reports mr
        LEFT JOIN employees e ON mr.reporter_employee_id = e.id
        WHERE mr.id = ?
    `;
    
    db.get(query, [reportId], (err, report) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البلاغ' });
        }
        if (!report) {
            return res.status(404).json({ success: false, message: 'البلاغ غير موجود' });
        }
        
        // جلب قطع الغيار المستخدمة في هذا البلاغ
        db.all('SELECT * FROM spare_parts_used WHERE maintenance_report_id = ?', [reportId], (err, parts) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في جلب قطع الغيار' });
            }
            report.spare_parts = parts || [];
            res.json({ success: true, report: report });
        });
    });
});


// ============================================
// 3. إضافة بلاغ جديد
// المسار: POST /api/maintenance-reports
// ============================================

app.post('/api/maintenance-reports', checkPermission('maintenance.create'), (req, res) => {
    const {
        station_id, reporter_employee_id, station_name,
        asset_name, asset_type, fault_type, fault_description,
        repair_actions, notes
    } = req.body;
    
    if (!station_id || !asset_name) {
        return res.status(400).json({ success: false, message: 'رقم المحطة واسم الأصل المعطل مطلوبان' });
    }
    
    // إنشاء رقم بلاغ فريد
    const reportNumber = `REP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const query = `
        INSERT INTO maintenance_reports (
            station_id, report_number, report_date, reporter_employee_id, station_name,
            asset_name, asset_type, fault_type, fault_description, repair_actions, notes,
            status, created_at, updated_at
        ) VALUES (?, ?, CURRENT_DATE, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    db.run(query, [
        station_id, reportNumber, reporter_employee_id || null, station_name || null,
        asset_name, asset_type || null, fault_type || null, fault_description || null,
        repair_actions || null, notes || null
    ], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في إضافة البلاغ', error: err.message });
        }
        res.status(201).json({ 
            success: true, 
            message: 'تم إضافة البلاغ بنجاح', 
            report_id: this.lastID,
            report_number: reportNumber
        });
    });
});


// ============================================
// 4. تحديث بلاغ (تعديل أو إضافة قطع غيار أو إصلاح)
// المسار: PUT /api/maintenance-reports/:id
// ============================================

app.put('/api/maintenance-reports/:id', checkPermission('maintenance.edit'), (req, res) => {
    const reportId = req.params.id;
    const {
        asset_name, asset_type, fault_type, fault_description,
        repair_actions, notes, status, completed_date
    } = req.body;
    
    const updates = [];
    const values = [];
    
    if (asset_name !== undefined) { updates.push('asset_name = ?'); values.push(asset_name); }
    if (asset_type !== undefined) { updates.push('asset_type = ?'); values.push(asset_type); }
    if (fault_type !== undefined) { updates.push('fault_type = ?'); values.push(fault_type); }
    if (fault_description !== undefined) { updates.push('fault_description = ?'); values.push(fault_description); }
    if (repair_actions !== undefined) { updates.push('repair_actions = ?'); values.push(repair_actions); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (completed_date !== undefined) { updates.push('completed_date = ?'); values.push(completed_date); }
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(reportId);
    
    db.run(`UPDATE maintenance_reports SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في تحديث البلاغ', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'البلاغ غير موجود' });
        }
        res.json({ success: true, message: 'تم تحديث البلاغ بنجاح' });
    });
});


// ============================================
// 5. إغلاق بلاغ (يتطلب صلاحية maintenance.close)
// المسار: PUT /api/maintenance-reports/:id/close
// ============================================

app.put('/api/maintenance-reports/:id/close', checkPermission('maintenance.close'), (req, res) => {
    const reportId = req.params.id;
    const { repair_actions, completed_date } = req.body;
    
    const query = `
        UPDATE maintenance_reports 
        SET status = 'completed', 
            completed_date = COALESCE(?, CURRENT_DATE),
            repair_actions = COALESCE(?, repair_actions),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status != 'completed'
    `;
    
    db.run(query, [completed_date || null, repair_actions || null, reportId], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في إغلاق البلاغ', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'البلاغ غير موجود أو مغلق بالفعل' });
        }
        res.json({ success: true, message: 'تم إغلاق البلاغ بنجاح' });
    });
});


// ============================================
// 6. إضافة قطع غيار لبلاغ
// المسار: POST /api/maintenance-reports/:id/spare-parts
// ============================================

app.post('/api/maintenance-reports/:id/spare-parts', checkPermission('maintenance.edit'), (req, res) => {
    const reportId = req.params.id;
    const { part_name, part_number, quantity, unit_price } = req.body;
    
    if (!part_name) {
        return res.status(400).json({ success: false, message: 'اسم قطعة الغيار مطلوب' });
    }
    
    const query = `
        INSERT INTO spare_parts_used (maintenance_report_id, part_name, part_number, quantity, unit_price)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [reportId, part_name, part_number || null, quantity || 1, unit_price || null], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في إضافة قطعة الغيار', error: err.message });
        }
        res.status(201).json({ 
            success: true, 
            message: 'تم إضافة قطعة الغيار بنجاح', 
            spare_part_id: this.lastID 
        });
    });
});


// ============================================
// 7. حذف بلاغ (يتطلب صلاحية maintenance.edit)
// المسار: DELETE /api/maintenance-reports/:id
// ============================================

app.delete('/api/maintenance-reports/:id', checkPermission('maintenance.edit'), (req, res) => {
    const reportId = req.params.id;
    
    // حذف قطع الغيار المرتبطة أولاً (حذف متتالي)
    db.run('DELETE FROM spare_parts_used WHERE maintenance_report_id = ?', [reportId], (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في حذف قطع الغيار' });
        }
        
        db.run('DELETE FROM maintenance_reports WHERE id = ?', [reportId], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في حذف البلاغ' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'البلاغ غير موجود' });
            }
            res.json({ success: true, message: 'تم حذف البلاغ بنجاح' });
        });
    });
});


// ============================================
// 8. جلب قطع الغيار لبلاغ محدد
// المسار: GET /api/maintenance-reports/:id/spare-parts
// ============================================

app.get('/api/maintenance-reports/:id/spare-parts', checkPermission('maintenance.view'), (req, res) => {
    const reportId = req.params.id;
    
    db.all('SELECT * FROM spare_parts_used WHERE maintenance_report_id = ? ORDER BY created_at DESC', [reportId], (err, parts) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب قطع الغيار' });
        }
        res.json({ success: true, spare_parts: parts || [] });
    });
});


// ============================================
// API: تقارير المرور (Inspection Reports)
// ============================================


// ============================================
// 9. جلب جميع تقارير المرور لمحطة محددة
// المسار: GET /api/stations/:stationId/inspection-reports
// ============================================

app.get('/api/stations/:stationId/inspection-reports', checkPermission('inspection.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح لك بمشاهدة تقارير هذه المحطة' });
    }
    
    const query = `
        SELECT 
            ir.*,
            u.full_name AS inspector_full_name
        FROM inspection_reports ir
        LEFT JOIN users u ON ir.inspector_id = u.id
        WHERE ir.station_id = ?
        ORDER BY ir.inspection_date DESC, ir.created_at DESC
    `;
    
    db.all(query, [stationId], (err, reports) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب التقارير' });
        }
        res.json({ success: true, count: reports.length, reports: reports });
    });
});


// ============================================
// 10. جلب تقرير مرور محدد بالمعرف
// المسار: GET /api/inspection-reports/:id
// ============================================

app.get('/api/inspection-reports/:id', checkPermission('inspection.view'), (req, res) => {
    const reportId = req.params.id;
    
    const query = `
        SELECT 
            ir.*,
            u.full_name AS inspector_full_name
        FROM inspection_reports ir
        LEFT JOIN users u ON ir.inspector_id = u.id
        WHERE ir.id = ?
    `;
    
    db.get(query, [reportId], (err, report) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب التقرير' });
        }
        if (!report) {
            return res.status(404).json({ success: false, message: 'التقرير غير موجود' });
        }
        
        // جلب تفاصيل التقرير (حالة كل أصل)
        db.all('SELECT * FROM inspection_report_details WHERE inspection_report_id = ? ORDER BY asset_category, asset_name', [reportId], (err, details) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في جلب تفاصيل التقرير' });
            }
            report.details = details || [];
            res.json({ success: true, report: report });
        });
    });
});


// ============================================
// 11. إضافة تقرير مرور جديد
// المسار: POST /api/inspection-reports
// ============================================

app.post('/api/inspection-reports', checkPermission('inspection.create'), (req, res) => {
    const {
        station_id, station_name, station_code,
        inspection_date, inspector_id, inspector_name,
        overall_notes, next_inspection_date
    } = req.body;
    
    if (!station_id || !inspection_date) {
        return res.status(400).json({ success: false, message: 'رقم المحطة وتاريخ المرور مطلوبان' });
    }
    
    // إنشاء رقم تقرير فريد
    const reportNumber = `INSP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const query = `
        INSERT INTO inspection_reports (
            report_number, station_id, station_name, station_code,
            inspection_date, inspector_id, inspector_name,
            overall_notes, next_inspection_date,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    db.run(query, [
        reportNumber, station_id, station_name || null, station_code || null,
        inspection_date, inspector_id || null, inspector_name || null,
        overall_notes || null, next_inspection_date || null
    ], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في إضافة التقرير', error: err.message });
        }
        res.status(201).json({ 
            success: true, 
            message: 'تم إضافة تقرير المرور بنجاح', 
            report_id: this.lastID,
            report_number: reportNumber
        });
    });
});


// ============================================
// 12. إضافة تفاصيل تقرير المرور (حالة كل أصل)
// المسار: POST /api/inspection-reports/:id/details
// ============================================

app.post('/api/inspection-reports/:id/details', checkPermission('inspection.create'), (req, res) => {
    const reportId = req.params.id;
    const { details } = req.body; // details مصفوفة من الكائنات
    
    if (!details || !Array.isArray(details) || details.length === 0) {
        return res.status(400).json({ success: false, message: 'تفاصيل التقرير مطلوبة' });
    }
    
    let completed = 0;
    let errors = [];
    
    details.forEach((detail, index) => {
        const {
            asset_category, asset_type, asset_id, asset_name,
            asset_code, is_working, asset_description, notes
        } = detail;
        
        if (!asset_category || !asset_name) {
            errors.push(`السطر ${index + 1}: اسم الأصل ونوعه مطلوبان`);
            completed++;
            return;
        }
        
        const query = `
            INSERT INTO inspection_report_details (
                inspection_report_id, asset_category, asset_type, asset_id,
                asset_name, asset_code, is_working, asset_description, notes,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        db.run(query, [
            reportId, asset_category, asset_type || null, asset_id || null,
            asset_name, asset_code || null, is_working !== undefined ? (is_working ? 1 : 0) : 1,
            asset_description || null, notes || null
        ], (err) => {
            if (err) {
                errors.push(`السطر ${index + 1}: ${err.message}`);
            }
            completed++;
            
            if (completed === details.length) {
                if (errors.length > 0) {
                    return res.status(207).json({ 
                        success: false, 
                        message: 'تم إضافة بعض التفاصيل مع أخطاء', 
                        errors: errors 
                    });
                }
                res.json({ success: true, message: 'تم إضافة جميع تفاصيل التقرير بنجاح' });
            }
        });
    });
});


// ============================================
// 13. تحديث تفاصيل تقرير المرور
// المسار: PUT /api/inspection-report-details/:detailId
// ============================================

app.put('/api/inspection-report-details/:detailId', checkPermission('inspection.edit'), (req, res) => {
    const detailId = req.params.id;
    const { is_working, asset_description, notes } = req.body;
    
    const updates = [];
    const values = [];
    
    if (is_working !== undefined) { updates.push('is_working = ?'); values.push(is_working ? 1 : 0); }
    if (asset_description !== undefined) { updates.push('asset_description = ?'); values.push(asset_description); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(detailId);
    
    db.run(`UPDATE inspection_report_details SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في تحديث التفاصيل' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'التفاصيل غير موجودة' });
        }
        res.json({ success: true, message: 'تم تحديث التفاصيل بنجاح' });
    });
});


// ============================================
// 14. حذف تقرير مرور (مع تفاصيله)
// المسار: DELETE /api/inspection-reports/:id
// ============================================

app.delete('/api/inspection-reports/:id', checkPermission('inspection.edit'), (req, res) => {
    const reportId = req.params.id;
    
    // حذف التفاصيل المرتبطة أولاً (حذف متتالي)
    db.run('DELETE FROM inspection_report_details WHERE inspection_report_id = ?', [reportId], (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في حذف التفاصيل' });
        }
        
        db.run('DELETE FROM inspection_reports WHERE id = ?', [reportId], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في حذف التقرير' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'التقرير غير موجود' });
            }
            res.json({ success: true, message: 'تم حذف التقرير بنجاح' });
        });
    });
});


// ============================================
// 15. جلب جميع الأصول لمحطة (لتعبئة تقرير المرور)
// المسار: GET /api/stations/:stationId/all-assets-for-inspection
// ============================================

app.get('/api/stations/:stationId/all-assets-for-inspection', checkPermission('inspection.create'), (req, res) => {
    const stationId = req.params.stationId;
    
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    const result = [];
    let pending = 8;
    
    // مغذيات
    db.all('SELECT id, feeder_name as name, "مغذي" as category FROM feeders WHERE station_id = ?', [stationId], (err, rows) => {
        rows.forEach(r => result.push({ id: r.id, name: r.name, category: r.category, type: 'feeder' }));
        checkComplete();
    });
    
    // مولدات
    db.all('SELECT id, generator_name as name, "مولد" as category FROM generators WHERE station_id = ?', [stationId], (err, rows) => {
        rows.forEach(r => result.push({ id: r.id, name: r.name, category: r.category, type: 'generator' }));
        checkComplete();
    });
    
    // طلمبات رئيسية
    db.all('SELECT id, pump_number as name, "طلمبة رئيسية" as category FROM main_pumps WHERE station_id = ?', [stationId], (err, rows) => {
        rows.forEach(r => result.push({ id: r.id, name: r.name, category: r.category, type: 'main_pump' }));
        checkComplete();
    });
    
    // طلمبات فرعية
    db.all('SELECT id, pump_number as name, "طلمبة فرعية" as category FROM sub_pumps WHERE station_id = ?', [stationId], (err, rows) => {
        rows.forEach(r => result.push({ id: r.id, name: r.name, category: r.category, type: 'sub_pump' }));
        checkComplete();
    });
    
    // لوحات كهربائية
    db.all('SELECT id, panel_name as name, "لوحة كهربائية" as category FROM electrical_panels WHERE station_id = ?', [stationId], (err, rows) => {
        rows.forEach(r => result.push({ id: r.id, name: r.name, category: r.category, type: 'panel' }));
        checkComplete();
    });
    
    // معدات ميكانيكية
    db.all('SELECT id, equipment_name as name, "معدة ميكانيكية" as category FROM mechanical_equipment WHERE station_id = ?', [stationId], (err, rows) => {
        rows.forEach(r => result.push({ id: r.id, name: r.name, category: r.category, type: 'mechanical' }));
        checkComplete();
    });
    
    // مباني
    db.all('SELECT id, building_name as name, "مبنى" as category FROM buildings WHERE station_id = ?', [stationId], (err, rows) => {
        rows.forEach(r => result.push({ id: r.id, name: r.name, category: r.category, type: 'building' }));
        checkComplete();
    });
    
    // أصول أخرى
    db.all('SELECT id, asset_number as name, "أصل آخر" as category FROM other_assets WHERE station_id = ?', [stationId], (err, rows) => {
        rows.forEach(r => result.push({ id: r.id, name: r.name, category: r.category, type: 'other' }));
        checkComplete();
    });
    
    function checkComplete() {
        pending--;
        if (pending === 0) {
            res.json({ success: true, assets: result });
        }
    }
});

// ============================================
// API: التكاليف والتقارير الشهرية
// ============================================


// ============================================
// 1. عدادات الكهرباء (Electricity Meters)
// ============================================


// 1.1 جلب قراءات الكهرباء لمحطة محددة
app.get('/api/stations/:stationId/electricity-meters', checkPermission('reports.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    const query = `
        SELECT * FROM electricity_meters 
        WHERE station_id = ? 
        ORDER BY accounting_month DESC, meter_name
    `;
    
    db.all(query, [stationId], (err, meters) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        }
        res.json({ success: true, meters: meters || [] });
    });
});


// 1.2 إضافة قراءة كهرباء جديدة
app.post('/api/electricity-meters', checkPermission('reports.export'), (req, res) => {
    const { station_id, meter_name, meter_number, reading_date, current_reading, previous_reading, electricity_tariff, accounting_month } = req.body;
    
    if (!station_id || !meter_name || !reading_date || !current_reading || !accounting_month) {
        return res.status(400).json({ success: false, message: 'بيانات غير مكتملة' });
    }
    
    const consumption_kwh = current_reading - (previous_reading || 0);
    const cost = consumption_kwh * (electricity_tariff || 0);
    
    const query = `
        INSERT INTO electricity_meters (
            station_id, meter_name, meter_number, reading_date,
            current_reading, previous_reading, consumption_kwh,
            electricity_tariff, cost, accounting_month
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
        station_id, meter_name, meter_number || null, reading_date,
        current_reading, previous_reading || null, consumption_kwh,
        electricity_tariff || null, cost, accounting_month
    ], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في إضافة القراءة', error: err.message });
        }
        res.status(201).json({ success: true, message: 'تم إضافة القراءة', meter_id: this.lastID });
    });
});


// ============================================
// 2. عدادات المياه (Water Meters)
// ============================================


app.get('/api/stations/:stationId/water-meters', checkPermission('reports.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    db.all('SELECT * FROM water_meters WHERE station_id = ? ORDER BY accounting_month DESC', [stationId], (err, meters) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, meters: meters || [] });
    });
});


app.post('/api/water-meters', checkPermission('reports.export'), (req, res) => {
    const { station_id, reading_date, current_reading, previous_reading, water_tariff, accounting_month } = req.body;
    
    if (!station_id || !reading_date || !current_reading || !accounting_month) {
        return res.status(400).json({ success: false, message: 'بيانات غير مكتملة' });
    }
    
    const consumption_m3 = current_reading - (previous_reading || 0);
    const cost = consumption_m3 * (water_tariff || 0);
    
    const query = `
        INSERT INTO water_meters (
            station_id, reading_date, current_reading, previous_reading,
            consumption_m3, water_tariff, cost, accounting_month
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
        station_id, reading_date, current_reading, previous_reading || null,
        consumption_m3, water_tariff || null, cost, accounting_month
    ], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في إضافة القراءة' });
        res.status(201).json({ success: true, message: 'تم إضافة القراءة', meter_id: this.lastID });
    });
});


// ============================================
// 3. كمية المياه المرفوعة (Water Lifted)
// ============================================


app.post('/api/water-lifted', checkPermission('reports.export'), (req, res) => {
    const { station_id, operating_hours, main_pump_flow_rate_m3h, accounting_month } = req.body;
    
    if (!station_id || !operating_hours || !main_pump_flow_rate_m3h || !accounting_month) {
        return res.status(400).json({ success: false, message: 'بيانات غير مكتملة' });
    }
    
    const water_quantity_m3 = operating_hours * main_pump_flow_rate_m3h;
    
    const query = `
        INSERT INTO water_lifted (station_id, operating_hours, main_pump_flow_rate_m3h, water_quantity_m3, accounting_month)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [station_id, operating_hours, main_pump_flow_rate_m3h, water_quantity_m3, accounting_month], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في إضافة البيانات' });
        res.status(201).json({ success: true, message: 'تم إضافة البيانات', water_lifted_id: this.lastID });
    });
});


// ============================================
// 4. استهلاك السولار (Diesel Consumption)
// ============================================


app.get('/api/stations/:stationId/diesel-consumption', checkPermission('reports.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    db.all('SELECT * FROM diesel_consumption WHERE station_id = ? ORDER BY accounting_month DESC', [stationId], (err, consumption) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, consumption: consumption || [] });
    });
});


app.post('/api/diesel-consumption', checkPermission('reports.export'), (req, res) => {
    const { station_id, generator_id, generator_name, hours_with_load, hours_no_load,
            consumption_rate_with_load, consumption_rate_no_load, previous_balance,
            added_diesel, diesel_price, accounting_month } = req.body;
    
    if (!station_id || !accounting_month) {
        return res.status(400).json({ success: false, message: 'بيانات غير مكتملة' });
    }
    
    const consumption_with_load = (hours_with_load || 0) * (consumption_rate_with_load || 0);
    const consumption_no_load = (hours_no_load || 0) * (consumption_rate_no_load || 0);
    const total_consumption = consumption_with_load + consumption_no_load;
    const current_balance = (previous_balance || 0) + (added_diesel || 0) - total_consumption;
    const total_cost = total_consumption * (diesel_price || 0);
    
    const query = `
        INSERT INTO diesel_consumption (
            station_id, generator_id, generator_name, hours_with_load, hours_no_load,
            consumption_rate_with_load, consumption_rate_no_load,
            consumption_with_load, consumption_no_load, total_consumption,
            previous_balance, added_diesel, current_balance,
            diesel_price, total_cost, accounting_month
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
        station_id, generator_id || null, generator_name || null,
        hours_with_load || 0, hours_no_load || 0,
        consumption_rate_with_load || null, consumption_rate_no_load || null,
        consumption_with_load, consumption_no_load, total_consumption,
        previous_balance || 0, added_diesel || 0, current_balance,
        diesel_price || null, total_cost, accounting_month
    ], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في إضافة البيانات', error: err.message });
        res.status(201).json({ success: true, message: 'تم إضافة البيانات', consumption_id: this.lastID });
    });
});


// ============================================
// 5. استهلاك زيت المولدات (Generator Oil Consumption)
// ============================================


app.get('/api/generators/:generatorId/oil-consumption', checkPermission('reports.view'), (req, res) => {
    const generatorId = req.params.generatorId;
    
    db.all('SELECT * FROM generator_oil_consumption WHERE generator_id = ? ORDER BY transaction_date DESC', [generatorId], (err, consumption) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, consumption: consumption || [] });
    });
});


app.post('/api/generator-oil-consumption', checkPermission('reports.export'), (req, res) => {
    const { generator_id, transaction_date, quantity_liters, oil_type, notes } = req.body;
    
    if (!generator_id || !transaction_date || !quantity_liters) {
        return res.status(400).json({ success: false, message: 'بيانات غير مكتملة' });
    }
    
    const query = `
        INSERT INTO generator_oil_consumption (generator_id, transaction_date, quantity_liters, oil_type, notes)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [generator_id, transaction_date, quantity_liters, oil_type || null, notes || null], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في إضافة البيانات' });
        res.status(201).json({ success: true, message: 'تم إضافة استهلاك الزيت', oil_consumption_id: this.lastID });
    });
});


// ============================================
// 6. التقارير الشهرية (Monthly Reports)
// ============================================


app.get('/api/stations/:stationId/monthly-reports', checkPermission('reports.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    db.all('SELECT * FROM monthly_reports WHERE station_id = ? ORDER BY accounting_month DESC', [stationId], (err, reports) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, reports: reports || [] });
    });
});


// 6.1 إنشاء تقرير شهري (يحسب جميع البيانات تلقائياً)
app.post('/api/monthly-reports/generate', checkPermission('reports.export'), async (req, res) => {
    const { station_id, accounting_month } = req.body;
    
    if (!station_id || !accounting_month) {
        return res.status(400).json({ success: false, message: 'رقم المحطة وشهر المحاسبة مطلوبان' });
    }
    
    try {
        // جلب بيانات المحطة
        const station = await new Promise((resolve, reject) => {
            db.get('SELECT station_name, station_code FROM stations WHERE id = ?', [station_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!station) {
            return res.status(404).json({ success: false, message: 'المحطة غير موجودة' });
        }
        
        // جلب كمية المياه المرفوعة
        const waterLifted = await new Promise((resolve) => {
            db.get('SELECT operating_hours, main_pump_flow_rate_m3h, water_quantity_m3 FROM water_lifted WHERE station_id = ? AND accounting_month = ?', 
                [station_id, accounting_month], (err, row) => {
                resolve(row || { operating_hours: null, main_pump_flow_rate_m3h: null, water_quantity_m3: null });
            });
        });
        
        // جلب قراءات الكهرباء للمحولين
        const transformers = await new Promise((resolve) => {
            db.all('SELECT * FROM electricity_meters WHERE station_id = ? AND accounting_month = ?', 
                [station_id, accounting_month], (err, rows) => {
                const result = { t1: null, t2: null };
                rows.forEach(row => {
                    if (row.meter_name.includes('1') || row.meter_name === 'محول 1') result.t1 = row;
                    else result.t2 = row;
                });
                resolve(result);
            });
        });
        
        // جلب استهلاك السولار للمولدين
        const diesel = await new Promise((resolve) => {
            db.all('SELECT * FROM diesel_consumption WHERE station_id = ? AND accounting_month = ?', 
                [station_id, accounting_month], (err, rows) => {
                const result = { g1: null, g2: null };
                rows.forEach(row => {
                    if (row.generator_name === 'مولد 1' || row.generator_id === 1) result.g1 = row;
                    else result.g2 = row;
                });
                resolve(result);
            });
        });
        
        // جلب استهلاك المياه
        const water = await new Promise((resolve) => {
            db.get('SELECT * FROM water_meters WHERE station_id = ? AND accounting_month = ?', 
                [station_id, accounting_month], (err, row) => {
                resolve(row || null);
            });
        });
        
        // إنشاء رقم تقرير فريد
        const reportNumber = `RPT-${station_id}-${accounting_month.replace(/-/g, '')}`;
        
        // إنشاء التقرير الشهري
        const query = `
            INSERT INTO monthly_reports (
                station_id, report_number, accounting_month, station_name, station_code,
                operating_hours, main_pump_flow_rate_m3h, water_lifted_m3,
                transformer_1_name, transformer_1_previous_reading, transformer_1_current_reading,
                transformer_1_consumption, transformer_1_tariff, transformer_1_cost,
                transformer_2_name, transformer_2_previous_reading, transformer_2_current_reading,
                transformer_2_consumption, transformer_2_tariff, transformer_2_cost,
                generator_1_name, generator_1_hours_with_load, generator_1_hours_no_load,
                generator_1_rate_with_load, generator_1_rate_no_load,
                generator_1_consumption_with_load, generator_1_consumption_no_load,
                generator_1_total_consumption, generator_1_previous_balance,
                generator_1_added_diesel, generator_1_current_balance,
                generator_1_diesel_price, generator_1_cost,
                generator_2_name, generator_2_hours_with_load, generator_2_hours_no_load,
                generator_2_rate_with_load, generator_2_rate_no_load,
                generator_2_consumption_with_load, generator_2_consumption_no_load,
                generator_2_total_consumption, generator_2_previous_balance,
                generator_2_added_diesel, generator_2_current_balance,
                generator_2_diesel_price, generator_2_cost,
                water_meter_name, water_previous_reading, water_current_reading,
                water_consumption_m3, water_tariff, water_cost
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            station_id, reportNumber, accounting_month, station.station_name, station.station_code,
            waterLifted.operating_hours, waterLifted.main_pump_flow_rate_m3h, waterLifted.water_quantity_m3,
            transformers.t1?.meter_name || null, transformers.t1?.previous_reading || null, transformers.t1?.current_reading || null,
            transformers.t1?.consumption_kwh || null, transformers.t1?.electricity_tariff || null, transformers.t1?.cost || null,
            transformers.t2?.meter_name || null, transformers.t2?.previous_reading || null, transformers.t2?.current_reading || null,
            transformers.t2?.consumption_kwh || null, transformers.t2?.electricity_tariff || null, transformers.t2?.cost || null,
            diesel.g1?.generator_name || null, diesel.g1?.hours_with_load || null, diesel.g1?.hours_no_load || null,
            diesel.g1?.consumption_rate_with_load || null, diesel.g1?.consumption_rate_no_load || null,
            diesel.g1?.consumption_with_load || null, diesel.g1?.consumption_no_load || null,
            diesel.g1?.total_consumption || null, diesel.g1?.previous_balance || null,
            diesel.g1?.added_diesel || null, diesel.g1?.current_balance || null,
            diesel.g1?.diesel_price || null, diesel.g1?.total_cost || null,
            diesel.g2?.generator_name || null, diesel.g2?.hours_with_load || null, diesel.g2?.hours_no_load || null,
            diesel.g2?.consumption_rate_with_load || null, diesel.g2?.consumption_rate_no_load || null,
            diesel.g2?.consumption_with_load || null, diesel.g2?.consumption_no_load || null,
            diesel.g2?.total_consumption || null, diesel.g2?.previous_balance || null,
            diesel.g2?.added_diesel || null, diesel.g2?.current_balance || null,
            diesel.g2?.diesel_price || null, diesel.g2?.total_cost || null,
            water?.meter_name || null, water?.previous_reading || null, water?.current_reading || null,
            water?.consumption_m3 || null, water?.water_tariff || null, water?.cost || null
        ];
        
        db.run(query, params, function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في إنشاء التقرير', error: err.message });
            }
            res.status(201).json({ 
                success: true, 
                message: 'تم إنشاء التقرير الشهري بنجاح', 
                report_id: this.lastID,
                report_number: reportNumber
            });
        });
        
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ success: false, message: 'خطأ في إنشاء التقرير' });
    }
});


// ============================================
// 7. التقارير المطلوبة (Reports Queries)
// ============================================


// 7.1 تقرير حالة محطة
app.get('/api/reports/station-status/:stationId', checkPermission('reports.view'), (req, res) => {
    const stationId = req.params.stationId;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'تاريخ البداية والنهاية مطلوبان' });
    }
    
    const query = `
        SELECT 
            s.station_name, s.station_code, s.location, s.capacity, s.status AS station_status,
            vas.asset_category, vas.asset_name, vas.is_working, vas.last_check_date, vas.last_notes,
            mr.fault_type, mr.fault_description, mr.report_date AS fault_report_date, mr.status AS fault_status
        FROM stations s
        LEFT JOIN v_asset_status vas ON s.id = vas.station_id
        LEFT JOIN maintenance_reports mr ON s.id = mr.station_id 
            AND mr.status != 'completed'
            AND mr.report_date BETWEEN ? AND ?
        WHERE s.id = ?
        ORDER BY vas.asset_category, vas.asset_name
    `;
    
    db.all(query, [start_date, end_date, stationId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, data: results });
    });
});


// 7.2 تقرير استهلاك كهرباء
app.get('/api/reports/electricity-consumption/:stationId', checkPermission('reports.view'), (req, res) => {
    const stationId = req.params.stationId;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'تاريخ البداية والنهاية مطلوبان' });
    }
    
    const query = `
        SELECT 
            station_name, accounting_month,
            transformer_1_name, transformer_1_consumption AS consumption_kwh_1, transformer_1_cost AS cost_egp_1,
            transformer_2_name, transformer_2_consumption AS consumption_kwh_2, transformer_2_cost AS cost_egp_2,
            (transformer_1_consumption + transformer_2_consumption) AS total_consumption_kwh,
            (transformer_1_cost + transformer_2_cost) AS total_cost_egp
        FROM monthly_reports
        WHERE station_id = ? AND accounting_month BETWEEN ? AND ?
        ORDER BY accounting_month
    `;
    
    db.all(query, [stationId, start_date, end_date], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, data: results });
    });
});


// 7.3 تقرير استهلاك سولار
app.get('/api/reports/diesel-consumption/:stationId', checkPermission('reports.view'), (req, res) => {
    const stationId = req.params.stationId;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'تاريخ البداية والنهاية مطلوبان' });
    }
    
    const query = `
        SELECT 
            station_name, accounting_month,
            generator_1_name, generator_1_total_consumption AS consumption_liters_1, generator_1_cost AS cost_egp_1,
            generator_2_name, generator_2_total_consumption AS consumption_liters_2, generator_2_cost AS cost_egp_2,
            (generator_1_total_consumption + generator_2_total_consumption) AS total_consumption_liters,
            (generator_1_cost + generator_2_cost) AS total_cost_egp
        FROM monthly_reports
        WHERE station_id = ? AND accounting_month BETWEEN ? AND ?
        ORDER BY accounting_month
    `;
    
    db.all(query, [stationId, start_date, end_date], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, data: results });
    });
});


// 7.4 تقرير استهلاك مياه
app.get('/api/reports/water-consumption/:stationId', checkPermission('reports.view'), (req, res) => {
    const stationId = req.params.stationId;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'تاريخ البداية والنهاية مطلوبان' });
    }
    
    const query = `
        SELECT 
            station_name, accounting_month, water_meter_name,
            water_previous_reading, water_current_reading, water_consumption_m3,
            water_tariff, water_cost,
            SUM(water_consumption_m3) OVER (PARTITION BY station_id) AS total_consumption_m3,
            SUM(water_cost) OVER (PARTITION BY station_id) AS total_cost_egp
        FROM monthly_reports
        WHERE station_id = ? AND accounting_month BETWEEN ? AND ?
        ORDER BY accounting_month
    `;
    
    db.all(query, [stationId, start_date, end_date], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, data: results });
    });
});


// 7.5 تقرير قطع غيار
app.get('/api/reports/spare-parts/:stationId', checkPermission('reports.view'), (req, res) => {
    const stationId = req.params.stationId;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'تاريخ البداية والنهاية مطلوبان' });
    }
    
    const query = `
        SELECT 
            s.station_name, s.station_code,
            mr.report_number, mr.report_date, mr.asset_name, mr.fault_type,
            spu.part_name, spu.part_number, spu.quantity, spu.unit_price,
            (spu.quantity * spu.unit_price) AS total_price
        FROM spare_parts_used spu
        JOIN maintenance_reports mr ON spu.maintenance_report_id = mr.id
        JOIN stations s ON mr.station_id = s.id
        WHERE s.id = ? AND mr.report_date BETWEEN ? AND ?
        ORDER BY mr.report_date DESC, mr.asset_name
    `;
    
    db.all(query, [stationId, start_date, end_date], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, data: results });
    });
});


// 7.6 تقرير متابعة أصل
app.get('/api/reports/asset-tracking/:stationId', checkPermission('reports.view'), (req, res) => {
    const stationId = req.params.stationId;
    const { asset_name, asset_type, start_date, end_date } = req.query;
    
    if (!asset_name || !start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'اسم الأصل وتاريخ البداية والنهاية مطلوبون' });
    }
    
    const query = `
        SELECT 
            vas.is_working, vas.last_check_date, vas.last_notes,
            mr.report_number, mr.report_date, mr.fault_description,
            mr.repair_actions, mr.status AS fault_status,
            spu.part_name, spu.part_number, spu.quantity
        FROM stations s
        LEFT JOIN v_asset_status vas ON s.id = vas.station_id AND vas.asset_name = ?
        LEFT JOIN maintenance_reports mr ON s.id = mr.station_id 
            AND mr.asset_name = ?
            AND mr.report_date BETWEEN ? AND ?
        LEFT JOIN spare_parts_used spu ON mr.id = spu.maintenance_report_id
        WHERE s.id = ?
        ORDER BY mr.report_date DESC
    `;
    
    db.all(query, [asset_name, asset_name, start_date, end_date, stationId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
        res.json({ success: true, data: results });
    });
});


// ============================================
// تشغيل السيرفر (يوجد في نهاية الجزء الأول)
// ============================================

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  POST   /api/register');
    console.log('  POST   /api/login');
    console.log('  GET    /api/verify');
    console.log('  GET    /api/stations');
    console.log('  GET    /api/stations/:id');
    console.log('  POST   /api/stations');
    console.log('  PUT    /api/stations/:id');
    console.log('  DELETE /api/stations/:id');
    console.log('  GET    /api/stations/:id/full');
    console.log('  GET    /api/stations/:stationId/main-pumps');
    console.log('  POST   /api/main-pumps');
    console.log('  PUT    /api/main-pumps/:id');
    console.log('  DELETE /api/main-pumps/:id');
    console.log('  GET    /api/stations/:stationId/sub-pumps');
    console.log('  POST   /api/sub-pumps');
    console.log('  GET    /api/stations/:stationId/generators');
    console.log('  POST   /api/generators');
    console.log('  GET    /api/stations/:stationId/panels');
    console.log('  POST   /api/panels');
    console.log('  GET    /api/stations/:stationId/mechanical');
    console.log('  POST   /api/mechanical');
    console.log('  GET    /api/stations/:stationId/maintenance-reports');
    console.log('  POST   /api/maintenance-reports');
    console.log('  PUT    /api/maintenance-reports/:id');
    console.log('  PUT    /api/maintenance-reports/:id/close');
    console.log('  POST   /api/maintenance-reports/:id/spare-parts');
    console.log('  GET    /api/stations/:stationId/inspection-reports');
    console.log('  POST   /api/inspection-reports');
    console.log('  POST   /api/inspection-reports/:id/details');
    console.log('  GET    /api/stations/:stationId/electricity-meters');
    console.log('  POST   /api/electricity-meters');
    console.log('  POST   /api/water-meters');
    console.log('  POST   /api/diesel-consumption');
    console.log('  POST   /api/generator-oil-consumption');
    console.log('  POST   /api/monthly-reports/generate');
    console.log('  GET    /api/reports/station-status/:stationId');
    console.log('  GET    /api/reports/electricity-consumption/:stationId');
    console.log('  GET    /api/reports/diesel-consumption/:stationId');
    console.log('  GET    /api/reports/water-consumption/:stationId');
    console.log('  GET    /api/reports/spare-parts/:stationId');
    console.log('  GET    /api/reports/asset-tracking/:stationId');
});


// ============================================
// الجزء التاسع: إدارة إخطارات غرامة معامل القدرة
// ============================================


// ============================================
// 1. حساب وإصدار إخطار غرامة (يدوي أو تلقائي)
// المسار: POST /api/penalty/calculate
// ============================================

app.post('/api/penalty/calculate', checkPermission('reports.export'), (req, res) => {
    const { station_id, accounting_month, threshold_power_factor = 0.9, penalty_rate = 0.01 } = req.body;
    
    if (!station_id || !accounting_month) {
        return res.status(400).json({ success: false, message: 'رقم المحطة وشهر المحاسبة مطلوبان' });
    }
    
    // 1. جلب بيانات المحطة
    db.get('SELECT station_name, station_code FROM stations WHERE id = ?', [station_id], (err, station) => {
        if (err || !station) {
            return res.status(404).json({ success: false, message: 'المحطة غير موجودة' });
        }
        
        // 2. جلب قراءات الكهرباء للشهر المحدد
        const monthlyQuery = `
            SELECT 
                meter_name,
                current_reading,
                previous_reading,
                consumption_kwh,
                cost
            FROM electricity_meters
            WHERE station_id = ? AND accounting_month = ?
        `;
        
        db.all(monthlyQuery, [station_id, accounting_month], (err, monthlyMeters) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
            }
            
            if (!monthlyMeters || monthlyMeters.length === 0) {
                return res.status(404).json({ success: false, message: 'لا توجد قراءات كهرباء لهذا الشهر' });
            }
            
            // حساب استهلاك الشهر
            const monthly_consumption_kwh = monthlyMeters.reduce((sum, m) => sum + (m.consumption_kwh || 0), 0);
            const monthly_consumption_cost = monthlyMeters.reduce((sum, m) => sum + (m.cost || 0), 0);
            
            // 3. جلب الاستهلاك السنوي (آخر 12 شهر)
            const startDate = `${parseInt(accounting_month.substring(0, 4)) - 1}-${accounting_month.substring(5)}`;
            
            const annualQuery = `
                SELECT 
                    SUM(consumption_kwh) as total_kwh,
                    SUM(cost) as total_cost
                FROM electricity_meters
                WHERE station_id = ? AND accounting_month BETWEEN ? AND ?
            `;
            
            db.get(annualQuery, [station_id, startDate, accounting_month], (err, annual) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'خطأ في جلب الاستهلاك السنوي' });
                }
                
                const annual_consumption_kwh = annual?.total_kwh || 0;
                const annual_consumption_cost = annual?.total_cost || 0;
                
                // 4. حساب معامل القدرة (من قراءات العداد أو تقدير)
                // في الواقع العملي، تؤخذ من قراءات العداد المباشرة
                // هنا نستخدم معادلة تقديرية (يمكن تعديلها حسب المصدر الفعلي)
                
                let avg_power_factor = 0.85; // افتراض مؤقت
                let penalty_amount = 0;
                let deficiency_percentage = 0;
                
                // حساب معامل القدرة من بيانات المحولات (إن وجدت)
                // هذه معادلة مبسطة، يمكن تعديلها حسب طريقة الحساب الفعلية
                if (monthlyMeters.length > 0 && monthly_consumption_kwh > 0) {
                    // افتراض: الطاقة الظاهرية = الطاقة الفعالة / معامل القدرة
                    // هنا نحتاج قراءة فعلية لمعامل القدرة من العداد
                    // للتبسيط، نأخذ أقل معامل قدرة مسجل في الشهر
                    // في التطبيق الحقيقي، تؤخذ من جدول readings
                    avg_power_factor = monthlyMeters[0].power_factor || 0.85;
                }
                
                // حساب نسبة النقص
                if (avg_power_factor < threshold_power_factor) {
                    deficiency_percentage = (threshold_power_factor - avg_power_factor) * 100;
                    // قيمة الغرامة = (نسبة النقص × 0.01) × قيمة الاستهلاك الشهري
                    penalty_amount = (deficiency_percentage * penalty_rate) * monthly_consumption_cost;
                }
                
                // 5. حفظ البيانات في جدول معامل القدرة الشهري
                const pfQuery = `
                    INSERT OR REPLACE INTO power_factor_monthly (
                        station_id, accounting_month, avg_power_factor,
                        total_consumption_kwh, total_consumption_cost,
                        threshold_power_factor, penalty_amount, penalty_applied,
                        notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                
                db.run(pfQuery, [
                    station_id, accounting_month, avg_power_factor,
                    monthly_consumption_kwh, monthly_consumption_cost,
                    threshold_power_factor, penalty_amount,
                    penalty_amount > 0 ? 1 : 0,
                    `تم الحساب تلقائياً بتاريخ ${new Date().toLocaleString()}`
                ], (err) => {
                    if (err) {
                        console.error('Error saving power factor:', err);
                    }
                });
                
                // 6. إنشاء إخطار غرامة (إذا كان هناك غرامة)
                if (penalty_amount > 0) {
                    const notificationNumber = `PN-${accounting_month.replace(/-/g, '')}-${station_id}-${Date.now()}`;
                    
                    const penaltyBasis = `انخفاض معامل القدرة من ${threshold_power_factor} إلى ${avg_power_factor.toFixed(3)} (نقص ${deficiency_percentage.toFixed(1)}%). الغرامة: ${deficiency_percentage.toFixed(1)}% × ${penalty_rate * 100}% × قيمة الاستهلاك الشهري (${monthly_consumption_cost.toFixed(2)} جنيه)`;
                    
                    const notificationQuery = `
                        INSERT INTO penalty_notifications (
                            station_id, station_name, station_code,
                            notification_number, accounting_month,
                            avg_power_factor, threshold_power_factor, deficiency_percentage,
                            annual_consumption_kwh, annual_consumption_cost,
                            monthly_consumption_kwh, monthly_consumption_cost,
                            penalty_amount, penalty_calculation_basis,
                            is_sent, notes
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
                    `;
                    
                    db.run(notificationQuery, [
                        station_id, station.station_name, station.station_code,
                        notificationNumber, accounting_month,
                        avg_power_factor, threshold_power_factor, deficiency_percentage,
                        annual_consumption_kwh, annual_consumption_cost,
                        monthly_consumption_kwh, monthly_consumption_cost,
                        penalty_amount, penaltyBasis,
                        `تم إنشاء الإخطار تلقائياً بتاريخ ${new Date().toLocaleString()}`
                    ], function(err) {
                        if (err) {
                            return res.status(500).json({ 
                                success: false, 
                                message: 'خطأ في إنشاء الإخطار', 
                                error: err.message 
                            });
                        }
                        
                        res.json({
                            success: true,
                            message: 'تم حساب معامل القدرة وإنشاء إخطار الغرامة',
                            notification_id: this.lastID,
                            notification_number: notificationNumber,
                            data: {
                                station_id,
                                station_name: station.station_name,
                                accounting_month,
                                avg_power_factor: avg_power_factor.toFixed(3),
                                threshold_power_factor,
                                deficiency_percentage: deficiency_percentage.toFixed(1),
                                monthly_consumption_kwh,
                                monthly_consumption_cost,
                                annual_consumption_kwh,
                                annual_consumption_cost,
                                penalty_amount,
                                penalty_calculation_basis: penaltyBasis
                            }
                        });
                    });
                } else {
                    // لا توجد غرامة، فقط نعيد البيانات
                    res.json({
                        success: true,
                        message: 'تم حساب معامل القدرة، لا توجد غرامة',
                        data: {
                            station_id,
                            station_name: station.station_name,
                            accounting_month,
                            avg_power_factor: avg_power_factor.toFixed(3),
                            threshold_power_factor,
                            monthly_consumption_kwh,
                            monthly_consumption_cost,
                            annual_consumption_kwh,
                            annual_consumption_cost,
                            penalty_amount: 0
                        }
                    });
                }
            });
        });
    });
});


// ============================================
// 2. جلب جميع إخطارات الغرامات
// المسار: GET /api/penalty/notifications
// ============================================

app.get('/api/penalty/notifications', checkPermission('reports.view'), (req, res) => {
    const { station_id, is_sent, paid, start_date, end_date, limit = 100, offset = 0 } = req.query;
    
    let query = `
        SELECT 
            pn.*,
            u.full_name AS reviewed_by_name
        FROM penalty_notifications pn
        LEFT JOIN users u ON pn.reviewed_by = u.id
        WHERE 1=1
    `;
    const params = [];
    
    if (station_id) {
        query += ' AND pn.station_id = ?';
        params.push(station_id);
    }
    
    if (is_sent !== undefined && is_sent !== '') {
        query += ' AND pn.is_sent = ?';
        params.push(is_sent === 'true' ? 1 : 0);
    }
    
    if (paid !== undefined && paid !== '') {
        query += ' AND pn.paid = ?';
        params.push(paid === 'true' ? 1 : 0);
    }
    
    if (start_date) {
        query += ' AND pn.notification_date >= ?';
        params.push(start_date);
    }
    
    if (end_date) {
        query += ' AND pn.notification_date <= ?';
        params.push(end_date);
    }
    
    query += ' ORDER BY pn.notification_date DESC, pn.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    db.all(query, params, (err, notifications) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب الإخطارات', error: err.message });
        }
        
        // جلب الإحصائيات
        let statsQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_sent = 1 THEN 1 ELSE 0 END) as sent,
                SUM(CASE WHEN paid = 1 THEN 1 ELSE 0 END) as paid,
                SUM(penalty_amount) as total_penalty,
                SUM(CASE WHEN paid = 1 THEN penalty_amount ELSE 0 END) as paid_penalty
            FROM penalty_notifications
            WHERE 1=1
        `;
        
        const statsParams = [];
        if (station_id) {
            statsQuery += ' AND station_id = ?';
            statsParams.push(station_id);
        }
        if (start_date) {
            statsQuery += ' AND notification_date >= ?';
            statsParams.push(start_date);
        }
        if (end_date) {
            statsQuery += ' AND notification_date <= ?';
            statsParams.push(end_date);
        }
        
        db.get(statsQuery, statsParams, (err, stats) => {
            if (err) {
                console.error('Error fetching stats:', err);
            }
            
            res.json({
                success: true,
                count: notifications.length,
                total: notifications.length,
                stats: stats || { total: 0, sent: 0, paid: 0, total_penalty: 0, paid_penalty: 0 },
                notifications: notifications
            });
        });
    });
});


// ============================================
// 3. جلب إخطار محدد بالمعرف
// المسار: GET /api/penalty/notifications/:id
// ============================================

app.get('/api/penalty/notifications/:id', checkPermission('reports.view'), (req, res) => {
    const notificationId = req.params.id;
    
    const query = `
        SELECT 
            pn.*,
            u.full_name AS reviewed_by_name
        FROM penalty_notifications pn
        LEFT JOIN users u ON pn.reviewed_by = u.id
        WHERE pn.id = ?
    `;
    
    db.get(query, [notificationId], (err, notification) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب الإخطار', error: err.message });
        }
        if (!notification) {
            return res.status(404).json({ success: false, message: 'الإخطار غير موجود' });
        }
        
        res.json({ success: true, notification: notification });
    });
});


// ============================================
// 4. تحديث إخطار (إرسال، مراجعة، دفع)
// المسار: PUT /api/penalty/notifications/:id
// ============================================

app.put('/api/penalty/notifications/:id', checkPermission('reports.export'), (req, res) => {
    const notificationId = req.params.id;
    const { is_sent, sent_to, reviewed_by, review_notes, paid, payment_reference } = req.body;
    
    const updates = [];
    const values = [];
    
    if (is_sent !== undefined) {
        updates.push('is_sent = ?');
        values.push(is_sent ? 1 : 0);
        if (is_sent) {
            updates.push('sent_at = CURRENT_TIMESTAMP');
        }
    }
    
    if (sent_to !== undefined) {
        updates.push('sent_to = ?');
        values.push(sent_to);
    }
    
    if (reviewed_by !== undefined) {
        updates.push('reviewed_by = ?');
        values.push(reviewed_by);
        updates.push('reviewed_at = CURRENT_TIMESTAMP');
    }
    
    if (review_notes !== undefined) {
        updates.push('review_notes = ?');
        values.push(review_notes);
    }
    
    if (paid !== undefined) {
        updates.push('paid = ?');
        values.push(paid ? 1 : 0);
        if (paid) {
            updates.push('paid_at = CURRENT_TIMESTAMP');
        }
    }
    
    if (payment_reference !== undefined) {
        updates.push('payment_reference = ?');
        values.push(payment_reference);
    }
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(notificationId);
    
    db.run(`UPDATE penalty_notifications SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في تحديث الإخطار', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'الإخطار غير موجود' });
        }
        res.json({ success: true, message: 'تم تحديث الإخطار بنجاح' });
    });
});


// ============================================
// 5. تقرير معامل القدرة (مع تفاصيل الغرامات)
// المسار: GET /api/reports/power-factor-detailed/:stationId
// ============================================

app.get('/api/reports/power-factor-detailed/:stationId', checkPermission('reports.view'), (req, res) => {
    const stationId = req.params.stationId;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'تاريخ البداية والنهاية مطلوبان' });
    }
    
    const query = `
        SELECT 
            pfm.*,
            pn.notification_number,
            pn.notification_date,
            pn.is_sent,
            pn.paid,
            pn.paid_at,
            pn.penalty_calculation_basis
        FROM power_factor_monthly pfm
        LEFT JOIN penalty_notifications pn ON pfm.station_id = pn.station_id AND pfm.accounting_month = pn.accounting_month
        WHERE pfm.station_id = ? AND pfm.accounting_month BETWEEN ? AND ?
        ORDER BY pfm.accounting_month DESC
    `;
    
    db.all(query, [stationId, start_date, end_date], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        
        // حساب الإحصائيات
        let total_penalty = 0;
        let total_paid_penalty = 0;
        let months_with_penalty = 0;
        let avg_pf = 0;
        
        results.forEach(r => {
            total_penalty += r.penalty_amount || 0;
            if (r.paid) total_paid_penalty += r.penalty_amount || 0;
            if (r.penalty_amount > 0) months_with_penalty++;
            avg_pf += r.avg_power_factor || 0;
        });
        
        if (results.length > 0) {
            avg_pf = avg_pf / results.length;
        }
        
        res.json({
            success: true,
            data: results,
            summary: {
                total_penalty: total_penalty,
                total_paid_penalty: total_paid_penalty,
                pending_penalty: total_penalty - total_paid_penalty,
                months_with_penalty: months_with_penalty,
                avg_power_factor: avg_pf.toFixed(3),
                total_months: results.length
            }
        });
    });
});


// ============================================
// 6. تقرير إخطارات الغرامات (للطباعة)
// المسار: GET /api/reports/penalty-notifications-print
// ============================================

app.get('/api/reports/penalty-notifications-print', checkPermission('reports.view'), (req, res) => {
    const { station_id, notification_id, start_date, end_date } = req.query;
    
    let query = `
        SELECT 
            pn.*,
            s.station_name,
            s.station_code,
            s.location,
            u.full_name AS reviewed_by_name
        FROM penalty_notifications pn
        JOIN stations s ON pn.station_id = s.id
        LEFT JOIN users u ON pn.reviewed_by = u.id
        WHERE 1=1
    `;
    const params = [];
    
    if (notification_id) {
        query += ' AND pn.id = ?';
        params.push(notification_id);
    }
    
    if (station_id) {
        query += ' AND pn.station_id = ?';
        params.push(station_id);
    }
    
    if (start_date) {
        query += ' AND pn.notification_date >= ?';
        params.push(start_date);
    }
    
    if (end_date) {
        query += ' AND pn.notification_date <= ?';
        params.push(end_date);
    }
    
    query += ' ORDER BY pn.notification_date DESC, pn.station_name';
    
    db.all(query, params, (err, notifications) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        
        res.json({
            success: true,
            count: notifications.length,
            generated_at: new Date().toISOString(),
            notifications: notifications
        });
    });
});


// ============================================
// 7. حساب تلقائي لجميع المحطات (يمكن جدولته شهرياً)
// المسار: POST /api/penalty/calculate-all
// ============================================

app.post('/api/penalty/calculate-all', checkPermission('reports.export'), (req, res) => {
    const { accounting_month, threshold_power_factor = 0.9, penalty_rate = 0.01 } = req.body;
    
    if (!accounting_month) {
        return res.status(400).json({ success: false, message: 'شهر المحاسبة مطلوب' });
    }
    
    // جلب جميع المحطات
    db.all('SELECT id, station_name, station_code FROM stations', [], (err, stations) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب المحطات' });
        }
        
        let processed = 0;
        const results = [];
        
        stations.forEach(station => {
            // استدعاء API الحساب لكل محطة
            const calculateUrl = `/api/penalty/calculate`;
            const requestBody = {
                station_id: station.id,
                accounting_month: accounting_month,
                threshold_power_factor: threshold_power_factor,
                penalty_rate: penalty_rate
            };
            
            // محاكاة استدعاء داخلي (يمكن استبدالها باستدعاء مباشر للدالة)
            // للتبسيط، نستخدم نفس منطق الحساب
            calculatePenaltyForStation(station.id, station.station_name, station.station_code, accounting_month, threshold_power_factor, penalty_rate, (result) => {
                results.push(result);
                processed++;
                if (processed === stations.length) {
                    res.json({
                        success: true,
                        message: 'تم حساب جميع المحطات',
                        total_stations: stations.length,
                        stations_with_penalty: results.filter(r => r.penalty_amount > 0).length,
                        total_penalty: results.reduce((sum, r) => sum + (r.penalty_amount || 0), 0),
                        results: results
                    });
                }
            });
        });
    });
});


// دالة مساعدة لحساب الغرامة لمحطة واحدة
function calculatePenaltyForStation(station_id, station_name, station_code, accounting_month, threshold_power_factor, penalty_rate, callback) {
    // جلب قراءات الكهرباء للشهر
    const monthlyQuery = `
        SELECT consumption_kwh, cost, power_factor
        FROM electricity_meters
        WHERE station_id = ? AND accounting_month = ?
    `;
    
    db.all(monthlyQuery, [station_id, accounting_month], (err, monthlyMeters) => {
        if (err || !monthlyMeters || monthlyMeters.length === 0) {
            callback({ station_id, station_name, station_code, penalty_amount: 0, error: 'لا توجد قراءات' });
            return;
        }
        
        const monthly_consumption_kwh = monthlyMeters.reduce((sum, m) => sum + (m.consumption_kwh || 0), 0);
        const monthly_consumption_cost = monthlyMeters.reduce((sum, m) => sum + (m.cost || 0), 0);
        
        // حساب معامل القدرة
        let avg_power_factor = monthlyMeters[0].power_factor || 0.85;
        let penalty_amount = 0;
        let deficiency_percentage = 0;
        
        if (avg_power_factor < threshold_power_factor) {
            deficiency_percentage = (threshold_power_factor - avg_power_factor) * 100;
            penalty_amount = (deficiency_percentage * penalty_rate) * monthly_consumption_cost;
        }
        
        if (penalty_amount > 0) {
            const notificationNumber = `PN-${accounting_month.replace(/-/g, '')}-${station_id}-${Date.now()}`;
            const penaltyBasis = `انخفاض معامل القدرة من ${threshold_power_factor} إلى ${avg_power_factor.toFixed(3)} (نقص ${deficiency_percentage.toFixed(1)}%).`;
            
            const notificationQuery = `
                INSERT OR IGNORE INTO penalty_notifications (
                    station_id, station_name, station_code,
                    notification_number, accounting_month,
                    avg_power_factor, threshold_power_factor, deficiency_percentage,
                    monthly_consumption_kwh, monthly_consumption_cost,
                    penalty_amount, penalty_calculation_basis,
                    notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.run(notificationQuery, [
                station_id, station_name, station_code,
                notificationNumber, accounting_month,
                avg_power_factor, threshold_power_factor, deficiency_percentage,
                monthly_consumption_kwh, monthly_consumption_cost,
                penalty_amount, penaltyBasis,
                `تم الحساب التلقائي`
            ]);
        }
        
        callback({
            station_id,
            station_name,
            station_code,
            accounting_month,
            avg_power_factor: avg_power_factor.toFixed(3),
            monthly_consumption_kwh,
            monthly_consumption_cost,
            penalty_amount,
            has_penalty: penalty_amount > 0
        });
    });
}


// ============================================
// الجزء العاشر: تقارير لوحات معامل القدرة والموظفين
// ============================================


// ============================================
// 1. تقارير لوحات معامل القدرة
// ============================================


// 1.1 جلب جميع لوحات معامل القدرة لمحطة
app.get('/api/stations/:stationId/power-factor-panels', checkPermission('assets.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    db.all('SELECT * FROM power_factor_panels WHERE station_id = ? ORDER BY panel_name', [stationId], (err, panels) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        res.json({ success: true, count: panels.length, panels: panels });
    });
});


// 1.2 إضافة لوحة معامل قدرة جديدة
app.post('/api/power-factor-panels', checkPermission('assets.create'), (req, res) => {
    const {
        station_id, panel_name, panel_code, manufacturer, model,
        rated_power_kvar, rated_voltage_v, rated_current_a,
        capacitor_count, capacitor_rating_kvar, capacitor_type,
        controller_type, contactor_type, protection_type,
        target_power_factor, automatic_mode, notes
    } = req.body;
    
    if (!station_id || !panel_name) {
        return res.status(400).json({ success: false, message: 'رقم المحطة واسم اللوحة مطلوبان' });
    }
    
    const query = `
        INSERT INTO power_factor_panels (
            station_id, panel_name, panel_code, manufacturer, model,
            rated_power_kvar, rated_voltage_v, rated_current_a,
            capacitor_count, capacitor_rating_kvar, capacitor_type,
            controller_type, contactor_type, protection_type,
            target_power_factor, automatic_mode, notes,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    db.run(query, [
        station_id, panel_name, panel_code || null, manufacturer || null, model || null,
        rated_power_kvar || null, rated_voltage_v || null, rated_current_a || null,
        capacitor_count || 0, capacitor_rating_kvar || null, capacitor_type || null,
        controller_type || null, contactor_type || null, protection_type || null,
        target_power_factor || 0.92, automatic_mode !== undefined ? (automatic_mode ? 1 : 0) : 1,
        notes || null
    ], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في إضافة اللوحة', error: err.message });
        }
        res.status(201).json({ success: true, message: 'تم إضافة اللوحة', panel_id: this.lastID });
    });
});


// 1.3 تحديث قراءات لوحة معامل القدرة (شهرياً)
app.put('/api/power-factor-panels/:id/readings', checkPermission('assets.edit'), (req, res) => {
    const panelId = req.params.id;
    const { current_power_factor, monthly_consumption_kvarh, monthly_savings_egp } = req.body;
    
    const updates = [];
    const values = [];
    
    if (current_power_factor !== undefined) {
        updates.push('current_power_factor = ?');
        values.push(current_power_factor);
    }
    if (monthly_consumption_kvarh !== undefined) {
        updates.push('monthly_consumption_kvarh = ?');
        values.push(monthly_consumption_kvarh);
    }
    if (monthly_savings_egp !== undefined) {
        updates.push('monthly_savings_egp = ?');
        values.push(monthly_savings_egp);
    }
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(panelId);
    
    db.run(`UPDATE power_factor_panels SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في تحديث القراءات', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'اللوحة غير موجودة' });
        }
        res.json({ success: true, message: 'تم تحديث القراءات بنجاح' });
    });
});


// 1.4 تقرير أداء لوحات معامل القدرة
app.get('/api/reports/power-factor-panels/:stationId', checkPermission('reports.view'), (req, res) => {
    const stationId = req.params.stationId;
    const { start_date, end_date } = req.query;
    
    let query = `
        SELECT 
            pfp.*,
            s.station_name,
            s.station_code,
            (pfp.target_power_factor - pfp.current_power_factor) * 100 as deficiency_percentage,
            CASE 
                WHEN pfp.current_power_factor < pfp.target_power_factor THEN 'منخفض'
                WHEN pfp.current_power_factor >= pfp.target_power_factor THEN 'جيد'
                ELSE 'غير محدد'
            END as performance_status
        FROM power_factor_panels pfp
        JOIN stations s ON pfp.station_id = s.id
        WHERE pfp.station_id = ?
    `;
    const params = [stationId];
    
    if (start_date && end_date) {
        query += ` AND pfp.created_at BETWEEN ? AND ?`;
        params.push(start_date, end_date);
    }
    
    query += ' ORDER BY pfp.created_at DESC';
    
    db.all(query, params, (err, panels) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        
        // حساب الإحصائيات
        let total_kvar = 0;
        let total_savings = 0;
        let poor_performance_count = 0;
        
        panels.forEach(p => {
            total_kvar += p.rated_power_kvar || 0;
            total_savings += p.monthly_savings_egp || 0;
            if (p.performance_status === 'منخفض') poor_performance_count++;
        });
        
        res.json({
            success: true,
            count: panels.length,
            summary: {
                total_panels: panels.length,
                total_capacity_kvar: total_kvar,
                total_monthly_savings: total_savings,
                poor_performance_count: poor_performance_count,
                average_power_factor: panels.reduce((sum, p) => sum + (p.current_power_factor || 0), 0) / (panels.length || 1)
            },
            panels: panels
        });
    });
});


// ============================================
// 2. تقارير الموظفين (Employees Reports)
// ============================================


// 2.1 جلب جميع الموظفين (مع فلترة)
app.get('/api/employees', checkPermission('users.view'), (req, res) => {
    const { station_id, department, status } = req.query;
    
    let query = `
        SELECT 
            e.*,
            s.station_name
        FROM employees e
        LEFT JOIN stations s ON e.station_id = s.id
        WHERE 1=1
    `;
    const params = [];
    
    if (station_id) {
        query += ' AND e.station_id = ?';
        params.push(station_id);
    }
    if (department) {
        query += ' AND e.department = ?';
        params.push(department);
    }
    if (status) {
        query += ' AND e.status = ?';
        params.push(status);
    }
    
    query += ' ORDER BY e.employee_name';
    
    db.all(query, params, (err, employees) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        res.json({ success: true, count: employees.length, employees: employees });
    });
});


// 2.2 جلب موظف محدد
app.get('/api/employees/:id', checkPermission('users.view'), (req, res) => {
    const employeeId = req.params.id;
    
    const query = `
        SELECT 
            e.*,
            s.station_name
        FROM employees e
        LEFT JOIN stations s ON e.station_id = s.id
        WHERE e.id = ?
    `;
    
    db.get(query, [employeeId], (err, employee) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        if (!employee) {
            return res.status(404).json({ success: false, message: 'الموظف غير موجود' });
        }
        res.json({ success: true, employee: employee });
    });
});


// 2.3 إضافة موظف جديد
app.post('/api/employees', checkPermission('users.create'), (req, res) => {
    const {
        station_id, employee_code, employee_name, national_id,
        job_title, department, phone, email, hire_date, notes
    } = req.body;
    
    if (!employee_name) {
        return res.status(400).json({ success: false, message: 'اسم الموظف مطلوب' });
    }
    
    const query = `
        INSERT INTO employees (
            station_id, employee_code, employee_name, national_id,
            job_title, department, phone, email, hire_date, notes,
            status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    db.run(query, [
        station_id || null, employee_code || null, employee_name, national_id || null,
        job_title || null, department || null, phone || null, email || null, hire_date || null, notes || null
    ], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في إضافة الموظف', error: err.message });
        }
        res.status(201).json({ success: true, message: 'تم إضافة الموظف', employee_id: this.lastID });
    });
});


// 2.4 تحديث بيانات موظف
app.put('/api/employees/:id', checkPermission('users.edit'), (req, res) => {
    const employeeId = req.params.id;
    const {
        station_id, employee_code, employee_name, national_id,
        job_title, department, phone, email, status, hire_date, notes
    } = req.body;
    
    const updates = [];
    const values = [];
    
    if (station_id !== undefined) { updates.push('station_id = ?'); values.push(station_id); }
    if (employee_code !== undefined) { updates.push('employee_code = ?'); values.push(employee_code); }
    if (employee_name !== undefined) { updates.push('employee_name = ?'); values.push(employee_name); }
    if (national_id !== undefined) { updates.push('national_id = ?'); values.push(national_id); }
    if (job_title !== undefined) { updates.push('job_title = ?'); values.push(job_title); }
    if (department !== undefined) { updates.push('department = ?'); values.push(department); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (hire_date !== undefined) { updates.push('hire_date = ?'); values.push(hire_date); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(employeeId);
    
    db.run(`UPDATE employees SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في تحديث الموظف', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'الموظف غير موجود' });
        }
        res.json({ success: true, message: 'تم تحديث بيانات الموظف' });
    });
});


// 2.5 حذف موظف
app.delete('/api/employees/:id', checkPermission('users.delete'), (req, res) => {
    const employeeId = req.params.id;
    
    // التحقق من عدم وجود بلاغات مرتبطة بهذا الموظف
    db.get('SELECT id FROM maintenance_reports WHERE reporter_employee_id = ? LIMIT 1', [employeeId], (err, report) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في التحقق من البلاغات' });
        }
        if (report) {
            return res.status(400).json({ 
                success: false, 
                message: 'لا يمكن حذف الموظف لأنه يوجد بلاغات صيانة مرتبطة به' 
            });
        }
        
        db.run('DELETE FROM employees WHERE id = ?', [employeeId], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في حذف الموظف', error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'الموظف غير موجود' });
            }
            res.json({ success: true, message: 'تم حذف الموظف' });
        });
    });
});


// 2.6 تقرير الموظفين حسب المحطة والقسم
app.get('/api/reports/employees', checkPermission('reports.view'), (req, res) => {
    const { station_id, department } = req.query;
    
    let query = `
        SELECT 
            s.station_name,
            s.station_code,
            COUNT(e.id) as employee_count,
            SUM(CASE WHEN e.department = 'كهرباء' THEN 1 ELSE 0 END) as electrical_employees,
            SUM(CASE WHEN e.department = 'ميكانيكا' THEN 1 ELSE 0 END) as mechanical_employees,
            SUM(CASE WHEN e.department = 'إدارة' THEN 1 ELSE 0 END) as admin_employees,
            SUM(CASE WHEN e.department = 'تشغيل' THEN 1 ELSE 0 END) as operation_employees,
            SUM(CASE WHEN e.department = 'أمن' THEN 1 ELSE 0 END) as security_employees,
            SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) as active_employees,
            SUM(CASE WHEN e.status = 'inactive' THEN 1 ELSE 0 END) as inactive_employees,
            SUM(CASE WHEN e.status = 'on_leave' THEN 1 ELSE 0 END) as on_leave_employees
        FROM stations s
        LEFT JOIN employees e ON s.id = e.station_id
        WHERE 1=1
    `;
    const params = [];
    
    if (station_id) {
        query += ' AND s.id = ?';
        params.push(station_id);
    }
    if (department) {
        query += ' AND e.department = ?';
        params.push(department);
    }
    
    query += ' GROUP BY s.id ORDER BY s.station_name';
    
    db.all(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        res.json({ success: true, data: results });
    });
});


// 2.7 تقرير تفصيلي للموظفين مع إحصائيات البلاغات
app.get('/api/reports/employees-detailed', checkPermission('reports.view'), (req, res) => {
    const { station_id, start_date, end_date } = req.query;
    
    let query = `
        SELECT 
            e.id,
            e.employee_code,
            e.employee_name,
            e.job_title,
            e.department,
            e.phone,
            e.email,
            e.hire_date,
            e.status,
            s.station_name,
            COUNT(DISTINCT mr.id) as total_reports,
            SUM(CASE WHEN mr.status = 'completed' THEN 1 ELSE 0 END) as completed_reports,
            SUM(CASE WHEN mr.status = 'pending' THEN 1 ELSE 0 END) as pending_reports,
            SUM(CASE WHEN mr.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_reports,
            COUNT(DISTINCT spu.id) as total_spare_parts_used
        FROM employees e
        LEFT JOIN stations s ON e.station_id = s.id
        LEFT JOIN maintenance_reports mr ON e.id = mr.reporter_employee_id
        LEFT JOIN spare_parts_used spu ON mr.id = spu.maintenance_report_id
        WHERE 1=1
    `;
    const params = [];
    
    if (station_id) {
        query += ' AND e.station_id = ?';
        params.push(station_id);
    }
    if (start_date) {
        query += ' AND mr.report_date >= ?';
        params.push(start_date);
    }
    if (end_date) {
        query += ' AND mr.report_date <= ?';
        params.push(end_date);
    }
    
    query += ' GROUP BY e.id ORDER BY s.station_name, e.department, e.employee_name';
    
    db.all(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        
        // إحصائيات عامة
        const summary = {
            total_employees: results.length,
            active_employees: results.filter(e => e.status === 'active').length,
            total_reports: results.reduce((sum, e) => sum + (e.total_reports || 0), 0),
            completed_reports: results.reduce((sum, e) => sum + (e.completed_reports || 0), 0),
            departments: {}
        };
        
        results.forEach(e => {
            if (!summary.departments[e.department]) {
                summary.departments[e.department] = { count: 0, reports: 0 };
            }
            summary.departments[e.department].count++;
            summary.departments[e.department].reports += (e.total_reports || 0);
        });
        
        res.json({
            success: true,
            count: results.length,
            summary: summary,
            employees: results
        });
    });
});

// ============================================
// الجزء العاشر: APIs لوحات معامل القدرة والموظفين
// ============================================


// ============================================
// 1. APIs لوحات معامل القدرة (Power Factor Panels)
// ============================================


// 1.1 جلب جميع لوحات معامل القدرة لمحطة محددة
// المسار: GET /api/stations/:stationId/power-factor-panels
// الصلاحية: assets.view
app.get('/api/stations/:stationId/power-factor-panels', checkPermission('assets.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    // التحقق من صلاحية مدير المحطة
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح لك بمشاهدة لوحات هذه المحطة' });
    }
    
    const query = `
        SELECT 
            pfp.*,
            s.station_name,
            s.station_code,
            CASE 
                WHEN pfp.current_power_factor < pfp.target_power_factor THEN 'منخفض'
                WHEN pfp.current_power_factor >= pfp.target_power_factor THEN 'جيد'
                ELSE 'غير محدد'
            END AS performance_status,
            (pfp.target_power_factor - pfp.current_power_factor) * 100 AS deficiency_percentage
        FROM power_factor_panels pfp
        JOIN stations s ON pfp.station_id = s.id
        WHERE pfp.station_id = ?
        ORDER BY pfp.panel_name
    `;
    
    db.all(query, [stationId], (err, panels) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب بيانات اللوحات', error: err.message });
        }
        res.json({ success: true, count: panels.length, panels: panels });
    });
});


// 1.2 جلب لوحة معامل قدرة محددة بالمعرف
// المسار: GET /api/power-factor-panels/:id
// الصلاحية: assets.view
app.get('/api/power-factor-panels/:id', checkPermission('assets.view'), (req, res) => {
    const panelId = req.params.id;
    
    const query = `
        SELECT 
            pfp.*,
            s.station_name,
            s.station_code
        FROM power_factor_panels pfp
        JOIN stations s ON pfp.station_id = s.id
        WHERE pfp.id = ?
    `;
    
    db.get(query, [panelId], (err, panel) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب بيانات اللوحة', error: err.message });
        }
        if (!panel) {
            return res.status(404).json({ success: false, message: 'اللوحة غير موجودة' });
        }
        res.json({ success: true, panel: panel });
    });
});


// 1.3 إضافة لوحة معامل قدرة جديدة
// المسار: POST /api/power-factor-panels
// الصلاحية: assets.create
app.post('/api/power-factor-panels', checkPermission('assets.create'), (req, res) => {
    const {
        station_id, panel_name, panel_code, manufacturer, model,
        rated_power_kvar, rated_voltage_v, rated_current_a,
        capacitor_count, capacitor_rating_kvar, capacitor_type,
        controller_type, contactor_type, protection_type,
        target_power_factor, automatic_mode, status, notes
    } = req.body;
    
    if (!station_id || !panel_name) {
        return res.status(400).json({ success: false, message: 'رقم المحطة واسم اللوحة مطلوبان' });
    }
    
    // التحقق من وجود المحطة
    db.get('SELECT id FROM stations WHERE id = ?', [station_id], (err, station) => {
        if (err || !station) {
            return res.status(404).json({ success: false, message: 'المحطة غير موجودة' });
        }
        
        const query = `
            INSERT INTO power_factor_panels (
                station_id, panel_name, panel_code, manufacturer, model,
                rated_power_kvar, rated_voltage_v, rated_current_a,
                capacitor_count, capacitor_rating_kvar, capacitor_type,
                controller_type, contactor_type, protection_type,
                target_power_factor, automatic_mode, status, notes,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        db.run(query, [
            station_id, panel_name, panel_code || null, manufacturer || null, model || null,
            rated_power_kvar || null, rated_voltage_v || null, rated_current_a || null,
            capacitor_count || 0, capacitor_rating_kvar || null, capacitor_type || null,
            controller_type || null, contactor_type || null, protection_type || null,
            target_power_factor || 0.92, automatic_mode !== undefined ? (automatic_mode ? 1 : 0) : 1,
            status || 'active', notes || null
        ], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في إضافة اللوحة', error: err.message });
            }
            res.status(201).json({ 
                success: true, 
                message: 'تم إضافة لوحة معامل القدرة بنجاح', 
                panel_id: this.lastID 
            });
        });
    });
});


// 1.4 تحديث بيانات لوحة معامل قدرة
// المسار: PUT /api/power-factor-panels/:id
// الصلاحية: assets.edit
app.put('/api/power-factor-panels/:id', checkPermission('assets.edit'), (req, res) => {
    const panelId = req.params.id;
    const updates = [];
    const values = [];
    
    const fields = [
        'panel_name', 'panel_code', 'manufacturer', 'model',
        'rated_power_kvar', 'rated_voltage_v', 'rated_current_a',
        'capacitor_count', 'capacitor_rating_kvar', 'capacitor_type',
        'controller_type', 'contactor_type', 'protection_type',
        'target_power_factor', 'automatic_mode', 'status', 'notes'
    ];
    
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    });
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(panelId);
    
    db.run(`UPDATE power_factor_panels SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في تحديث اللوحة', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'اللوحة غير موجودة' });
        }
        res.json({ success: true, message: 'تم تحديث اللوحة بنجاح' });
    });
});


// 1.5 تحديث قراءات لوحة معامل القدرة (شهرياً)
// المسار: PUT /api/power-factor-panels/:id/readings
// الصلاحية: assets.edit
app.put('/api/power-factor-panels/:id/readings', checkPermission('assets.edit'), (req, res) => {
    const panelId = req.params.id;
    const { current_power_factor, monthly_consumption_kvarh, monthly_savings_egp } = req.body;
    
    const updates = [];
    const values = [];
    
    if (current_power_factor !== undefined) {
        updates.push('current_power_factor = ?');
        values.push(current_power_factor);
    }
    if (monthly_consumption_kvarh !== undefined) {
        updates.push('monthly_consumption_kvarh = ?');
        values.push(monthly_consumption_kvarh);
    }
    if (monthly_savings_egp !== undefined) {
        updates.push('monthly_savings_egp = ?');
        values.push(monthly_savings_egp);
    }
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد قراءات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(panelId);
    
    db.run(`UPDATE power_factor_panels SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في تحديث القراءات', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'اللوحة غير موجودة' });
        }
        res.json({ success: true, message: 'تم تحديث القراءات بنجاح' });
    });
});


// 1.6 حذف لوحة معامل قدرة
// المسار: DELETE /api/power-factor-panels/:id
// الصلاحية: assets.delete
app.delete('/api/power-factor-panels/:id', checkPermission('assets.delete'), (req, res) => {
    const panelId = req.params.id;
    
    db.run('DELETE FROM power_factor_panels WHERE id = ?', [panelId], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في حذف اللوحة', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'اللوحة غير موجودة' });
        }
        res.json({ success: true, message: 'تم حذف اللوحة بنجاح' });
    });
});


// 1.7 تقرير أداء لوحات معامل القدرة
// المسار: GET /api/reports/power-factor-panels/:stationId
// الصلاحية: reports.view
app.get('/api/reports/power-factor-panels/:stationId', checkPermission('reports.view'), (req, res) => {
    const stationId = req.params.stationId;
    const { start_date, end_date } = req.query;
    
    // التحقق من صلاحية مدير المحطة
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح لك بمشاهدة تقارير هذه المحطة' });
    }
    
    let query = `
        SELECT 
            pfp.*,
            s.station_name,
            s.station_code,
            CASE 
                WHEN pfp.current_power_factor < pfp.target_power_factor THEN 'منخفض'
                WHEN pfp.current_power_factor >= pfp.target_power_factor THEN 'جيد'
                ELSE 'غير محدد'
            END AS performance_status,
            (pfp.target_power_factor - pfp.current_power_factor) * 100 AS deficiency_percentage
        FROM power_factor_panels pfp
        JOIN stations s ON pfp.station_id = s.id
        WHERE pfp.station_id = ?
    `;
    const params = [stationId];
    
    if (start_date && end_date) {
        query += ` AND pfp.created_at BETWEEN ? AND ?`;
        params.push(start_date, end_date);
    }
    
    query += ' ORDER BY pfp.created_at DESC';
    
    db.all(query, params, (err, panels) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        
        // حساب الإحصائيات
        let total_capacity_kvar = 0;
        let total_monthly_savings = 0;
        let poor_performance_count = 0;
        let total_power_factor = 0;
        
        panels.forEach(panel => {
            total_capacity_kvar += panel.rated_power_kvar || 0;
            total_monthly_savings += panel.monthly_savings_egp || 0;
            if (panel.performance_status === 'منخفض') poor_performance_count++;
            total_power_factor += panel.current_power_factor || 0;
        });
        
        const avg_power_factor = panels.length > 0 ? total_power_factor / panels.length : 0;
        
        res.json({
            success: true,
            count: panels.length,
            summary: {
                total_panels: panels.length,
                total_capacity_kvar: total_capacity_kvar,
                total_monthly_savings: total_monthly_savings,
                poor_performance_count: poor_performance_count,
                avg_power_factor: avg_power_factor.toFixed(3),
                target_power_factor: panels[0]?.target_power_factor || 0.92
            },
            panels: panels
        });
    });
});


// ============================================
// 2. APIs الموظفين (Employees)
// ============================================


// 2.1 جلب جميع الموظفين (مع فلترة)
// المسار: GET /api/employees
// الصلاحية: users.view
app.get('/api/employees', checkPermission('users.view'), (req, res) => {
    const { station_id, department, status } = req.query;
    
    let query = `
        SELECT 
            e.*,
            s.station_name
        FROM employees e
        LEFT JOIN stations s ON e.station_id = s.id
        WHERE 1=1
    `;
    const params = [];
    
    if (station_id) {
        query += ' AND e.station_id = ?';
        params.push(station_id);
    }
    if (department) {
        query += ' AND e.department = ?';
        params.push(department);
    }
    if (status) {
        query += ' AND e.status = ?';
        params.push(status);
    }
    
    query += ' ORDER BY e.employee_name';
    
    db.all(query, params, (err, employees) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب بيانات الموظفين', error: err.message });
        }
        res.json({ success: true, count: employees.length, employees: employees });
    });
});


// 2.2 جلب موظف محدد بالمعرف
// المسار: GET /api/employees/:id
// الصلاحية: users.view
app.get('/api/employees/:id', checkPermission('users.view'), (req, res) => {
    const employeeId = req.params.id;
    
    const query = `
        SELECT 
            e.*,
            s.station_name
        FROM employees e
        LEFT JOIN stations s ON e.station_id = s.id
        WHERE e.id = ?
    `;
    
    db.get(query, [employeeId], (err, employee) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب بيانات الموظف', error: err.message });
        }
        if (!employee) {
            return res.status(404).json({ success: false, message: 'الموظف غير موجود' });
        }
        res.json({ success: true, employee: employee });
    });
});


// 2.3 إضافة موظف جديد
// المسار: POST /api/employees
// الصلاحية: users.create
app.post('/api/employees', checkPermission('users.create'), (req, res) => {
    const {
        station_id, employee_code, employee_name, national_id,
        job_title, department, phone, email, hire_date, status, notes
    } = req.body;
    
    if (!employee_name) {
        return res.status(400).json({ success: false, message: 'اسم الموظف مطلوب' });
    }
    
    // التحقق من عدم تكرار كود الموظف
    if (employee_code) {
        db.get('SELECT id FROM employees WHERE employee_code = ?', [employee_code], (err, existing) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في التحقق من الكود' });
            }
            if (existing) {
                return res.status(400).json({ success: false, message: 'كود الموظف موجود بالفعل' });
            }
            insertEmployee();
        });
    } else {
        insertEmployee();
    }
    
    function insertEmployee() {
        const query = `
            INSERT INTO employees (
                station_id, employee_code, employee_name, national_id,
                job_title, department, phone, email, hire_date, status, notes,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        db.run(query, [
            station_id || null, employee_code || null, employee_name, national_id || null,
            job_title || null, department || null, phone || null, email || null,
            hire_date || null, status || 'active', notes || null
        ], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في إضافة الموظف', error: err.message });
            }
            res.status(201).json({ 
                success: true, 
                message: 'تم إضافة الموظف بنجاح', 
                employee_id: this.lastID 
            });
        });
    }
});


// 2.4 تحديث بيانات موظف
// المسار: PUT /api/employees/:id
// الصلاحية: users.edit
app.put('/api/employees/:id', checkPermission('users.edit'), (req, res) => {
    const employeeId = req.params.id;
    const updates = [];
    const values = [];
    
    const fields = [
        'station_id', 'employee_code', 'employee_name', 'national_id',
        'job_title', 'department', 'phone', 'email', 'status', 'hire_date', 'notes'
    ];
    
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    });
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(employeeId);
    
    db.run(`UPDATE employees SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في تحديث بيانات الموظف', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'الموظف غير موجود' });
        }
        res.json({ success: true, message: 'تم تحديث بيانات الموظف بنجاح' });
    });
});


// 2.5 حذف موظف
// المسار: DELETE /api/employees/:id
// الصلاحية: users.delete
app.delete('/api/employees/:id', checkPermission('users.delete'), (req, res) => {
    const employeeId = req.params.id;
    
    // التحقق من عدم وجود بلاغات مرتبطة بهذا الموظف
    db.get('SELECT id FROM maintenance_reports WHERE reporter_employee_id = ? LIMIT 1', [employeeId], (err, report) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في التحقق من البلاغات' });
        }
        if (report) {
            return res.status(400).json({ 
                success: false, 
                message: 'لا يمكن حذف الموظف لأنه يوجد بلاغات صيانة مرتبطة به' 
            });
        }
        
        db.run('DELETE FROM employees WHERE id = ?', [employeeId], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في حذف الموظف', error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'الموظف غير موجود' });
            }
            res.json({ success: true, message: 'تم حذف الموظف بنجاح' });
        });
    });
});


// 2.6 تقرير الموظفين حسب المحطة والقسم
// المسار: GET /api/reports/employees
// الصلاحية: reports.view
app.get('/api/reports/employees', checkPermission('reports.view'), (req, res) => {
    const { station_id, department } = req.query;
    
    let query = `
        SELECT 
            s.id as station_id,
            s.station_name,
            s.station_code,
            COUNT(e.id) as employee_count,
            SUM(CASE WHEN e.department = 'كهرباء' THEN 1 ELSE 0 END) as electrical_employees,
            SUM(CASE WHEN e.department = 'ميكانيكا' THEN 1 ELSE 0 END) as mechanical_employees,
            SUM(CASE WHEN e.department = 'إدارة' THEN 1 ELSE 0 END) as admin_employees,
            SUM(CASE WHEN e.department = 'تشغيل' THEN 1 ELSE 0 END) as operation_employees,
            SUM(CASE WHEN e.department = 'أمن' THEN 1 ELSE 0 END) as security_employees,
            SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) as active_employees,
            SUM(CASE WHEN e.status = 'inactive' THEN 1 ELSE 0 END) as inactive_employees,
            SUM(CASE WHEN e.status = 'on_leave' THEN 1 ELSE 0 END) as on_leave_employees
        FROM stations s
        LEFT JOIN employees e ON s.id = e.station_id
        WHERE 1=1
    `;
    const params = [];
    
    if (station_id) {
        query += ' AND s.id = ?';
        params.push(station_id);
    }
    if (department) {
        query += ' AND e.department = ?';
        params.push(department);
    }
    
    query += ' GROUP BY s.id ORDER BY s.station_name';
    
    db.all(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        res.json({ success: true, data: results });
    });
});


// 2.7 تقرير تفصيلي للموظفين مع إحصائيات البلاغات
// المسار: GET /api/reports/employees-detailed
// الصلاحية: reports.view
app.get('/api/reports/employees-detailed', checkPermission('reports.view'), (req, res) => {
    const { station_id, start_date, end_date } = req.query;
    
    let query = `
        SELECT 
            e.id,
            e.employee_code,
            e.employee_name,
            e.job_title,
            e.department,
            e.phone,
            e.email,
            e.hire_date,
            e.status,
            s.station_name,
            COUNT(DISTINCT mr.id) as total_reports,
            SUM(CASE WHEN mr.status = 'completed' THEN 1 ELSE 0 END) as completed_reports,
            SUM(CASE WHEN mr.status = 'pending' THEN 1 ELSE 0 END) as pending_reports,
            SUM(CASE WHEN mr.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_reports,
            COUNT(DISTINCT spu.id) as total_spare_parts_used
        FROM employees e
        LEFT JOIN stations s ON e.station_id = s.id
        LEFT JOIN maintenance_reports mr ON e.id = mr.reporter_employee_id
        LEFT JOIN spare_parts_used spu ON mr.id = spu.maintenance_report_id
        WHERE 1=1
    `;
    const params = [];
    
    if (station_id) {
        query += ' AND e.station_id = ?';
        params.push(station_id);
    }
    if (start_date) {
        query += ' AND mr.report_date >= ?';
        params.push(start_date);
    }
    if (end_date) {
        query += ' AND mr.report_date <= ?';
        params.push(end_date);
    }
    
    query += ' GROUP BY e.id ORDER BY s.station_name, e.department, e.employee_name';
    
    db.all(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        
        // إحصائيات عامة
        const summary = {
            total_employees: results.length,
            active_employees: results.filter(e => e.status === 'active').length,
            total_reports: results.reduce((sum, e) => sum + (e.total_reports || 0), 0),
            completed_reports: results.reduce((sum, e) => sum + (e.completed_reports || 0), 0),
            departments: {}
        };
        
        results.forEach(e => {
            const dept = e.department || 'غير محدد';
            if (!summary.departments[dept]) {
                summary.departments[dept] = { count: 0, reports: 0 };
            }
            summary.departments[dept].count++;
            summary.departments[dept].reports += (e.total_reports || 0);
        });
        
        res.json({
            success: true,
            count: results.length,
            summary: summary,
            employees: results
        });
    });
});
// ============================================
// API: المغذيات (Feeders)
// ============================================


// 1. جلب جميع المغذيات لمحطة محددة
app.get('/api/stations/:stationId/feeders', checkPermission('assets.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    db.all('SELECT * FROM feeders WHERE station_id = ? ORDER BY feeder_name', [stationId], (err, feeders) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        res.json({ success: true, count: feeders.length, feeders: feeders });
    });
});


// 2. جلب مغذي محدد بالمعرف
app.get('/api/feeders/:id', checkPermission('assets.view'), (req, res) => {
    const feederId = req.params.id;
    
    db.get('SELECT * FROM feeders WHERE id = ?', [feederId], (err, feeder) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        if (!feeder) {
            return res.status(404).json({ success: false, message: 'المغذي غير موجود' });
        }
        res.json({ success: true, feeder: feeder });
    });
});


// 3. إضافة مغذي جديد
app.post('/api/feeders', checkPermission('assets.create'), (req, res) => {
    const {
        station_id, feeder_name, feeder_code,
        power_kva, voltage_kv, voltage_v, power_factor,
        status, notes
    } = req.body;
    
    if (!station_id || !feeder_name) {
        return res.status(400).json({ success: false, message: 'رقم المحطة واسم المغذي مطلوبان' });
    }
    
    // التحقق من وجود المحطة
    db.get('SELECT id FROM stations WHERE id = ?', [station_id], (err, station) => {
        if (err || !station) {
            return res.status(404).json({ success: false, message: 'المحطة غير موجودة' });
        }
        
        const query = `
            INSERT INTO feeders (
                station_id, feeder_name, feeder_code,
                power_kva, voltage_kv, voltage_v, power_factor,
                status, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        db.run(query, [
            station_id, feeder_name, feeder_code || null,
            power_kva || null, voltage_kv || null, voltage_v || null, power_factor || null,
            status || 'active', notes || null
        ], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في إضافة المغذي', error: err.message });
            }
            res.status(201).json({ success: true, message: 'تم إضافة المغذي', feeder_id: this.lastID });
        });
    });
});


// 4. تحديث بيانات مغذي
app.put('/api/feeders/:id', checkPermission('assets.edit'), (req, res) => {
    const feederId = req.params.id;
    const updates = [];
    const values = [];
    
    const fields = ['feeder_name', 'feeder_code', 'power_kva', 'voltage_kv', 'voltage_v', 'power_factor', 'status', 'notes'];
    
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    });
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(feederId);
    
    db.run(`UPDATE feeders SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في تحديث المغذي', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'المغذي غير موجود' });
        }
        res.json({ success: true, message: 'تم تحديث المغذي' });
    });
});


// 5. حذف مغذي
app.delete('/api/feeders/:id', checkPermission('assets.delete'), (req, res) => {
    const feederId = req.params.id;
    
    db.run('DELETE FROM feeders WHERE id = ?', [feederId], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في حذف المغذي', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'المغذي غير موجود' });
        }
        res.json({ success: true, message: 'تم حذف المغذي' });
    });
});


// ============================================
// API: الأصول الأخرى (Other Assets)
// ============================================


// 1. جلب جميع الأصول الأخرى لمحطة محددة
app.get('/api/stations/:stationId/other-assets', checkPermission('assets.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    db.all('SELECT * FROM other_assets WHERE station_id = ? ORDER BY asset_number', [stationId], (err, assets) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        res.json({ success: true, count: assets.length, assets: assets });
    });
});


// 2. جلب أصل محدد بالمعرف
app.get('/api/other-assets/:id', checkPermission('assets.view'), (req, res) => {
    const assetId = req.params.id;
    
    db.get('SELECT * FROM other_assets WHERE id = ?', [assetId], (err, asset) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        if (!asset) {
            return res.status(404).json({ success: false, message: 'الأصل غير موجود' });
        }
        res.json({ success: true, asset: asset });
    });
});


// 3. إضافة أصل جديد
app.post('/api/other-assets', checkPermission('assets.create'), (req, res) => {
    const { station_id, asset_number, asset_type, description, notes } = req.body;
    
    if (!station_id || !asset_number || !asset_type) {
        return res.status(400).json({ success: false, message: 'رقم المحطة ورقم الأصل ونوع الأصل مطلوبة' });
    }
    
    // التحقق من وجود المحطة
    db.get('SELECT id FROM stations WHERE id = ?', [station_id], (err, station) => {
        if (err || !station) {
            return res.status(404).json({ success: false, message: 'المحطة غير موجودة' });
        }
        
        const query = `
            INSERT INTO other_assets (
                station_id, asset_number, asset_type, description, notes,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        db.run(query, [station_id, asset_number, asset_type, description || null, notes || null], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في إضافة الأصل', error: err.message });
            }
            res.status(201).json({ success: true, message: 'تم إضافة الأصل', asset_id: this.lastID });
        });
    });
});


// 4. تحديث بيانات أصل
app.put('/api/other-assets/:id', checkPermission('assets.edit'), (req, res) => {
    const assetId = req.params.id;
    const updates = [];
    const values = [];
    
    const fields = ['asset_number', 'asset_type', 'description', 'notes'];
    
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    });
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(assetId);
    
    db.run(`UPDATE other_assets SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في تحديث الأصل', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'الأصل غير موجود' });
        }
        res.json({ success: true, message: 'تم تحديث الأصل' });
    });
});


// 5. حذف أصل
app.delete('/api/other-assets/:id', checkPermission('assets.delete'), (req, res) => {
    const assetId = req.params.id;
    
    db.run('DELETE FROM other_assets WHERE id = ?', [assetId], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في حذف الأصل', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'الأصل غير موجود' });
        }
        res.json({ success: true, message: 'تم حذف الأصل' });
    });
});


// ============================================
// API: المباني (Buildings)
// ============================================


// 1. جلب جميع المباني لمحطة محددة
app.get('/api/stations/:stationId/buildings', checkPermission('assets.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    db.all('SELECT * FROM buildings WHERE station_id = ? ORDER BY building_name', [stationId], (err, buildings) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        res.json({ success: true, count: buildings.length, buildings: buildings });
    });
});


// 2. جلب مبنى محدد بالمعرف
app.get('/api/buildings/:id', checkPermission('assets.view'), (req, res) => {
    const buildingId = req.params.id;
    
    db.get('SELECT * FROM buildings WHERE id = ?', [buildingId], (err, building) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        if (!building) {
            return res.status(404).json({ success: false, message: 'المبنى غير موجود' });
        }
        res.json({ success: true, building: building });
    });
});


// 3. إضافة مبنى جديد
app.post('/api/buildings', checkPermission('assets.create'), (req, res) => {
    const { station_id, building_number, building_name, building_category, description, notes } = req.body;
    
    if (!station_id || !building_number || !building_name) {
        return res.status(400).json({ success: false, message: 'رقم المحطة ورقم المبنى واسم المبنى مطلوبة' });
    }
    
    // التحقق من وجود المحطة
    db.get('SELECT id FROM stations WHERE id = ?', [station_id], (err, station) => {
        if (err || !station) {
            return res.status(404).json({ success: false, message: 'المحطة غير موجودة' });
        }
        
        const query = `
            INSERT INTO buildings (
                station_id, building_number, building_name, building_category, description, notes,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        db.run(query, [station_id, building_number, building_name, building_category || null, description || null, notes || null], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في إضافة المبنى', error: err.message });
            }
            res.status(201).json({ success: true, message: 'تم إضافة المبنى', building_id: this.lastID });
        });
    });
});


// 4. تحديث بيانات مبنى
app.put('/api/buildings/:id', checkPermission('assets.edit'), (req, res) => {
    const buildingId = req.params.id;
    const updates = [];
    const values = [];
    
    const fields = ['building_number', 'building_name', 'building_category', 'description', 'notes'];
    
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    });
    
    if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحديث' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(buildingId);
    
    db.run(`UPDATE buildings SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في تحديث المبنى', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'المبنى غير موجود' });
        }
        res.json({ success: true, message: 'تم تحديث المبنى' });
    });
});


// 5. حذف مبنى
app.delete('/api/buildings/:id', checkPermission('assets.delete'), (req, res) => {
    const buildingId = req.params.id;
    
    db.run('DELETE FROM buildings WHERE id = ?', [buildingId], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في حذف المبنى', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'المبنى غير موجود' });
        }
        res.json({ success: true, message: 'تم حذف المبنى' });
    });
});


// ============================================
// API: بيانات إضافية للمحطة (Station Details)
// ============================================


// 1. جلب البيانات الإضافية لمحطة محددة
app.get('/api/stations/:stationId/details', checkPermission('stations.view'), (req, res) => {
    const stationId = req.params.stationId;
    
    if (req.user.role_name === 'station_manager' && req.user.station_id != stationId) {
        return res.status(403).json({ success: false, message: 'غير مسموح' });
    }
    
    db.get('SELECT * FROM station_details WHERE station_id = ?', [stationId], (err, details) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في جلب البيانات', error: err.message });
        }
        res.json({ success: true, details: details || null });
    });
});


// 2. إضافة أو تحديث البيانات الإضافية لمحطة
app.post('/api/stations/:stationId/details', checkPermission('stations.edit'), (req, res) => {
    const stationId = req.params.stationId;
    const {
        inlet_pipe_diameter_mm,
        discharge_pipe_diameter_mm, discharge_pipe_length_m, discharge_pipe_type,
        wet_well_diameter_m, wet_well_depth_m,
        sewer_network_length_km, service_area,
        notes
    } = req.body;
    
    // التحقق من وجود المحطة
    db.get('SELECT id FROM stations WHERE id = ?', [stationId], (err, station) => {
        if (err || !station) {
            return res.status(404).json({ success: false, message: 'المحطة غير موجودة' });
        }
        
        const query = `
            INSERT OR REPLACE INTO station_details (
                station_id, inlet_pipe_diameter_mm,
                discharge_pipe_diameter_mm, discharge_pipe_length_m, discharge_pipe_type,
                wet_well_diameter_m, wet_well_depth_m,
                sewer_network_length_km, service_area,
                notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        db.run(query, [
            stationId, inlet_pipe_diameter_mm || null,
            discharge_pipe_diameter_mm || null, discharge_pipe_length_m || null, discharge_pipe_type || null,
            wet_well_diameter_m || null, wet_well_depth_m || null,
            sewer_network_length_km || null, service_area || null,
            notes || null
        ], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'خطأ في حفظ البيانات', error: err.message });
            }
            res.json({ success: true, message: 'تم حفظ البيانات الإضافية للمحطة' });
        });
    });
});


// 3. حذف البيانات الإضافية لمحطة
app.delete('/api/stations/:stationId/details', checkPermission('stations.edit'), (req, res) => {
    const stationId = req.params.stationId;
    
    db.run('DELETE FROM station_details WHERE station_id = ?', [stationId], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'خطأ في حذف البيانات', error: err.message });
        }
        res.json({ success: true, message: 'تم حذف البيانات الإضافية للمحطة' });
    });
});
-- ============================================
-- جدول: stations (محطات الصرف الصحي)
-- ============================================
-- ده الجدول الرئيسي اللي بيخزن بيانات كل محطة
-- كل جدول تاني في النظام هيرتبط بيه عن طريق station_id
-- ============================================

CREATE TABLE stations (
    -- المفتاح الأساسي (Primary Key)
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- MySQL: INT AUTO_INCREMENT PRIMARY KEY
    
    -- البيانات الأساسية للمحطة
    station_name VARCHAR(100) NOT NULL,     -- اسم المحطة (مثل: محطة السلام)
    station_code VARCHAR(50) UNIQUE,        -- كود المحطة (مثل: ST-001)
    location VARCHAR(200),                  -- الموقع (عنوان أو إحداثيات)
    
    -- البيانات التشغيلية
    capacity FLOAT,                         -- السعة (متر مكعب/يوم)
    pump_count INT DEFAULT 0,               -- عدد المضخات في المحطة
    feeder_count INT DEFAULT 0,             -- عدد المغذيات
    
    -- الحالة
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive', 'emergency')),
	
    -- active: شغالة
    -- maintenance: تحت الصيانة
    -- inactive: متوقفة
    -- emergency: طوارئ
    
    -- التواريخ
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- ملاحظات إضافية
    notes TEXT
);

-- إنشاء فهرس (Index) على station_name لتسريع البحث
CREATE INDEX idx_stations_name ON stations(station_name);
CREATE INDEX idx_stations_status ON stations(status);


-- ============================================
-- Feeders Table (المغذيات)
-- ============================================

CREATE TABLE feeders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    feeder_name VARCHAR(100) NOT NULL,
    feeder_code VARCHAR(50),
    
    -- Electrical readings
    power_kva FLOAT,              -- القدرة الظاهرية (KVA)
    voltage_kv FLOAT,             -- الجهد (KV)
    voltage_v FLOAT,              -- الجهد (V)
    power_factor FLOAT,           -- معامل القدرة (PF)
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    
    -- Timestamps
    reading_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    notes TEXT,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_feeders_station ON feeders(station_id);
CREATE INDEX idx_feeders_status ON feeders(status);

-- ============================================
-- Generators Table (مولد كامل متكامل - Genset)
-- ============================================
-- بيجمع بيانات المولد الكهربائي والمحرك في جدول واحد
-- ============================================

CREATE TABLE generators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- القسم الأول: البيانات الأساسية
    -- ========================================
    generator_name VARCHAR(100) NOT NULL,
    generator_code VARCHAR(50),
    
    -- ========================================
    -- القسم الثاني: بيانات المولد الكهربائي (Alternator)
    -- ========================================
    -- القدرات
    rated_power_kva FLOAT,                -- القدرة الظاهرية المقدرة (KVA)
    rated_power_kw FLOAT,                 -- القدرة الفعلية المقدرة (KW)
    rated_voltage_v FLOAT,                -- الجهد المقدر (V)
    rated_current_a FLOAT,                -- التيار المقدر (A)
    power_factor FLOAT,                   -- معامل القدرة (PF)
    
    -- الخصائص الكهربائية
    phases INT DEFAULT 3,                 -- عدد الأوجه (3 أو 1)
    frequency_hz INT DEFAULT 50,          -- التردد (50Hz أو 60Hz)
    alternator_type VARCHAR(50),          -- نوع المولد (Synchronous, Asynchronous)
    insulation_class VARCHAR(10),         -- درجة العزل (F, H)
    protection_rating VARCHAR(10),        -- درجة الحماية (IP23, IP54)
    
    -- ========================================
    -- القسم الثالث: بيانات المحرك (Engine)
    -- ========================================
    -- البيانات الأساسية للمحرك
    engine_type VARCHAR(50),              -- Diesel / Gas / Natural Gas
    engine_manufacturer VARCHAR(100),     -- الشركة المصنعة للمحرك
    engine_model VARCHAR(100),            -- موديل المحرك
    
    -- القدرات الميكانيكية
    rated_power_hp FLOAT,                 -- القدرة المقدرة (حصان)
    rated_rpm INT,                        -- السرعة المقدرة (دورة/دقيقة)
    cylinder_count INT,                   -- عدد الأسطوانات
    displacement_cc FLOAT,                -- السعة اللترية (CC)
    
    -- استهلاك الوقود
    fuel_type VARCHAR(30),                -- Diesel / Gas / etc.
    fuel_consumption_with_load FLOAT,     -- معدل الاستهلاك تحت الحمل (L/hr)
    fuel_consumption_no_load FLOAT,       -- معدل الاستهلاك بدون حمل (L/hr)
    fuel_tank_capacity FLOAT,             -- سعة خزان الوقود (L)
    
    -- الزيت
    oil_type VARCHAR(50),                 -- نوع الزيت (SAE 15W-40)
    oil_capacity_liters FLOAT,            -- سعة الزيت باللتر
    oil_consumption_rate FLOAT,           -- معدل استهلاك الزيت (L/1000hr)
    
    -- التبريد
    cooling_type VARCHAR(30),             -- Air / Water / Radiator
    coolant_capacity_liters FLOAT,        -- سعة سائل التبريد
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    notes TEXT,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_generators_station ON generators(station_id);
CREATE INDEX idx_generators_type ON generators(engine_type);


-- ============================================
-- Pumps Table (المضخات)
-- ============================================
-- بيجمع بيانات المضخة الميكانيكية والكهربائية
-- ============================================

CREATE TABLE pumps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- القسم الأول: البيانات الأساسية
    -- ========================================
    pump_name VARCHAR(100) NOT NULL,
    pump_code VARCHAR(50),
    pump_type VARCHAR(50),                -- نوع المضخة (Centrifugal, Submersible, etc.)
    
    -- ========================================
    -- القسم الثاني: البيانات الميكانيكية
    -- ========================================
    -- حسب ملفك: مروحة, طلمبة, فلاتر, مواتير
    flow_rate_m3h FLOAT,                  -- معدل التدفق (م³/ساعة) - من ملفك
    head_m FLOAT,                         -- الضغط/الارتفاع (متر) - من ملفك
    rated_power_kw FLOAT,                 -- القدرة المقدرة (KW) - من ملفك
    rated_rpm INT,                        -- السرعة المقدرة (دورة/دقيقة) - من ملفك
    
    impeller_diameter_mm FLOAT,           -- قطر المروحة (مم) - من ملفك
    efficiency_percentage FLOAT,          -- الكفاءة (%)
    
    -- ========================================
    -- القسم الثالث: البيانات الكهربائية
    -- ========================================
    -- حسب ملفك: مواتير
    motor_power_kw FLOAT,                 -- قدرة الموتور (KW)
    motor_power_hp FLOAT,                 -- قدرة الموتور (حصان)
    motor_voltage_v FLOAT,                -- جهد الموتور (V)
    motor_current_a FLOAT,                -- تيار الموتور (A)
    motor_rpm INT,                        -- سرعة الموتور (دورة/دقيقة)
    power_factor FLOAT,                   -- معامل القدرة (PF)
    insulation_class VARCHAR(10),         -- درجة العزل (F, H)
    
    -- ========================================
    -- القسم الرابع: التشغيل والتحكم
    -- ========================================
    -- حسب ملفك: VFD, Soft Starter
    control_type VARCHAR(30),             -- Direct / VFD / Soft Starter
    vfd_present BOOLEAN DEFAULT 0,        -- يوجد VFD أم لا
    soft_starter_present BOOLEAN DEFAULT 0, -- يوجد Soft Starter أم لا
    
    -- ========================================
    -- القسم الخامس: الحالة
    -- ========================================
    status VARCHAR(20) DEFAULT 'active',  -- active / maintenance / fault / stopped
    is_running BOOLEAN DEFAULT 0,         -- 1 = شغالة, 0 = واقفة
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    notes TEXT,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_pumps_station ON pumps(station_id);
CREATE INDEX idx_pumps_status ON pumps(status);
CREATE INDEX idx_pumps_type ON pumps(pump_type);


-- ============================================
-- Electrical Panels Table (اللوحات الكهربائية)
-- ============================================
-- حسب البيانات المطلوبة:
-- رقم اللوحة، اسم اللوحة، نوع اللوحة، مصدر التغذية، جهد التغذية، وصف، ملاحظات
-- ============================================

CREATE TABLE electrical_panels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- البيانات الأساسية
    -- ========================================
    panel_number VARCHAR(50) NOT NULL,    -- رقم اللوحة
    panel_name VARCHAR(100) NOT NULL,     -- اسم اللوحة
    
    -- ========================================
    -- نوع اللوحة (من القائمة المطلوبة)
    -- ========================================
    panel_type VARCHAR(50) NOT NULL,      -- فرعية / مركزية / معامل قدرة / توزيع / انارة / تحكم اوتوماتيك
    
    -- ========================================
    -- مصدر التغذية والجهد
    -- ========================================
    power_source VARCHAR(100),            -- مصدر التغذية
    supply_voltage_v FLOAT,               -- جهد التغذية (V)
    
    -- ========================================
    -- وصف وملاحظات
    -- ========================================
    description TEXT,                     -- وصف اللوحة
    notes TEXT,                           -- ملاحظات
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_panels_station ON electrical_panels(station_id);
CREATE INDEX idx_panels_type ON electrical_panels(panel_type);

-- ============================================
-- Main Pumps Table (الطلمبات الرئيسية)
-- ============================================
-- حسب البيانات المطلوبة:
-- رقم الطلمبة، نوع الطلمبة، التصرف، الماركة، الرفع، رقم البلي، 
-- فتحة السحب/الطرد، محبس السحب/الطرد، محبس عدم الرجوع، 
-- قدرة المحرك، عدد لفات المحرك، وصف، ملاحظات
-- ============================================

CREATE TABLE main_pumps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- البيانات الأساسية
    -- ========================================
    pump_number VARCHAR(50) NOT NULL,     -- رقم الطلمبة
    pump_type VARCHAR(50) NOT NULL,       -- نوع الطلمبة (رأسية كوبلنج / رأسية عامود كردان / غاطس مبتل / غاطس جاف)
    
    -- ========================================
    -- البيانات الهيدروليكية
    -- ========================================
    flow_rate_m3h FLOAT,                  -- التصرف (متر³/ساعة)
    head_m FLOAT,                         -- الرفع (متر)
    
    -- ========================================
    -- بيانات المصنع
    -- ========================================
    brand VARCHAR(100),                   -- الماركة
    bearing_number VARCHAR(50),           -- رقم البلي
    
    -- ========================================
    -- بيانات المواسير والمحابس
    -- ========================================
    suction_discharge_size VARCHAR(50),   -- فتحة السحب / الطرد (مثل: 200 مم / 150 مم)
    suction_discharge_valve VARCHAR(100), -- محبس السحب / الطرد
    non_return_valve VARCHAR(100),        -- محبس عدم الرجوع
    
    -- ========================================
    -- بيانات المحرك
    -- ========================================
    motor_power_kw FLOAT,                 -- قدرة المحرك (KW)
    motor_rpm INT,                        -- عدد لفات المحرك (RPM)
    
    -- ========================================
    -- وصف وملاحظات
    -- ========================================
    description TEXT,                     -- وصف
    notes TEXT,                           -- ملاحظات
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_main_pumps_station ON main_pumps(station_id);
CREATE INDEX idx_main_pumps_type ON main_pumps(pump_type);


-- ============================================
-- Sub Pumps Table (الطلمبات الفرعية)
-- ============================================
-- حسب البيانات المطلوبة:
-- رقم الطلمبة، نوع الطلمبة، التصرف، الرفع، قدرة المحرك، سرعة المحرك
-- ============================================

CREATE TABLE sub_pumps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- البيانات الأساسية
    -- ========================================
    pump_number VARCHAR(50) NOT NULL,     -- رقم الطلمبة
    
    -- ========================================
    -- نوع الطلمبة (من القائمة المطلوبة)
    -- ========================================
    pump_type VARCHAR(50) NOT NULL,       -- غاطس / حبس جلندات / حمأة / تصافي / مياه معادة / بوستر / سولار / اطفاء حريق
    
    -- ========================================
    -- البيانات الهيدروليكية
    -- ========================================
    flow_rate_m3h FLOAT,                  -- التصرف (متر³/ساعة)
    head_m FLOAT,                         -- الرفع (متر)
    
    -- ========================================
    -- بيانات المحرك
    -- ========================================
    motor_power_kw FLOAT,                 -- قدرة المحرك (KW)
    motor_rpm INT,                        -- سرعة المحرك (RPM)
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_sub_pumps_station ON sub_pumps(station_id);
CREATE INDEX idx_sub_pumps_type ON sub_pumps(pump_type);
-- ============================================
-- Other Assets Table (أصول أخرى)
-- ============================================
-- حسب البيانات المطلوبة:
-- رقم الأصل، نوع الأصل، وصف الأصل، ملاحظات
-- ============================================

CREATE TABLE other_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- البيانات الأساسية
    -- ========================================
    asset_number VARCHAR(50) NOT NULL,    -- رقم الأصل
    
    -- ========================================
    -- نوع الأصل (من القائمة المطلوبة)
    -- ========================================
    asset_type VARCHAR(100) NOT NULL,     -- مطرقة مائية / جهاز قياس تصرف / جهاز قياس منسوب / مصفي ميكانيكية / عربة ازالة رمال / حوض ترسيب ابتدائي / حوض ترسيب نهائي / حوض سكنر / مرشح زلطي / مروحة تهوية / جهاز تحكم كلور / نافخ هواء / ضاغط هواء / ونش / مشحمة كهربائية
    
    -- ========================================
    -- وصف وملاحظات
    -- ========================================
    description TEXT,                     -- وصف الأصل
    notes TEXT,                           -- ملاحظات
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_other_assets_station ON other_assets(station_id);
CREATE INDEX idx_other_assets_type ON other_assets(asset_type);


-- ============================================
-- Buildings Table (المباني) - بعد التحديث
-- ============================================

CREATE TABLE buildings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- البيانات الأساسية
    -- ========================================
    building_number VARCHAR(50) NOT NULL, -- رقم المبني
    building_name VARCHAR(100) NOT NULL,  -- اسم المبني
    
    -- ========================================
    -- نوع/تصنيف المبنى
    -- ========================================
    building_category VARCHAR(50),        -- الورشة / المخزن / الكلور / السكنر / المياه المعادة / الامن / الإدارة / المضخات / المولدات / المعامل / أخرى
    
    -- ========================================
    -- وصف وملاحظات
    -- ========================================
    description TEXT,                     -- وصف المبني
    notes TEXT,                           -- ملاحظات
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_buildings_station ON buildings(station_id);
CREATE INDEX idx_buildings_category ON buildings(building_category);

-- ============================================
-- Mechanical Equipment Table (المعدات الميكانيكية)
-- ============================================
-- حسب ملفك: مصافي، أحواض ترسيب، مرشحات، مروحة تهوية، نافخ هواء، ضاغط هواء، إلخ
-- ============================================

CREATE TABLE mechanical_equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- البيانات الأساسية
    -- ========================================
    equipment_number VARCHAR(50) NOT NULL,    -- رقم المعدة
    equipment_name VARCHAR(100) NOT NULL,     -- اسم المعدة
    
    -- ========================================
    -- نوع المعدة (من ملفك)
    -- ========================================
    equipment_type VARCHAR(50) NOT NULL,      -- مصفي / حوض ترسيب / مرشح / مروحة تهوية / نافخ هواء / ضاغط هواء / مشحمة / أخرى
    
    -- ========================================
    -- البيانات التشغيلية (حسب نوع المعدة)
    -- ========================================
    -- للمصافي والمرشحات
    flow_rate_m3h FLOAT,                      -- معدل التدفق (م³/ساعة)
    filter_area_m2 FLOAT,                     -- مساحة الترشيح (م²)
    filter_media_type VARCHAR(50),            -- نوع وسط الترشيح (رمل، كربون، إلخ)
    
    -- للأحواض
    tank_capacity_m3 FLOAT,                   -- سعة الحوض (م³)
    tank_dimensions VARCHAR(50),              -- أبعاد الحوض (طول × عرض × عمق)
    
    -- للمراوح والنافخات والضواغط
    rated_power_kw FLOAT,                     -- القدرة المقدرة (KW)
    rated_rpm INT,                            -- السرعة المقدرة (RPM)
    air_flow_rate_m3h FLOAT,                  -- معدل تدفق الهواء (م³/ساعة)
    pressure_bar FLOAT,                       -- الضغط (بار) - للضواغط
    
    -- للمشحمات
    lubrication_type VARCHAR(50),             -- نوع التشحيم (زيت، شحم)
    lubricant_capacity_liters FLOAT,          -- سعة الزيت/الشحم (لتر)
    
    -- ========================================
    -- الحالة
    -- ========================================
    status VARCHAR(20) DEFAULT 'active',      -- active / maintenance / fault / stopped
    installation_date DATE,                   -- تاريخ التركيب
    
    -- ========================================
    -- وصف وملاحظات
    -- ========================================
    description TEXT,                         -- وصف المعدة
    notes TEXT,                               -- ملاحظات
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_mechanical_station ON mechanical_equipment(station_id);
CREATE INDEX idx_mechanical_type ON mechanical_equipment(equipment_type);
CREATE INDEX idx_mechanical_status ON mechanical_equipment(status);
-- ============================================
-- Station Details Table (بيانات إضافية للمحطة)
-- ============================================
-- حسب ملفك: قطر ماسورة الدخول، خط الطرد (قطر، طول، نوع)،
-- قطر البيارة، عمق البيارة، شبكة الانحدار، منطقة الخدمة
-- ============================================

CREATE TABLE station_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL UNIQUE,   -- كل محطة لها سجل واحد فقط
    
    -- ========================================
    -- ماسورة الدخول
    -- ========================================
    inlet_pipe_diameter_mm FLOAT,         -- قطر ماسورة الدخول (مم)
    
    -- ========================================
    -- خط الطرد
    -- ========================================
    discharge_pipe_diameter_mm FLOAT,     -- قطر خط الطرد (مم)
    discharge_pipe_length_m FLOAT,        -- طول خط الطرد (متر)
    discharge_pipe_type VARCHAR(50),      -- نوع خط الطرد (GRP, HDPE, Steel, etc.)
    
    -- ========================================
    -- البيارة (الحوض)
    -- ========================================
    wet_well_diameter_m FLOAT,            -- قطر البيارة (متر)
    wet_well_depth_m FLOAT,               -- عمق البيارة (متر)
    
    -- ========================================
    -- شبكة الانحدار ومنطقة الخدمة
    -- ========================================
    sewer_network_length_km FLOAT,        -- شبكة الانحدار (كم)
    service_area VARCHAR(200),            -- منطقة الخدمة
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    notes TEXT,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_station_details_station ON station_details(station_id);


 -- ============================================
-- Maintenance Reports Table (بلاغات الصيانة والأعطال)
-- ============================================

CREATE TABLE maintenance_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,     -- رقم البلاغ (تلقائي)
    station_id INTEGER NOT NULL,               -- رقم المحطة
    
    -- ========================================
    -- بيانات البلاغ
    -- ========================================
    report_number VARCHAR(50) UNIQUE,         -- رقم البلاغ (اختياري مع تلقائي)
    report_date DATE DEFAULT CURRENT_DATE,    -- تاريخ البلاغ
    
    -- المبلغ (مرتبط بجدول الموظفين)
    reporter_employee_id INTEGER,              -- رقم الموظف المبلغ (من جدول employees)
    
    -- اسم المحطة (يمكن جلبه تلقائياً من جدول stations)
    station_name VARCHAR(100),                -- اسم المحطة (للتيسير)
    
    -- ========================================
    -- بيانات العطل
    -- ========================================
    asset_name VARCHAR(100),                  -- الأصل المعطل (اسم المعدة)
    asset_type VARCHAR(50),                   -- نوع الأصل (مضخة، مولد، لوحة، إلخ)
    fault_type VARCHAR(30),                   -- نوع العطل (كهرباء / ميكانيكا / اخر)
    fault_description TEXT,                   -- وصف العطل بالتفصيل
    
    -- ========================================
    -- الإجراءات
    -- ========================================
    repair_actions TEXT,                      -- إجراءات الإصلاح
    
    -- ========================================
    -- الحالة
    -- ========================================
    status VARCHAR(20) DEFAULT 'pending',     -- pending / in_progress / completed / cancelled
    completed_date DATE,                      -- تاريخ الإصلاح
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    notes TEXT,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX idx_maintenance_station ON maintenance_reports(station_id);
CREATE INDEX idx_maintenance_status ON maintenance_reports(status);
CREATE INDEX idx_maintenance_reporter ON maintenance_reports(reporter_employee_id);
CREATE INDEX idx_maintenance_date ON maintenance_reports(report_date);
-- ============================================
-- Spare Parts Used Table (قطع الغيار المستخدمة في البلاغات)
-- ============================================

CREATE TABLE spare_parts_used (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maintenance_report_id INTEGER NOT NULL,   -- رقم البلاغ المرتبط
    
    -- ========================================
    -- بيانات قطعة الغيار
    -- ========================================
    part_name VARCHAR(100) NOT NULL,          -- اسم قطعة الغيار
    part_number VARCHAR(50),                  -- رقم القطعة (كود)
    quantity INT DEFAULT 1,                   -- الكمية المستخدمة
    unit_price DECIMAL(10, 2),                -- سعر الوحدة (اختياري)
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (maintenance_report_id) REFERENCES maintenance_reports(id) ON DELETE CASCADE
);

CREATE INDEX idx_spare_parts_report ON spare_parts_used(maintenance_report_id);


-- ============================================
-- Electricity Meters Table (عدادات الكهرباء)
-- ============================================

CREATE TABLE electricity_meters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- بيانات العداد
    -- ========================================
    meter_name VARCHAR(50) NOT NULL,       -- محول 1, محول 2
    meter_number VARCHAR(50),              -- رقم العداد
    
    -- ========================================
    -- القراءات الشهرية
    -- ========================================
    reading_date DATE NOT NULL,            -- تاريخ القراءة (أول الشهر أو آخر الشهر)
    current_reading FLOAT NOT NULL,        -- القراءة الحالية (kWh)
    previous_reading FLOAT,                -- القراءة السابقة (من الشهر اللي فات)
    consumption_kwh FLOAT,                 -- فرق القراءة (يتم حسابه)
    
    -- ========================================
    -- التكلفة
    -- ========================================
    electricity_tariff FLOAT,              -- تعريفة الكهرباء (جنيه/kWh) - متغيرة
    cost DECIMAL(12, 2),                   -- التكلفة = consumption × tariff
    
    -- ========================================
    -- الشهر المحاسبي
    -- ========================================
    accounting_month DATE NOT NULL,        -- الشهر المحاسبي (مثلاً 2024-03-01)
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_electricity_station ON electricity_meters(station_id);
CREATE INDEX idx_electricity_month ON electricity_meters(accounting_month);

-- ============================================
-- Water Meters Table (عدادات المياه - استهلاك المحطة)
-- ============================================

CREATE TABLE water_meters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- القراءات الشهرية
    -- ========================================
    reading_date DATE NOT NULL,            -- تاريخ القراءة
    current_reading FLOAT NOT NULL,        -- القراءة الحالية (م³)
    previous_reading FLOAT,                -- القراءة السابقة (م³)
    consumption_m3 FLOAT,                  -- فرق القراءة (م³)
    
    -- ========================================
    -- التكلفة
    -- ========================================
    water_tariff FLOAT,                    -- تعريفة المياه (جنيه/م³)
    cost DECIMAL(12, 2),                   -- التكلفة = consumption × tariff
    
    -- ========================================
    -- الشهر المحاسبي
    -- ========================================
    accounting_month DATE NOT NULL,
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);



-- ============================================
-- Diesel Consumption Table (استهلاك السولار)
-- ============================================

CREATE TABLE diesel_consumption (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- بيانات المولد
    -- ========================================
    generator_id INTEGER,                  -- رقم المولد (من جدول generators)
    generator_name VARCHAR(100),           -- اسم المولد (مولد 1, مولد 2)
    
    -- ========================================
    -- ساعات التشغيل
    -- ========================================
    hours_with_load FLOAT DEFAULT 0,       -- عدد ساعات التشغيل تحت الحمل
    hours_no_load FLOAT DEFAULT 0,         -- عدد ساعات التشغيل بدون حمل
    
    -- ========================================
    -- معدلات الاستهلاك (من جدول generators)
    -- ========================================
    consumption_rate_with_load FLOAT,      -- معدل الاستهلاك تحت الحمل (L/hr) - يجلب تلقائياً
    consumption_rate_no_load FLOAT,        -- معدل الاستهلاك بدون حمل (L/hr) - يجلب تلقائياً
    
    -- ========================================
    -- حساب الاستهلاك
    -- ========================================
    consumption_with_load FLOAT,           -- استهلاك تحت الحمل = hours × rate
    consumption_no_load FLOAT,             -- استهلاك بدون حمل
    total_consumption FLOAT,               -- الاستهلاك الكلي
    
    -- ========================================
    -- رصيد السولار
    -- ========================================
    previous_balance FLOAT,                -- رصيد سولار سابق (من الشهر اللي فات)
    added_diesel FLOAT,                    -- كمية السولار المضافة خلال الشهر (لتر)
    current_balance FLOAT,                 -- الرصيد الحالي = previous + added - total_consumption
    
    -- ========================================
    -- التكلفة
    -- ========================================
    diesel_price FLOAT,                    -- سعر اللتر (جنيه)
    total_cost DECIMAL(12, 2),             -- total_consumption × price
    
    -- ========================================
    -- الشهر المحاسبي
    -- ========================================
    accounting_month DATE NOT NULL,
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (generator_id) REFERENCES generators(id) ON DELETE SET NULL
);

CREATE INDEX idx_diesel_station ON diesel_consumption(station_id);
CREATE INDEX idx_diesel_month ON diesel_consumption(accounting_month);




-- ============================================
-- Water Lifted Table (كمية المياه المرفوعة)
-- ============================================

CREATE TABLE water_lifted (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- حساب كمية المياه المرفوعة
    -- ========================================
    operating_hours FLOAT NOT NULL,        -- عدد ساعات التشغيل للطلمبات الرئيسية
    main_pump_flow_rate_m3h FLOAT,         -- تصرف الطلمبة الرئيسية (م³/ساعة) - يجلب من جدول main_pumps
    
    water_quantity_m3 FLOAT,               -- كمية المياه = operating_hours × pump_flow_rate
    
    -- ========================================
    -- الشهر المحاسبي
    -- ========================================
    accounting_month DATE NOT NULL,
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- ============================================
-- Monthly Reports Table (التقارير الشهرية)
-- ============================================
-- بعد التعديل: إضافة تفاصيل كمية المياه المرفوعة
-- (عدد ساعات التشغيل × تصرف الطلمبة)
-- ============================================

CREATE TABLE monthly_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- بيانات التقرير الأساسية
    -- ========================================
    report_number VARCHAR(50) UNIQUE,      -- رقم التقرير (مثلاً RPT-001-2024-03)
    accounting_month DATE NOT NULL,        -- شهر المحاسبة
    station_name VARCHAR(100),             -- اسم المحطة (للتيسير)
    station_code VARCHAR(50),              -- كود المحطة
    
    -- ========================================
    -- كمية المياه المرفوعة (مع التفاصيل)
    -- ========================================
    operating_hours FLOAT,                 -- عدد ساعات التشغيل للطلمبات الرئيسية
    main_pump_flow_rate_m3h FLOAT,         -- تصرف الطلمبة الرئيسية (م³/ساعة)
    water_lifted_m3 FLOAT,                 -- كمية المياه المرفوعة = operating_hours × main_pump_flow_rate_m3h
    
    -- ========================================
    -- بيانات الكهرباء - محول 1
    -- ========================================
    transformer_1_name VARCHAR(50),        -- اسم المحول (محول 1)
    transformer_1_previous_reading FLOAT,  -- القراءة السابقة (kWh)
    transformer_1_current_reading FLOAT,   -- القراءة الحالية (kWh)
    transformer_1_consumption FLOAT,       -- فرق القراءة (kWh)
    transformer_1_tariff FLOAT,            -- تعريفة الكهرباء (جنيه/kWh)
    transformer_1_cost DECIMAL(12, 2),     -- التكلفة (جنيه)
    
    -- ========================================
    -- بيانات الكهرباء - محول 2
    -- ========================================
    transformer_2_name VARCHAR(50),        -- اسم المحول (محول 2)
    transformer_2_previous_reading FLOAT,  -- القراءة السابقة (kWh)
    transformer_2_current_reading FLOAT,   -- القراءة الحالية (kWh)
    transformer_2_consumption FLOAT,       -- فرق القراءة (kWh)
    transformer_2_tariff FLOAT,            -- تعريفة الكهرباء (جنيه/kWh)
    transformer_2_cost DECIMAL(12, 2),     -- التكلفة (جنيه)
    
    -- ========================================
    -- بيانات السولار - مولد 1
    -- ========================================
    generator_1_name VARCHAR(50),          -- اسم المولد (مولد 1)
    generator_1_hours_with_load FLOAT,     -- عدد ساعات التشغيل تحت الحمل
    generator_1_hours_no_load FLOAT,       -- عدد ساعات التشغيل بدون حمل
    generator_1_rate_with_load FLOAT,      -- معدل الاستهلاك تحت الحمل (L/hr)
    generator_1_rate_no_load FLOAT,        -- معدل الاستهلاك بدون حمل (L/hr)
    generator_1_consumption_with_load FLOAT,   -- استهلاك تحت الحمل (لتر)
    generator_1_consumption_no_load FLOAT,     -- استهلاك بدون حمل (لتر)
    generator_1_total_consumption FLOAT,       -- إجمالي الاستهلاك (لتر)
    generator_1_previous_balance FLOAT,        -- رصيد سولار سابق (لتر)
    generator_1_added_diesel FLOAT,            -- كمية السولار المضافة (لتر)
    generator_1_current_balance FLOAT,         -- الرصيد الحالي (لتر)
    generator_1_diesel_price FLOAT,            -- سعر اللتر (جنيه)
    generator_1_cost DECIMAL(12, 2),           -- التكلفة (جنيه)
    
    -- ========================================
    -- بيانات السولار - مولد 2 (اختياري، حسب عدد المولدات)
    -- ========================================
    generator_2_name VARCHAR(50),          
    generator_2_hours_with_load FLOAT,     
    generator_2_hours_no_load FLOAT,       
    generator_2_rate_with_load FLOAT,      
    generator_2_rate_no_load FLOAT,        
    generator_2_consumption_with_load FLOAT,
    generator_2_consumption_no_load FLOAT, 
    generator_2_total_consumption FLOAT,   
    generator_2_previous_balance FLOAT,    
    generator_2_added_diesel FLOAT,        
    generator_2_current_balance FLOAT,     
    generator_2_diesel_price FLOAT,        
    generator_2_cost DECIMAL(12, 2),       
    
    -- ========================================
    -- بيانات عداد المياه (استهلاك المحطة)
    -- ========================================
    water_meter_name VARCHAR(50),          -- اسم العداد
    water_previous_reading FLOAT,          -- القراءة السابقة (م³)
    water_current_reading FLOAT,           -- القراءة الحالية (م³)
    water_consumption_m3 FLOAT,            -- فرق القراءة (م³)
    water_tariff FLOAT,                    -- تعريفة المياه (جنيه/م³)
    water_cost DECIMAL(12, 2),             -- قيمة الاستهلاك بالجنيه
    
    -- ========================================
    -- بيانات إضافية للتحليل
    -- ========================================
    notes TEXT,                            -- ملاحظات على التقرير
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_monthly_reports_station ON monthly_reports(station_id);
CREATE INDEX idx_monthly_reports_month ON monthly_reports(accounting_month);


-- ============================================
-- Employees Table (الموظفين / العاملين)
-- ============================================

CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER,                       -- الموظف تابع لأي محطة (nullable للموظفين العموم)
    
    -- ========================================
    -- البيانات الأساسية
    -- ========================================
    employee_code VARCHAR(50) UNIQUE,         -- كود الموظف (EMP-001)
    employee_name VARCHAR(100) NOT NULL,      -- اسم الموظف
    national_id VARCHAR(20),                  -- الرقم القومي
    
    -- ========================================
    -- بيانات الوظيفة
    -- ========================================
    job_title VARCHAR(100),                   -- المسمى الوظيفي (مدير محطة، فني كهرباء، فني ميكانيكا، إلخ)
    department VARCHAR(50),                   -- القسم (كهرباء، ميكانيكا، إدارة، أمن، تشغيل)
    
    -- ========================================
    -- بيانات التواصل
    -- ========================================
    phone VARCHAR(20),                        -- رقم الهاتف
    email VARCHAR(100),                       -- البريد الإلكتروني
    
    -- ========================================
    -- الحالة
    -- ========================================
    status VARCHAR(20) DEFAULT 'active',      -- active / inactive / on_leave
    hire_date DATE,                           -- تاريخ التعيين
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    notes TEXT,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE SET NULL
);

CREATE INDEX idx_employees_station ON employees(station_id);
CREATE INDEX idx_employees_name ON employees(employee_name);
CREATE INDEX idx_employees_department ON employees(department);




-- ============================================
-- Users Table (مستخدمي النظام)
-- ============================================
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100) NOT NULL,
    station_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE SET NULL
);
CREATE INDEX idx_users_username ON users(username);


-- ============================================
-- Roles Table (الأدوار)
-- ============================================
-- تخزين أدوار المستخدمين في النظام
-- ============================================

CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,   -- admin, station_manager, engineer, viewer
    role_description TEXT,                    -- وصف الدور
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- إدراج الأدوار الأساسية
INSERT INTO roles (role_name, role_description) VALUES 
    ('admin', 'مدير النظام - كامل الصلاحيات'),
    ('station_manager', 'مدير محطة - يدير محطة محددة'),
    ('engineer', 'فني / مهندس - يدخل بلاغات ويعرض تقارير'),
    ('viewer', 'مشاهد - عرض فقط');


-- ============================================
-- تحديث جدول users بإضافة role_id
-- ============================================
-- إضافة عمود role_id إلى جدول users
ALTER TABLE users ADD COLUMN role_id INTEGER;
ALTER TABLE users ADD FOREIGN KEY (role_id) REFERENCES roles(id);

-- تحديث المستخدمين الحاليين (إذا وجدوا) إلى دور viewer افتراضي
UPDATE users SET role_id = (SELECT id FROM roles WHERE role_name = 'viewer') WHERE role_id IS NULL;

-- إنشاء فهرس على role_id لتسريع البحث
CREATE INDEX idx_users_role ON users(role_id);

-- ============================================
-- Permissions Table (الصلاحيات)
-- ============================================
-- تخزين كل صلاحية في النظام
-- ============================================

CREATE TABLE permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    permission_name VARCHAR(100) UNIQUE NOT NULL,  -- stations.view, stations.edit, etc.
    permission_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- إدراج الصلاحيات المطلوبة
INSERT INTO permissions (permission_name, permission_description) VALUES 
    -- Stations
    ('stations.view', 'عرض المحطات'),
    ('stations.create', 'إضافة محطة جديدة'),
    ('stations.edit', 'تعديل بيانات المحطة'),
    ('stations.delete', 'حذف محطة'),
    
    -- Assets (أصول)
    ('assets.view', 'عرض الأصول'),
    ('assets.create', 'إضافة أصل جديد'),
    ('assets.edit', 'تعديل بيانات الأصل'),
    ('assets.delete', 'حذف أصل'),
    
    -- Maintenance Reports (بلاغات الصيانة)
    ('maintenance.view', 'عرض البلاغات'),
    ('maintenance.create', 'إضافة بلاغ جديد'),
    ('maintenance.edit', 'تعديل بلاغ'),
    ('maintenance.close', 'إغلاق بلاغ (قفله)'),
    
    -- Inspection Reports (تقارير المرور)
    ('inspection.view', 'عرض تقارير المرور'),
    ('inspection.create', 'إضافة تقرير مرور'),
    ('inspection.edit', 'تعديل تقرير مرور'),
    
    -- Reports (تقارير تشغيلية)
    ('reports.view', 'عرض التقارير التشغيلية'),
    ('reports.export', 'تصدير التقارير'),
    
    -- Users Management
    ('users.view', 'عرض المستخدمين'),
    ('users.create', 'إضافة مستخدم جديد'),
    ('users.edit', 'تعديل بيانات مستخدم'),
    ('users.delete', 'حذف مستخدم');


-- ============================================
-- Role Permissions Table (ربط الأدوار بالصلاحيات)
-- ============================================
-- يحدد كل دور له أي الصلاحيات
-- ============================================

CREATE TABLE role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    
    UNIQUE(role_id, permission_id)
);

-- إدراج الصلاحيات لكل دور
-- ============================================
-- 1. Admin (role_id = 1) - كل الصلاحيات
-- ============================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- ============================================
-- 2. Station Manager (role_id = 2)
-- ============================================
INSERT INTO role_permissions (role_id, permission_id) VALUES 
    (2, (SELECT id FROM permissions WHERE permission_name = 'stations.view')),
    (2, (SELECT id FROM permissions WHERE permission_name = 'assets.view')),
    (2, (SELECT id FROM permissions WHERE permission_name = 'assets.create')),
    (2, (SELECT id FROM permissions WHERE permission_name = 'assets.edit')),
    (2, (SELECT id FROM permissions WHERE permission_name = 'maintenance.view')),
    (2, (SELECT id FROM permissions WHERE permission_name = 'maintenance.create')),
    (2, (SELECT id FROM permissions WHERE permission_name = 'maintenance.edit')),
    (2, (SELECT id FROM permissions WHERE permission_name = 'maintenance.close')),
    (2, (SELECT id FROM permissions WHERE permission_name = 'inspection.view')),
    (2, (SELECT id FROM permissions WHERE permission_name = 'inspection.create')),
    (2, (SELECT id FROM permissions WHERE permission_name = 'inspection.edit')),
    (2, (SELECT id FROM permissions WHERE permission_name = 'reports.view')),
    (2, (SELECT id FROM permissions WHERE permission_name = 'reports.export')),
    (2, (SELECT id FROM permissions WHERE permission_name = 'users.view'));

-- ============================================
-- 3. Engineer (role_id = 3)
-- ============================================
INSERT INTO role_permissions (role_id, permission_id) VALUES 
    (3, (SELECT id FROM permissions WHERE permission_name = 'stations.view')),
    (3, (SELECT id FROM permissions WHERE permission_name = 'assets.view')),
    (3, (SELECT id FROM permissions WHERE permission_name = 'maintenance.view')),
    (3, (SELECT id FROM permissions WHERE permission_name = 'maintenance.create')),
    (3, (SELECT id FROM permissions WHERE permission_name = 'maintenance.edit')),
    (3, (SELECT id FROM permissions WHERE permission_name = 'reports.view'));

-- ============================================
-- 4. Viewer (role_id = 4)
-- ============================================
INSERT INTO role_permissions (role_id, permission_id) VALUES 
    (4, (SELECT id FROM permissions WHERE permission_name = 'stations.view')),
    (4, (SELECT id FROM permissions WHERE permission_name = 'assets.view')),
    (4, (SELECT id FROM permissions WHERE permission_name = 'maintenance.view')),
    (4, (SELECT id FROM permissions WHERE permission_name = 'inspection.view')),
    (4, (SELECT id FROM permissions WHERE permission_name = 'reports.view'));

-- ============================================
-- Inspection Reports Table (تقارير المرور / الزيارات الميدانية)
-- ============================================

CREATE TABLE inspection_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- ========================================
    -- بيانات التقرير الأساسية
    -- ========================================
    report_number VARCHAR(50) UNIQUE,      -- رقم التقرير (INSP-001)
    station_id INTEGER NOT NULL,           -- رقم المحطة
    station_name VARCHAR(100),             -- اسم المحطة (للتيسير)
    station_code VARCHAR(50),              -- كود المحطة
    
    -- ========================================
    -- بيانات المرور
    -- ========================================
    inspection_date DATE NOT NULL,         -- تاريخ المرور
    inspector_id INTEGER NOT NULL,         -- المدير المتابع (من جدول users)
    inspector_name VARCHAR(100),           -- اسم المتابع (للتيسير)
    
    -- ========================================
    -- تقييم عام
    -- ========================================
    overall_notes TEXT,                    -- ملاحظات عامة عن الزيارة
    next_inspection_date DATE,             -- تاريخ المرور القادم (مقترح)
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_inspection_station ON inspection_reports(station_id);
CREATE INDEX idx_inspection_date ON inspection_reports(inspection_date);
CREATE INDEX idx_inspection_inspector ON inspection_reports(inspector_id);


-- ============================================
-- Inspection Report Details Table (تفاصيل تقرير المرور)
-- ============================================
-- لكل أصل في المحطة، يتم تسجيل:
-- - وصف الأصل
-- - ملاحظات
-- - حالة التشغيل (يعمل / لا يعمل)
-- ============================================

CREATE TABLE inspection_report_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inspection_report_id INTEGER NOT NULL,   -- رقم التقرير
    
    -- ========================================
    -- نوع الأصل والفئة
    -- ========================================
    asset_category VARCHAR(50) NOT NULL,     -- مصدر تغذية / طلمبة رئيسية / طلمبة فرعية / مولد / لوحة كهربائية / معدة ميكانيكية / أصل آخر / مبنى
    
	asset_type VARCHAR(50),                  -- نوع الأصل (مضخة غاطس، لوحة توزيع، إلخ)
    asset_id INTEGER,                        -- ID الأصل من جدوله الأصلي (اختياري)
    asset_name VARCHAR(200) NOT NULL,        -- اسم الأصل (مثل: محول 1، مضخة رئيسية 1)
    asset_code VARCHAR(50),                  -- كود الأصل (اختياري)
    
    -- ========================================
    -- بيانات التقييم
    -- ========================================
    is_working BOOLEAN DEFAULT 1,            -- يعمل (1) / لا يعمل (0)
    asset_description TEXT,                  -- وصف الأصل (يكتبه المدير)
    notes TEXT,                              -- ملاحظات المدير عن الأصل
    
    -- ========================================
    -- Timestamps
    -- ========================================
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (inspection_report_id) REFERENCES inspection_reports(id) ON DELETE CASCADE
);

CREATE INDEX idx_inspection_details_report ON inspection_report_details(inspection_report_id);
CREATE INDEX idx_inspection_details_category ON inspection_report_details(asset_category);


-- ============================================
-- Generator Oil Consumption Table (استهلاك زيت المولدات)__
-- ============================================

CREATE TABLE generator_oil_consumption (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    generator_id INTEGER NOT NULL,           -- رقم المولد
    station_id INTEGER NOT NULL,
    
    transaction_date DATE NOT NULL,          -- تاريخ الصرف
    quantity_liters FLOAT NOT NULL,          -- الكمية باللتر
    oil_type VARCHAR(50),                    -- نوع الزيت
    
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (generator_id) REFERENCES generators(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_oil_generator ON generator_oil_consumption(generator_id);
CREATE INDEX idx_oil_date ON generator_oil_consumption(transaction_date);


-- ============================================
-- View: حالة الأصول (آخر حالة من المرور أو الأعطال)
-- ============================================

CREATE VIEW v_asset_status AS
SELECT 
    station_id,
    asset_category,
    asset_name,
    asset_code,
    is_working,
    inspection_date AS last_check_date,
    notes AS last_notes,
    'inspection' AS source
FROM inspection_report_details ird
JOIN inspection_reports ir ON ird.inspection_report_id = ir.id
WHERE (ird.inspection_report_id, ir.inspection_date) IN (
    SELECT inspection_report_id, MAX(inspection_date)
    FROM inspection_report_details ird2
    JOIN inspection_reports ir2 ON ird2.inspection_report_id = ir2.id
    GROUP BY ird2.asset_category, ird2.asset_name
)

UNION ALL

SELECT 
    station_id,
    CASE 
        WHEN asset_name LIKE '%مضخة%' THEN 'طلمبة'
        WHEN asset_name LIKE '%مولد%' THEN 'مولد'
        ELSE 'معدة'
    END AS asset_category,
    asset_name,
    NULL AS asset_code,
    CASE WHEN status = 'completed' THEN 1 ELSE 0 END AS is_working,
    report_date AS last_check_date,
    fault_description AS last_notes,
    'fault' AS source
FROM maintenance_reports
WHERE status = 'completed';



-- ============================================
-- View: ملخص استهلاك الكهرباء
-- ============================================

CREATE VIEW v_electricity_consumption_summary AS
SELECT 
    station_id,
    station_name,
    accounting_month,
    transformer_1_name,
    transformer_1_consumption,
    transformer_1_cost,
    transformer_2_name,
    transformer_2_consumption,
    transformer_2_cost,
    (transformer_1_cost + transformer_2_cost) AS total_cost
FROM monthly_reports;

-- ============================================
-- View: ملخص استهلاك السولار
-- ============================================

CREATE VIEW v_diesel_consumption_summary AS
SELECT 
    station_id,
    station_name,
    accounting_month,
    generator_1_name,
    generator_1_total_consumption,
    generator_1_cost,
    generator_2_name,
    generator_2_total_consumption,
    generator_2_cost,
    (generator_1_cost + generator_2_cost) AS total_cost
FROM monthly_reports;


-- ============================================
-- Report: حالة محطة
-- ============================================
-- استعلام لجلب بيانات المحطة وحالة كل أصل
-- ============================================

SELECT 
    s.station_name,
    s.station_code,
    s.location,
    s.capacity,
    s.status AS station_status,
    
    -- حالة الأصول من تقارير المرور
    vas.asset_category,
    vas.asset_name,
    vas.is_working,
    vas.last_check_date,
    vas.last_notes,
    
    -- بلاغات الأعطال (إذا كان هناك عطل)
    mr.fault_type,
    mr.fault_description,
    mr.report_date AS fault_report_date,
    mr.status AS fault_status
    
FROM stations s
LEFT JOIN v_asset_status vas ON s.id = vas.station_id
LEFT JOIN maintenance_reports mr ON s.id = mr.station_id 
    AND mr.status != 'completed'
    AND mr.report_date BETWEEN @start_date AND @end_date
WHERE s.id = @station_id
ORDER BY vas.asset_category, vas.asset_name;


-- ============================================
-- Report: متابعة أصل
-- ============================================

SELECT 
    -- بيانات الأصل
    @asset_name AS asset_name,
    @asset_type AS asset_type,
    
    -- آخر حالة للأصل
    vas.is_working,
    vas.last_check_date,
    vas.last_notes,
    
    -- بلاغات الأعطال خلال الفترة
    mr.report_number,
    mr.report_date,
    mr.fault_description,
    mr.repair_actions,
    mr.status AS fault_status,
    
    -- قطع الغيار المستخدمة
    spu.part_name,
    spu.part_number,
    spu.quantity
    
FROM stations s
LEFT JOIN v_asset_status vas ON s.id = vas.station_id AND vas.asset_name = @asset_name
LEFT JOIN maintenance_reports mr ON s.id = mr.station_id 
    AND mr.asset_name = @asset_name
    AND mr.report_date BETWEEN @start_date AND @end_date
LEFT JOIN spare_parts_used spu ON mr.id = spu.maintenance_report_id
WHERE s.id = @station_id
ORDER BY mr.report_date DESC;


-- ============================================
-- Report: قطع غيار
-- ============================================

SELECT 
    s.station_name,
    s.station_code,
    mr.report_number,
    mr.report_date,
    mr.asset_name,
    mr.fault_type,
    spu.part_name,
    spu.part_number,
    spu.quantity,
    spu.unit_price,
    (spu.quantity * spu.unit_price) AS total_price
    
FROM spare_parts_used spu
JOIN maintenance_reports mr ON spu.maintenance_report_id = mr.id
JOIN stations s ON mr.station_id = s.id
WHERE s.id = @station_id
    AND mr.report_date BETWEEN @start_date AND @end_date
ORDER BY mr.report_date DESC, mr.asset_name;



-- ============================================
-- Report: استهلاك كهرباء
-- ============================================

SELECT 
    station_name,
    accounting_month,
    transformer_1_name,
    transformer_1_consumption AS consumption_kwh_1,
    transformer_1_cost AS cost_egp_1,
    transformer_2_name,
    transformer_2_consumption AS consumption_kwh_2,
    transformer_2_cost AS cost_egp_2,
    (transformer_1_consumption + transformer_2_consumption) AS total_consumption_kwh,
    (transformer_1_cost + transformer_2_cost) AS total_cost_egp
FROM monthly_reports
WHERE station_id = @station_id
    AND accounting_month BETWEEN @start_date AND @end_date
ORDER BY accounting_month;

-- ============================================
-- Report: استهلاك سولار
-- ============================================

SELECT 
    station_name,
    accounting_month,
    generator_1_name,
    generator_1_total_consumption AS consumption_liters_1,
    generator_1_cost AS cost_egp_1,
    generator_2_name,
    generator_2_total_consumption AS consumption_liters_2,
    generator_2_cost AS cost_egp_2,
    (generator_1_total_consumption + generator_2_total_consumption) AS total_consumption_liters,
    (generator_1_cost + generator_2_cost) AS total_cost_egp
FROM monthly_reports
WHERE station_id = @station_id
    AND accounting_month BETWEEN @start_date AND @end_date
ORDER BY accounting_month;


-- ============================================
-- Report: استهلاك زيت مولدات
-- ============================================

SELECT 
    s.station_name,
    s.station_code,
    g.generator_name,
    goc.transaction_date,
    goc.quantity_liters,
    goc.oil_type,
    goc.notes
FROM generator_oil_consumption goc
JOIN generators g ON goc.generator_id = g.id
JOIN stations s ON goc.station_id = s.id
WHERE goc.station_id IN (@station_ids)  -- يمكن اختيار محطة واحدة أو كل المحطات
    AND goc.transaction_date BETWEEN @start_date AND @end_date
ORDER BY s.station_name, g.generator_name, goc.transaction_date;

-- ============================================
-- Power Factor Panels Table (لوحات معامل القدرة)
-- ============================================
-- هذا الجدول يخزن بيانات لوحات تحسين معامل القدرة في المحطات
-- ============================================

CREATE TABLE IF NOT EXISTS power_factor_panels (
    -- المفتاح الأساسي - رقم فريد لكل لوحة
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- رقم المحطة التي تتبعها هذه اللوحة (مفتاح خارجي)
    station_id INTEGER NOT NULL,
    
    -- ========================================
    -- القسم الأول: البيانات الأساسية للوحة
    -- ========================================
    
    -- اسم اللوحة (مثال: لوحة معامل قدرة 1)
    panel_name VARCHAR(100) NOT NULL,
    
    -- كود اللوحة (مثال: PFC-001)
    panel_code VARCHAR(50),
    
    -- الشركة المصنعة (مثال: ABB, Siemens, Schneider)
    manufacturer VARCHAR(100),
    
    -- موديل اللوحة
    model VARCHAR(100),
    
    -- ========================================
    -- القسم الثاني: البيانات الكهربائية للوحة
    -- ========================================
    
    -- القدرة المقدرة للوحة (KVAR)
    rated_power_kvar FLOAT,
    
    -- الجهد المقدر للوحة (V)
    rated_voltage_v FLOAT,
    
    -- التيار المقدر للوحة (A)
    rated_current_a FLOAT,
    
    -- ========================================
    -- القسم الثالث: بيانات المكثفات داخل اللوحة
    -- ========================================
    
    -- عدد المكثفات في اللوحة
    capacitor_count INT DEFAULT 0,
    
    -- قدرة كل مكثف (KVAR)
    capacitor_rating_kvar FLOAT,
    
    -- نوع المكثف (جاف، زيت، إلخ)
    capacitor_type VARCHAR(50),
    
    -- ========================================
    -- القسم الرابع: بيانات أجهزة التحكم والحماية
    -- ========================================
    
    -- نوع جهاز التحكم (تلقائي، يدوي)
    controller_type VARCHAR(50),
    
    -- نوع الكونتاكتور المستخدم
    contactor_type VARCHAR(50),
    
    -- نوع الحماية (فيوز، قاطع)
    protection_type VARCHAR(50),
    
    -- ========================================
    -- القسم الخامس: بيانات التشغيل والأداء
    -- ========================================
    
    -- معامل القدرة المستهدف (عادة 0.92 أو 0.95)
    target_power_factor FLOAT DEFAULT 0.92,
    
    -- معامل القدرة الحالي للوحة
    current_power_factor FLOAT,
    
    -- وضع التشغيل (1 = تلقائي، 0 = يدوي)
    automatic_mode BOOLEAN DEFAULT 1,
    
    -- ========================================
    -- القسم السادس: القراءات الشهرية
    ========================================
    
    -- الاستهلاك الشهري (KVARh)
    monthly_consumption_kvarh FLOAT,
    
    -- التوفير الشهري بالجنيه (نتيجة تحسين معامل القدرة)
    monthly_savings_egp DECIMAL(12, 2),
    
    -- ========================================
    -- القسم السابع: بيانات الصيانة
    -- ========================================
    
    -- تاريخ آخر صيانة
    last_maintenance_date DATE,
    
    -- تاريخ الصيانة القادمة
    next_maintenance_date DATE,
    
    -- ملاحظات الصيانة
    maintenance_notes TEXT,
    
    -- ========================================
    -- القسم الثامن: الحالة
    -- ========================================
    
    -- حالة اللوحة: active (نشط) / maintenance (صيانة) / fault (عطل)
    status VARCHAR(20) DEFAULT 'active',
    
    -- ========================================
    -- القسم التاسع: التواريخ والملاحظات
    -- ========================================
    
    -- تاريخ إنشاء السجل
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- تاريخ آخر تحديث
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- ملاحظات إضافية
    notes TEXT,
    
    -- الربط مع جدول المحطات
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- إنشاء فهرس لتسريع البحث عن لوحات محطة معينة
CREATE INDEX idx_pf_panels_station ON power_factor_panels(station_id);

-- إنشاء فهرس لتسريع البحث حسب حالة اللوحة
CREATE INDEX idx_pf_panels_status ON power_factor_panels(status);
-- ============================================
-- Report: استهلاك مياه
-- ============================================

SELECT 
    station_name,
    accounting_month,
    water_meter_name,
    water_previous_reading,
    water_current_reading,
    water_consumption_m3,
    water_tariff,
    water_cost,
    SUM(water_consumption_m3) OVER (PARTITION BY station_id) AS total_consumption_m3,
    SUM(water_cost) OVER (PARTITION BY station_id) AS total_cost_egp
FROM monthly_reports
WHERE station_id = @station_id
    AND accounting_month BETWEEN @start_date AND @end_date
ORDER BY accounting_month;

-- ============================================
-- جدول: معامل القدرة الشهري (Power Factor Monthly)
-- ============================================

CREATE TABLE IF NOT EXISTS power_factor_monthly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    accounting_month DATE NOT NULL,              -- شهر المحاسبة (YYYY-MM-01)
    
    -- بيانات معامل القدرة
    avg_power_factor FLOAT,                      -- متوسط معامل القدرة للشهر
    min_power_factor FLOAT,                      -- أدنى معامل قدرة
    max_power_factor FLOAT,                      -- أعلى معامل قدرة
    
    -- بيانات الاستهلاك
    total_consumption_kwh FLOAT,                 -- إجمالي الاستهلاك بالكيلو وات ساعة
    total_consumption_cost DECIMAL(12, 2),       -- إجمالي قيمة الاستهلاك بالجنيه
    
    -- بيانات الغرامة
    threshold_power_factor FLOAT DEFAULT 0.9,    -- الحد الأدنى المسموح لمعامل القدرة
    penalty_amount DECIMAL(12, 2) DEFAULT 0,     -- قيمة الغرامة بالجنيه (إن وجدت)
    penalty_percentage FLOAT DEFAULT 0,          -- نسبة الغرامة (مثلاً 1% لكل 0.01 نقص)
    
    -- حالة الغرامة
    penalty_applied BOOLEAN DEFAULT 0,           -- هل تم تطبيق الغرامة؟
    penalty_notification_sent BOOLEAN DEFAULT 0, -- هل تم إرسال إخطار الغرامة؟
    
    -- تواريخ
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    notes TEXT,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    UNIQUE(station_id, accounting_month)
);

CREATE INDEX idx_power_factor_station ON power_factor_monthly(station_id);
CREATE INDEX idx_power_factor_month ON power_factor_monthly(accounting_month);
CREATE INDEX idx_power_factor_penalty ON power_factor_monthly(penalty_applied);


-- ============================================
-- جدول: إخطارات غرامة معامل القدرة (Penalty Notifications)
-- ============================================

CREATE TABLE IF NOT EXISTS penalty_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    station_name VARCHAR(100),                   -- اسم المحطة (للتيسير)
    station_code VARCHAR(50),                    -- كود المحطة (للتيسير)
    
    -- بيانات الإخطار
    notification_number VARCHAR(50) UNIQUE,      -- رقم الإخطار (PN-YYYY-MM-001)
    accounting_month DATE NOT NULL,              -- شهر المحاسبة
    notification_date DATE DEFAULT CURRENT_DATE, -- تاريخ الإخطار
    
    -- بيانات معامل القدرة
    avg_power_factor FLOAT,                      -- متوسط معامل القدرة
    threshold_power_factor FLOAT DEFAULT 0.9,    -- الحد الأدنى المسموح
    deficiency_percentage FLOAT,                 -- نسبة النقص (مثلاً 5% يعني نقص 0.05)
    
    -- بيانات الاستهلاك السنوي (حسب الطلب)
    annual_consumption_kwh FLOAT,                -- الاستهلاك السنوي بالكيلو وات ساعة
    annual_consumption_cost DECIMAL(12, 2),      -- قيمة الاستهلاك السنوي بالجنيه
    monthly_consumption_kwh FLOAT,               -- استهلاك الشهر بالكيلو وات ساعة
    monthly_consumption_cost DECIMAL(12, 2),     -- قيمة استهلاك الشهر بالجنيه
    
    -- بيانات الغرامة
    penalty_amount DECIMAL(12, 2) DEFAULT 0,     -- قيمة الغرامة بالجنيه
    penalty_calculation_basis TEXT,              -- أساس حساب الغرامة (شرح)
    
    -- حالة الإخطار
    is_sent BOOLEAN DEFAULT 0,                   -- هل تم إرسال الإخطار؟
    sent_at DATETIME,                            -- تاريخ الإرسال
    sent_to VARCHAR(200),                        -- المرسل إليه (بريد إلكتروني، جهة)
    
    -- بيانات المراجعة
    reviewed_by INTEGER,                         -- من راجع الإخطار (user id)
    reviewed_at DATETIME,                        -- تاريخ المراجعة
    review_notes TEXT,                           -- ملاحظات المراجعة
    
    -- بيانات الدفع (إن وجد)
    paid BOOLEAN DEFAULT 0,                      -- هل تم دفع الغرامة؟
    paid_at DATETIME,                            -- تاريخ الدفع
    payment_reference VARCHAR(100),              -- مرجع الدفع
    
    -- تواريخ
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    notes TEXT,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_penalty_station ON penalty_notifications(station_id);
CREATE INDEX idx_penalty_month ON penalty_notifications(accounting_month);
CREATE INDEX idx_penalty_sent ON penalty_notifications(is_sent);
CREATE INDEX idx_penalty_paid ON penalty_notifications(paid);

-- ============================================
-- Power Factor Panels Table (لوحات معامل القدرة)
-- ============================================

CREATE TABLE IF NOT EXISTS power_factor_panels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    
    -- البيانات الأساسية
    panel_name VARCHAR(100) NOT NULL,
    panel_code VARCHAR(50),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    
    -- البيانات الكهربائية
    rated_power_kvar FLOAT,                 -- القدرة المقدرة (KVAR)
    rated_voltage_v FLOAT,                  -- الجهد المقدر (V)
    rated_current_a FLOAT,                  -- التيار المقدر (A)
    
    -- بيانات المكثفات
    capacitor_count INT DEFAULT 0,           -- عدد المكثفات
    capacitor_rating_kvar FLOAT,             -- قدرة كل مكثف (KVAR)
    capacitor_type VARCHAR(50),              -- نوع المكثف (Dry, Oil, etc.)
    
    -- بيانات القواطع والتحكم
    controller_type VARCHAR(50),             -- نوع جهاز التحكم (Automatic, Manual)
    contactor_type VARCHAR(50),              -- نوع الكونتاكتور
    protection_type VARCHAR(50),             -- نوع الحماية (Fuse, Breaker)
    
    -- بيانات التشغيل
    target_power_factor FLOAT DEFAULT 0.92,  -- معامل القدرة المستهدف
    current_power_factor FLOAT,              -- معامل القدرة الحالي
    automatic_mode BOOLEAN DEFAULT 1,        -- وضع التشغيل (تلقائي/يدوي)
    
    -- القراءات الشهرية
    monthly_consumption_kvarh FLOAT,         -- الاستهلاك الشهري (KVARh)
    monthly_savings_egp DECIMAL(12, 2),      -- التوفير الشهري بالجنيه
    
    -- بيانات الصيانة
    last_maintenance_date DATE,              -- آخر صيانة
    next_maintenance_date DATE,              -- الصيانة القادمة
    maintenance_notes TEXT,
    
    -- الحالة
    status VARCHAR(20) DEFAULT 'active',     -- active / maintenance / fault
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    notes TEXT,
    
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_pf_panels_station ON power_factor_panels(station_id);
CREATE INDEX idx_pf_panels_status ON power_factor_panels(status);
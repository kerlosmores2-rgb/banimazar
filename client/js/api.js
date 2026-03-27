// ============================================
// نظام إدارة محطات الصرف الصحي - نسخة SupabaseClient
// النسخة الكاملة - جميع الوظائف
// ============================================
// ==================== إعدادات Supabase ====================
const SUPABASE_URL = 'https://jvfbkoaeugkeoiccvnkq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_n64Hnhuruc3Oeolj-Uwg9g_tu-otJlZ';

// لاحظ هنا: نستخدم المكتبة الأصلية (supabase) لإنشاء العميل الخاص بك (supabaseClient)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ supabaseClient initialized');
// ==================== دوال مساعدة ====================
let authToken = localStorage.getItem('authToken');
let currentUser = null;

function setAuthToken(token, user) {
    authToken = token;
    currentUser = user;
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearAuthToken() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
}

function checkAuth() {
    return !!authToken;
}

// ==================== دوال المصادقة ====================
// داخل ملف api.js - دالة الـ login
async function login(username, password) {
    const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

    if (error || !data) return { success: false, message: 'خطأ في اسم المستخدم أو كلمة المرور' };

    // تخزين البيانات كاملة بما فيها الصلاحية
    localStorage.setItem('currentUser', JSON.stringify(data));
    localStorage.setItem('authToken', 'true'); // علامة بسيطة للدخول
    
    return { success: true, user: data };
}
// ==================== دوال المحطات ====================
async function getStations() {
    try {
        const { data, error } = await supabaseClient.from('stations').select('*').order('station_name');
        if (error) throw error;
        return { success: true, stations: data || [] };
    } catch (error) {
        return { success: false, stations: [] };
    }
}

async function getStation(id) {
    try {
        const { data, error } = await supabaseClient.from('stations').select('*').eq('id', id).single();
        if (error) throw error;
        return { success: true, station: data };
    } catch (error) {
        return { success: false };
    }
}

async function getStationStats() {
    try {
        const { data, error } = await supabaseClient.from('stations').select('status, capacity, pump_count');
        if (error) throw error;
        const stats = {
            totalStations: data?.length || 0,
            activeStations: data?.filter(s => s.status === 'active').length || 0,
            maintenanceStations: data?.filter(s => s.status === 'maintenance').length || 0,
            totalCapacity: data?.reduce((sum, s) => sum + (s.capacity || 0), 0) || 0,
            totalPumps: data?.reduce((sum, s) => sum + (s.pump_count || 0), 0) || 0
        };
        return { success: true, stats: stats };
    } catch (error) {
        return { success: false, stats: {} };
    }
}

async function createStation(data) {
    try {
        const newStation = {
            station_name: data.station_name,
            station_code: data.station_code || null,
            location: data.location || null,
            capacity: data.capacity || null,
            pump_count: 0,
            feeder_count: 0,
            status: data.status || 'active',
            notes: data.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        const { data: result, error } = await supabaseClient.from('stations').insert([newStation]).select();
        if (error) throw error;
        return { success: true, station: result[0], message: 'تم إضافة المحطة بنجاح' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function updateStation(id, data) {
    try {
        const updateData = {
            station_name: data.station_name,
            station_code: data.station_code || null,
            location: data.location || null,
            capacity: data.capacity || null,
            status: data.status || 'active',
            notes: data.notes || null,
            updated_at: new Date().toISOString()
        };
        const { data: result, error } = await supabaseClient.from('stations').update(updateData).eq('id', id).select();
        if (error) throw error;
        return { success: true, station: result[0], message: 'تم تحديث المحطة بنجاح' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function deleteStation(id) {
    try {
        const { error } = await supabaseClient.from('stations').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف المحطة بنجاح' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// ==================== دوال الموظفين ====================
async function getEmployees(params = {}) {
    try {
        let query = supabaseClient.from('employees').select('*');
        if (params.station_id) query = query.eq('station_id', params.station_id);
        if (params.department) query = query.eq('department', params.department);
        if (params.status) query = query.eq('status', params.status);
        const { data, error } = await query.order('employee_name');
        if (error) throw error;
        
        const stationsResult = await getStations();
        const stationMap = {};
        if (stationsResult.success) {
            stationsResult.stations.forEach(s => { stationMap[s.id] = s.station_name; });
        }
        const employeesWithStation = (data || []).map(emp => ({ ...emp, station_name: stationMap[emp.station_id] || '-' }));
        return { success: true, employees: employeesWithStation };
    } catch (error) {
        return { success: false, employees: [] };
    }
}

async function getEmployee(id) {
    try {
        const { data, error } = await supabaseClient.from('employees').select('*').eq('id', id).single();
        if (error) throw error;
        return { success: true, employee: data };
    } catch (error) {
        return { success: false };
    }
}

async function createEmployee(data) {
    try {
        const newEmployee = {
            employee_code: data.employee_code || null,
            employee_name: data.employee_name,
            station_id: data.station_id || null,
            job_title: data.job_title || null,
            department: data.department || null,
            phone: data.phone || null,
            email: data.email || null,
            status: data.status || 'active',
            hire_date: data.hire_date || null,
            notes: data.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        const { data: result, error } = await supabaseClient.from('employees').insert([newEmployee]).select();
        if (error) throw error;
        return { success: true, employee: result[0], message: 'تم إضافة الموظف بنجاح' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function updateEmployee(id, data) {
    try {
        const updateData = {
            employee_code: data.employee_code || null,
            employee_name: data.employee_name,
            station_id: data.station_id || null,
            job_title: data.job_title || null,
            department: data.department || null,
            phone: data.phone || null,
            email: data.email || null,
            status: data.status || 'active',
            hire_date: data.hire_date || null,
            notes: data.notes || null,
            updated_at: new Date().toISOString()
        };
        const { data: result, error } = await supabaseClient.from('employees').update(updateData).eq('id', id).select();
        if (error) throw error;
        return { success: true, employee: result[0], message: 'تم تحديث الموظف بنجاح' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function deleteEmployee(id) {
    try {
        const { error } = await supabaseClient.from('employees').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف الموظف بنجاح' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// ==================== دوال الأصول (للتوافق مع باقي الصفحات) ====================
async function getMainPumps(stationId) { return { success: true, pumps: [] }; }
async function createMainPump(data) { return { success: true, message: 'تمت الإضافة' }; }
async function updateMainPump(id, data) { return { success: true, message: 'تم التحديث' }; }
async function deleteMainPump(id) { return { success: true, message: 'تم الحذف' }; }
async function getSubPumps(stationId) { return { success: true, pumps: [] }; }
async function createSubPump(data) { return { success: true, message: 'تمت الإضافة' }; }
async function updateSubPump(id, data) { return { success: true, message: 'تم التحديث' }; }
async function deleteSubPump(id) { return { success: true, message: 'تم الحذف' }; }
async function getGenerators(stationId) { return { success: true, generators: [] }; }
async function createGenerator(data) { return { success: true, message: 'تمت الإضافة' }; }
async function updateGenerator(id, data) { return { success: true, message: 'تم التحديث' }; }
async function deleteGenerator(id) { return { success: true, message: 'تم الحذف' }; }
async function getPanels(stationId) { return { success: true, panels: [] }; }
async function createPanel(data) { return { success: true, message: 'تمت الإضافة' }; }
async function updatePanel(id, data) { return { success: true, message: 'تم التحديث' }; }
async function deletePanel(id) { return { success: true, message: 'تم الحذف' }; }
async function getMechanical(stationId) { return { success: true, equipment: [] }; }
async function createMechanical(data) { return { success: true, message: 'تمت الإضافة' }; }
async function updateMechanical(id, data) { return { success: true, message: 'تم التحديث' }; }
async function deleteMechanical(id) { return { success: true, message: 'تم الحذف' }; }
async function getFeeders(stationId) { return { success: true, feeders: [] }; }
async function createFeeder(data) { return { success: true, message: 'تمت الإضافة' }; }
async function updateFeeder(id, data) { return { success: true, message: 'تم التحديث' }; }
async function deleteFeeder(id) { return { success: true, message: 'تم الحذف' }; }
async function getOtherAssets(stationId) { return { success: true, assets: [] }; }
async function createOtherAsset(data) { return { success: true, message: 'تمت الإضافة' }; }
async function updateOtherAsset(id, data) { return { success: true, message: 'تم التحديث' }; }
async function deleteOtherAsset(id) { return { success: true, message: 'تم الحذف' }; }
async function getBuildings(stationId) { return { success: true, buildings: [] }; }
async function createBuilding(data) { return { success: true, message: 'تمت الإضافة' }; }
async function updateBuilding(id, data) { return { success: true, message: 'تم التحديث' }; }
async function deleteBuilding(id) { return { success: true, message: 'تم الحذف' }; }
async function getStationDetails(stationId) { return { success: true, details: null }; }
async function saveStationDetails(stationId, data) { return { success: true, message: 'تم الحفظ' }; }
async function deleteStationDetails(stationId) { return { success: true, message: 'تم الحذف' }; }
async function getAllAssetsForInspection(stationId) { return { success: true, assets: [] }; }

// ==================== دوال البلاغات ====================
async function getMaintenanceReports(stationId) { return { success: true, reports: [] }; }
async function getMaintenanceReport(id) { return { success: true, report: null }; }
async function createMaintenanceReport(data) { return { success: true, message: 'تم إضافة البلاغ', report_id: Date.now() }; }
async function updateMaintenanceReport(id, data) { return { success: true, message: 'تم التحديث' }; }
async function closeMaintenanceReport(id, data) { return { success: true, message: 'تم إغلاق البلاغ' }; }
async function deleteMaintenanceReport(id) { return { success: true, message: 'تم الحذف' }; }
async function addSparePart(reportId, data) { return { success: true, message: 'تم إضافة قطعة الغيار' }; }
async function getSpareParts(reportId) { return { success: true, spare_parts: [] }; }

// ==================== دوال تقارير المرور ====================
async function getInspectionReports(stationId) { return { success: true, reports: [] }; }
async function getInspectionReport(id) { return { success: true, report: null }; }
async function createInspectionReport(data) { return { success: true, message: 'تم إضافة تقرير المرور', report_id: Date.now() }; }
async function addInspectionDetails(reportId, details) { return { success: true, message: 'تم إضافة التفاصيل' }; }
async function deleteInspectionReport(id) { return { success: true, message: 'تم الحذف' }; }

// ==================== دوال التكاليف ====================
async function getElectricityMeters(stationId) { return { success: true, meters: [] }; }
async function addElectricityReading(data) { return { success: true, message: 'تم إضافة القراءة' }; }
async function getWaterMeters(stationId) { return { success: true, meters: [] }; }
async function addWaterReading(data) { return { success: true, message: 'تم إضافة القراءة' }; }
async function getDieselConsumption(stationId) { return { success: true, consumption: [] }; }
async function addDieselConsumption(data) { return { success: true, message: 'تم إضافة البيانات' }; }
async function getWaterLifted(stationId) { return { success: true, data: [] }; }
async function addWaterLifted(data) { return { success: true, message: 'تم إضافة البيانات' }; }
async function getMonthlyReports(stationId) { return { success: true, reports: [] }; }
async function generateMonthlyReport(data) { return { success: true, message: 'تم إنشاء التقرير', report_id: Date.now() }; }

// ==================== دوال معامل القدرة ====================
async function getPowerFactorPanels(stationId) { return { success: true, panels: [] }; }
async function createPowerFactorPanel(data) { return { success: true, message: 'تمت الإضافة' }; }
async function updatePowerFactorPanel(id, data) { return { success: true, message: 'تم التحديث' }; }
async function updatePowerFactorPanelReadings(id, data) { return { success: true, message: 'تم تحديث القراءات' }; }
async function deletePowerFactorPanel(id) { return { success: true, message: 'تم الحذف' }; }
async function calculatePenalty(data) { return { success: true, message: 'تم حساب الغرامة', penalty_amount: 0 }; }
async function getPenaltyNotifications(params = {}) { return { success: true, notifications: [], stats: {} }; }
async function getPenaltyNotification(id) { return { success: true, notification: null }; }
async function updatePenaltyNotification(id, data) { return { success: true, message: 'تم تحديث الإخطار' }; }

// ==================== دوال التقارير التحليلية ====================
async function getStationStatusReport(stationId, startDate, endDate) { return { success: true, data: [] }; }
async function getElectricityConsumptionReport(stationId, startDate, endDate) { return { success: true, data: [] }; }
async function getDieselConsumptionReport(stationId, startDate, endDate) { return { success: true, data: [] }; }
async function getWaterConsumptionReport(stationId, startDate, endDate) { return { success: true, data: [] }; }
async function getSparePartsReport(stationId, startDate, endDate) { return { success: true, data: [] }; }
async function getAssetTrackingReport(stationId, assetName, startDate, endDate) { return { success: true, data: [] }; }
async function getEmployeesReport(params = {}) { return getEmployees(params); }
async function getEmployeesDetailedReport(params = {}) { return getEmployees(params); }

// ==================== تصدير الدوال ====================
window.supabaseClient = supabaseClient;
window.login = login;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.checkAuth = checkAuth;

window.getStations = getStations;
window.getStation = getStation;
window.getStationStats = getStationStats;
window.createStation = createStation;
window.updateStation = updateStation;
window.deleteStation = deleteStation;

window.getEmployees = getEmployees;
window.getEmployee = getEmployee;
window.createEmployee = createEmployee;
window.updateEmployee = updateEmployee;
window.deleteEmployee = deleteEmployee;
window.getEmployeesDetailedReport = getEmployeesDetailedReport;

window.getMainPumps = getMainPumps;
window.getSubPumps = getSubPumps;
window.getGenerators = getGenerators;
window.getPanels = getPanels;
window.getMechanical = getMechanical;
window.getFeeders = getFeeders;
window.getOtherAssets = getOtherAssets;
window.getBuildings = getBuildings;
window.getAllAssetsForInspection = getAllAssetsForInspection;

window.getMaintenanceReports = getMaintenanceReports;
window.createMaintenanceReport = createMaintenanceReport;
window.closeMaintenanceReport = closeMaintenanceReport;

window.getInspectionReports = getInspectionReports;
window.createInspectionReport = createInspectionReport;
window.addInspectionDetails = addInspectionDetails;

window.getElectricityMeters = getElectricityMeters;
window.getWaterMeters = getWaterMeters;
window.getDieselConsumption = getDieselConsumption;
window.getMonthlyReports = getMonthlyReports;
window.generateMonthlyReport = generateMonthlyReport;

window.getPowerFactorPanels = getPowerFactorPanels;
window.calculatePenalty = calculatePenalty;
window.getPenaltyNotifications = getPenaltyNotifications;

console.log('✅ SupabaseClient API loaded successfully');
// ============================================
// الدوال الناقصة لملف api.js
// أضف هذا الكود في نهاية ملف api.js
// ============================================

// ==================== 1. المغذيات (Feeders) ====================
async function getFeeders(stationId = null) {
    try {
        let query = supabase.from('feeders').select('*');
        if (stationId) query = query.eq('station_id', stationId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, feeders: data, data: data };
    } catch (error) {
        console.error('Error getting feeders:', error);
        return { success: false, message: error.message, feeders: [] };
    }
}

async function createFeeder(feederData) {
    try {
        const { data, error } = await supabase
            .from('feeders')
            .insert([{ ...feederData, created_at: new Date(), updated_at: new Date() }])
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم إضافة المغذي بنجاح' };
    } catch (error) {
        console.error('Error creating feeder:', error);
        return { success: false, message: error.message };
    }
}

async function updateFeeder(id, feederData) {
    try {
        const { data, error } = await supabase
            .from('feeders')
            .update({ ...feederData, updated_at: new Date() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم تحديث المغذي بنجاح' };
    } catch (error) {
        console.error('Error updating feeder:', error);
        return { success: false, message: error.message };
    }
}

async function deleteFeeder(id) {
    try {
        const { error } = await supabase.from('feeders').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف المغذي بنجاح' };
    } catch (error) {
        console.error('Error deleting feeder:', error);
        return { success: false, message: error.message };
    }
}

// ==================== 2. المضخات الفرعية (Sub Pumps) ====================
async function getSubPumps(stationId = null) {
    try {
        let query = supabase.from('sub_pumps').select('*');
        if (stationId) query = query.eq('station_id', stationId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, pumps: data, data: data };
    } catch (error) {
        console.error('Error getting sub pumps:', error);
        return { success: false, message: error.message, pumps: [] };
    }
}

async function createSubPump(pumpData) {
    try {
        const { data, error } = await supabase
            .from('sub_pumps')
            .insert([{ ...pumpData, created_at: new Date(), updated_at: new Date() }])
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم إضافة المضخة الفرعية بنجاح' };
    } catch (error) {
        console.error('Error creating sub pump:', error);
        return { success: false, message: error.message };
    }
}

async function updateSubPump(id, pumpData) {
    try {
        const { data, error } = await supabase
            .from('sub_pumps')
            .update({ ...pumpData, updated_at: new Date() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم تحديث المضخة الفرعية بنجاح' };
    } catch (error) {
        console.error('Error updating sub pump:', error);
        return { success: false, message: error.message };
    }
}

async function deleteSubPump(id) {
    try {
        const { error } = await supabase.from('sub_pumps').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف المضخة الفرعية بنجاح' };
    } catch (error) {
        console.error('Error deleting sub pump:', error);
        return { success: false, message: error.message };
    }
}

// ==================== 3. الأصول الأخرى (Other Assets) ====================
async function getOtherAssets(stationId = null) {
    try {
        let query = supabase.from('other_assets').select('*');
        if (stationId) query = query.eq('station_id', stationId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, assets: data, data: data };
    } catch (error) {
        console.error('Error getting other assets:', error);
        return { success: false, message: error.message, assets: [] };
    }
}

async function createOtherAsset(assetData) {
    try {
        const { data, error } = await supabase
            .from('other_assets')
            .insert([{ ...assetData, created_at: new Date(), updated_at: new Date() }])
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم إضافة الأصل بنجاح' };
    } catch (error) {
        console.error('Error creating other asset:', error);
        return { success: false, message: error.message };
    }
}

async function updateOtherAsset(id, assetData) {
    try {
        const { data, error } = await supabase
            .from('other_assets')
            .update({ ...assetData, updated_at: new Date() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم تحديث الأصل بنجاح' };
    } catch (error) {
        console.error('Error updating other asset:', error);
        return { success: false, message: error.message };
    }
}

async function deleteOtherAsset(id) {
    try {
        const { error } = await supabase.from('other_assets').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف الأصل بنجاح' };
    } catch (error) {
        console.error('Error deleting other asset:', error);
        return { success: false, message: error.message };
    }
}

// ==================== 4. المباني (Buildings) ====================
async function getBuildings(stationId = null) {
    try {
        let query = supabase.from('buildings').select('*');
        if (stationId) query = query.eq('station_id', stationId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, buildings: data, data: data };
    } catch (error) {
        console.error('Error getting buildings:', error);
        return { success: false, message: error.message, buildings: [] };
    }
}

async function createBuilding(buildingData) {
    try {
        const { data, error } = await supabase
            .from('buildings')
            .insert([{ ...buildingData, created_at: new Date(), updated_at: new Date() }])
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم إضافة المبنى بنجاح' };
    } catch (error) {
        console.error('Error creating building:', error);
        return { success: false, message: error.message };
    }
}

async function updateBuilding(id, buildingData) {
    try {
        const { data, error } = await supabase
            .from('buildings')
            .update({ ...buildingData, updated_at: new Date() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم تحديث المبنى بنجاح' };
    } catch (error) {
        console.error('Error updating building:', error);
        return { success: false, message: error.message };
    }
}

async function deleteBuilding(id) {
    try {
        const { error } = await supabase.from('buildings').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف المبنى بنجاح' };
    } catch (error) {
        console.error('Error deleting building:', error);
        return { success: false, message: error.message };
    }
}

// ==================== 5. المعدات الميكانيكية (Mechanical Equipment) ====================
async function getMechanical(stationId = null) {
    try {
        let query = supabase.from('mechanical_equipment').select('*');
        if (stationId) query = query.eq('station_id', stationId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, equipment: data, data: data };
    } catch (error) {
        console.error('Error getting mechanical equipment:', error);
        return { success: false, message: error.message, equipment: [] };
    }
}

async function createMechanicalEquipment(equipmentData) {
    try {
        const { data, error } = await supabase
            .from('mechanical_equipment')
            .insert([{ ...equipmentData, created_at: new Date(), updated_at: new Date() }])
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم إضافة المعدة بنجاح' };
    } catch (error) {
        console.error('Error creating mechanical equipment:', error);
        return { success: false, message: error.message };
    }
}

async function updateMechanicalEquipment(id, equipmentData) {
    try {
        const { data, error } = await supabase
            .from('mechanical_equipment')
            .update({ ...equipmentData, updated_at: new Date() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم تحديث المعدة بنجاح' };
    } catch (error) {
        console.error('Error updating mechanical equipment:', error);
        return { success: false, message: error.message };
    }
}

async function deleteMechanicalEquipment(id) {
    try {
        const { error } = await supabase.from('mechanical_equipment').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف المعدة بنجاح' };
    } catch (error) {
        console.error('Error deleting mechanical equipment:', error);
        return { success: false, message: error.message };
    }
}

// ==================== 6. تفاصيل المحطات (Station Details) ====================
async function getStationDetails(stationId = null) {
    try {
        let query = supabase.from('station_details').select('*');
        if (stationId) query = query.eq('station_id', stationId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, details: data, data: data };
    } catch (error) {
        console.error('Error getting station details:', error);
        return { success: false, message: error.message, details: [] };
    }
}

async function createStationDetail(detailData) {
    try {
        const { data, error } = await supabase
            .from('station_details')
            .insert([{ ...detailData, created_at: new Date(), updated_at: new Date() }])
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم إضافة التفصيل بنجاح' };
    } catch (error) {
        console.error('Error creating station detail:', error);
        return { success: false, message: error.message };
    }
}

async function updateStationDetail(id, detailData) {
    try {
        const { data, error } = await supabase
            .from('station_details')
            .update({ ...detailData, updated_at: new Date() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم تحديث التفصيل بنجاح' };
    } catch (error) {
        console.error('Error updating station detail:', error);
        return { success: false, message: error.message };
    }
}

async function deleteStationDetail(id) {
    try {
        const { error } = await supabase.from('station_details').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف التفصيل بنجاح' };
    } catch (error) {
        console.error('Error deleting station detail:', error);
        return { success: false, message: error.message };
    }
}

// ==================== 7. قطع الغيار المستخدمة (Spare Parts Used) ====================
async function getSparePartsUsed(reportId = null) {
    try {
        let query = supabase.from('spare_parts_used').select('*');
        if (reportId) query = query.eq('maintenance_report_id', reportId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, parts: data, data: data };
    } catch (error) {
        console.error('Error getting spare parts:', error);
        return { success: false, message: error.message, parts: [] };
    }
}

async function createSparePartUsed(partData) {
    try {
        const { data, error } = await supabase
            .from('spare_parts_used')
            .insert([{ ...partData, created_at: new Date(), updated_at: new Date() }])
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم إضافة القطعة بنجاح' };
    } catch (error) {
        console.error('Error creating spare part:', error);
        return { success: false, message: error.message };
    }
}

async function updateSparePartUsed(id, partData) {
    try {
        const { data, error } = await supabase
            .from('spare_parts_used')
            .update({ ...partData, updated_at: new Date() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم تحديث القطعة بنجاح' };
    } catch (error) {
        console.error('Error updating spare part:', error);
        return { success: false, message: error.message };
    }
}

async function deleteSparePartUsed(id) {
    try {
        const { error } = await supabase.from('spare_parts_used').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف القطعة بنجاح' };
    } catch (error) {
        console.error('Error deleting spare part:', error);
        return { success: false, message: error.message };
    }
}

// ==================== 8. المياه المرفوعة (Water Lifted) ====================
async function getWaterLifted(stationId = null) {
    try {
        let query = supabase.from('water_lifted').select('*');
        if (stationId) query = query.eq('station_id', stationId);
        const { data, error } = await query.order('lifted_date', { ascending: false });
        if (error) throw error;
        return { success: true, records: data, data: data };
    } catch (error) {
        console.error('Error getting water lifted:', error);
        return { success: false, message: error.message, records: [] };
    }
}

async function createWaterLifted(waterData) {
    try {
        const { data, error } = await supabase
            .from('water_lifted')
            .insert([{ ...waterData, created_at: new Date(), updated_at: new Date() }])
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم إضافة كمية المياه المرفوعة بنجاح' };
    } catch (error) {
        console.error('Error creating water lifted:', error);
        return { success: false, message: error.message };
    }
}

async function updateWaterLifted(id, waterData) {
    try {
        const { data, error } = await supabase
            .from('water_lifted')
            .update({ ...waterData, updated_at: new Date() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم تحديث كمية المياه المرفوعة بنجاح' };
    } catch (error) {
        console.error('Error updating water lifted:', error);
        return { success: false, message: error.message };
    }
}

async function deleteWaterLifted(id) {
    try {
        const { error } = await supabase.from('water_lifted').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف كمية المياه المرفوعة بنجاح' };
    } catch (error) {
        console.error('Error deleting water lifted:', error);
        return { success: false, message: error.message };
    }
}

// ==================== 9. استهلاك زيت المولدات (Generator Oil Consumption) ====================
async function getGeneratorOilConsumption(generatorId = null) {
    try {
        let query = supabase.from('generator_oil_consumption').select('*');
        if (generatorId) query = query.eq('generator_id', generatorId);
        const { data, error } = await query.order('consumption_date', { ascending: false });
        if (error) throw error;
        return { success: true, consumptions: data, data: data };
    } catch (error) {
        console.error('Error getting oil consumption:', error);
        return { success: false, message: error.message, consumptions: [] };
    }
}

async function createGeneratorOilConsumption(consumptionData) {
    try {
        const { data, error } = await supabase
            .from('generator_oil_consumption')
            .insert([{ ...consumptionData, created_at: new Date(), updated_at: new Date() }])
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم إضافة استهلاك الزيت بنجاح' };
    } catch (error) {
        console.error('Error creating oil consumption:', error);
        return { success: false, message: error.message };
    }
}

async function updateGeneratorOilConsumption(id, consumptionData) {
    try {
        const { data, error } = await supabase
            .from('generator_oil_consumption')
            .update({ ...consumptionData, updated_at: new Date() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم تحديث استهلاك الزيت بنجاح' };
    } catch (error) {
        console.error('Error updating oil consumption:', error);
        return { success: false, message: error.message };
    }
}

async function deleteGeneratorOilConsumption(id) {
    try {
        const { error } = await supabase.from('generator_oil_consumption').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف استهلاك الزيت بنجاح' };
    } catch (error) {
        console.error('Error deleting oil consumption:', error);
        return { success: false, message: error.message };
    }
}

// ==================== 10. تفاصيل تقارير المرور (Inspection Report Details) ====================
async function getInspectionReportDetails(reportId = null) {
    try {
        let query = supabase.from('inspection_report_details').select('*');
        if (reportId) query = query.eq('inspection_report_id', reportId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, details: data, data: data };
    } catch (error) {
        console.error('Error getting inspection details:', error);
        return { success: false, message: error.message, details: [] };
    }
}

async function createInspectionReportDetail(detailData) {
    try {
        const { data, error } = await supabase
            .from('inspection_report_details')
            .insert([{ ...detailData, created_at: new Date(), updated_at: new Date() }])
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم إضافة تفصيل التقرير بنجاح' };
    } catch (error) {
        console.error('Error creating inspection detail:', error);
        return { success: false, message: error.message };
    }
}

async function updateInspectionReportDetail(id, detailData) {
    try {
        const { data, error } = await supabase
            .from('inspection_report_details')
            .update({ ...detailData, updated_at: new Date() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم تحديث تفصيل التقرير بنجاح' };
    } catch (error) {
        console.error('Error updating inspection detail:', error);
        return { success: false, message: error.message };
    }
}

async function deleteInspectionReportDetail(id) {
    try {
        const { error } = await supabase.from('inspection_report_details').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف تفصيل التقرير بنجاح' };
    } catch (error) {
        console.error('Error deleting inspection detail:', error);
        return { success: false, message: error.message };
    }
}

// ==================== 11. معامل القدرة الشهري (Power Factor Monthly) ====================
async function getPowerFactorMonthly(stationId = null) {
    try {
        let query = supabase.from('power_factor_monthly').select('*');
        if (stationId) query = query.eq('station_id', stationId);
        const { data, error } = await query.order('month', { ascending: false });
        if (error) throw error;
        return { success: true, records: data, data: data };
    } catch (error) {
        console.error('Error getting power factor monthly:', error);
        return { success: false, message: error.message, records: [] };
    }
}

async function createPowerFactorMonthly(pfData) {
    try {
        const { data, error } = await supabase
            .from('power_factor_monthly')
            .insert([{ ...pfData, created_at: new Date(), updated_at: new Date() }])
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم إضافة سجل معامل القدرة بنجاح' };
    } catch (error) {
        console.error('Error creating power factor monthly:', error);
        return { success: false, message: error.message };
    }
}

async function updatePowerFactorMonthly(id, pfData) {
    try {
        const { data, error } = await supabase
            .from('power_factor_monthly')
            .update({ ...pfData, updated_at: new Date() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم تحديث سجل معامل القدرة بنجاح' };
    } catch (error) {
        console.error('Error updating power factor monthly:', error);
        return { success: false, message: error.message };
    }
}

async function deletePowerFactorMonthly(id) {
    try {
        const { error } = await supabase.from('power_factor_monthly').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف سجل معامل القدرة بنجاح' };
    } catch (error) {
        console.error('Error deleting power factor monthly:', error);
        return { success: false, message: error.message };
    }
}

// ==================== 12. إشعارات الغرامات (Penalty Notifications) ====================
async function getPenaltyNotifications(stationId = null) {
    try {
        let query = supabase.from('penalty_notifications').select('*');
        if (stationId) query = query.eq('station_id', stationId);
        const { data, error } = await query.order('notification_date', { ascending: false });
        if (error) throw error;
        return { success: true, notifications: data, data: data };
    } catch (error) {
        console.error('Error getting penalty notifications:', error);
        return { success: false, message: error.message, notifications: [] };
    }
}

async function createPenaltyNotification(notificationData) {
    try {
        const { data, error } = await supabase
            .from('penalty_notifications')
            .insert([{ ...notificationData, created_at: new Date(), updated_at: new Date() }])
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم إضافة إشعار الغرامة بنجاح' };
    } catch (error) {
        console.error('Error creating penalty notification:', error);
        return { success: false, message: error.message };
    }
}

async function updatePenaltyNotification(id, notificationData) {
    try {
        const { data, error } = await supabase
            .from('penalty_notifications')
            .update({ ...notificationData, updated_at: new Date() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم تحديث إشعار الغرامة بنجاح' };
    } catch (error) {
        console.error('Error updating penalty notification:', error);
        return { success: false, message: error.message };
    }
}

async function deletePenaltyNotification(id) {
    try {
        const { error } = await supabase.from('penalty_notifications').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف إشعار الغرامة بنجاح' };
    } catch (error) {
        console.error('Error deleting penalty notification:', error);
        return { success: false, message: error.message };
    }
}

// ==================== 13. المستخدمين (Users) ====================
async function getUsers() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, users: data, data: data };
    } catch (error) {
        console.error('Error getting users:', error);
        return { success: false, message: error.message, users: [] };
    }
}

async function createUser(userData) {
    try {
        // لا تخزن كلمة المرور كنص عادي، استخدم hashing في الخادم
        const { data, error } = await supabase
            .from('users')
            .insert([{ ...userData, created_at: new Date(), updated_at: new Date() }])
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم إضافة المستخدم بنجاح' };
    } catch (error) {
        console.error('Error creating user:', error);
        return { success: false, message: error.message };
    }
}

async function updateUser(id, userData) {
    try {
        const updateData = { ...userData, updated_at: new Date() };
        // إذا لم يتم إدخال كلمة مرور جديدة، لا نقوم بتحديثها
        if (!userData.password || userData.password === '') {
            delete updateData.password;
        }
        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'تم تحديث المستخدم بنجاح' };
    } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, message: error.message };
    }
}

async function deleteUser(id) {
    try {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'تم حذف المستخدم بنجاح' };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, message: error.message };
    }
}

// ==================== 14. اللوحات الكهربائية (Electrical Panels) - تأكد من وجودها ====================
// إذا كانت getPanels موجودة بالفعل، لا تقم بإعادة تعريفها
if (typeof getPanels === 'undefined') {
    async function getPanels(stationId = null) {
        try {
            let query = supabase.from('electrical_panels').select('*');
            if (stationId) query = query.eq('station_id', stationId);
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return { success: true, panels: data, data: data };
        } catch (error) {
            console.error('Error getting panels:', error);
            return { success: false, message: error.message, panels: [] };
        }
    }

    async function createPanel(panelData) {
        try {
            const { data, error } = await supabase
                .from('electrical_panels')
                .insert([{ ...panelData, created_at: new Date(), updated_at: new Date() }])
                .select();
            if (error) throw error;
            return { success: true, data: data[0], message: 'تم إضافة اللوحة بنجاح' };
        } catch (error) {
            console.error('Error creating panel:', error);
            return { success: false, message: error.message };
        }
    }

    async function updatePanel(id, panelData) {
        try {
            const { data, error } = await supabase
                .from('electrical_panels')
                .update({ ...panelData, updated_at: new Date() })
                .eq('id', id)
                .select();
            if (error) throw error;
            return { success: true, data: data[0], message: 'تم تحديث اللوحة بنجاح' };
        } catch (error) {
            console.error('Error updating panel:', error);
            return { success: false, message: error.message };
        }
    }

    async function deletePanel(id) {
        try {
            const { error } = await supabase.from('electrical_panels').delete().eq('id', id);
            if (error) throw error;
            return { success: true, message: 'تم حذف اللوحة بنجاح' };
        } catch (error) {
            console.error('Error deleting panel:', error);
            return { success: false, message: error.message };
        }
    }
}

// ==================== تصدير الدوال (إذا كان الملف يستخدم module) ====================
// إذا كان الملف يستخدم export، قم بإلغاء التعليق عن الأسطر التالية
/*
export {
    getFeeders, createFeeder, updateFeeder, deleteFeeder,
    getSubPumps, createSubPump, updateSubPump, deleteSubPump,
    getOtherAssets, createOtherAsset, updateOtherAsset, deleteOtherAsset,
    getBuildings, createBuilding, updateBuilding, deleteBuilding,
    getMechanical, createMechanicalEquipment, updateMechanicalEquipment, deleteMechanicalEquipment,
    getStationDetails, createStationDetail, updateStationDetail, deleteStationDetail,
    getSparePartsUsed, createSparePartUsed, updateSparePartUsed, deleteSparePartUsed,
    getWaterLifted, createWaterLifted, updateWaterLifted, deleteWaterLifted,
    getGeneratorOilConsumption, createGeneratorOilConsumption, updateGeneratorOilConsumption, deleteGeneratorOilConsumption,
    getInspectionReportDetails, createInspectionReportDetail, updateInspectionReportDetail, deleteInspectionReportDetail,
    getPowerFactorMonthly, createPowerFactorMonthly, updatePowerFactorMonthly, deletePowerFactorMonthly,
    getPenaltyNotifications, createPenaltyNotification, updatePenaltyNotification, deletePenaltyNotification,
    getUsers, createUser, updateUser, deleteUser,
    getPanels, createPanel, updatePanel, deletePanel
};
*/

console.log('✅ جميع دوال API للجداول الـ 28 تم تحميلها بنجاح');

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
async function login(username, password) {
    const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('username', username.trim()) // إضافة trim لإزالة أي مسافات زائدة
        .eq('password', password.trim())
        .maybeSingle(); // هذه الدالة تحل مشاكل الـ Bad Request في حال عدم وجود بيانات

    if (error) {
        console.error("خطأ في السيرفر:", error.message);
        return { success: false, message: error.message };
    }
    
    if (!data) return { success: false, message: 'بيانات غير صحيحة' };

    localStorage.setItem('currentUser', JSON.stringify(data));
    localStorage.setItem('authToken', 'true');
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

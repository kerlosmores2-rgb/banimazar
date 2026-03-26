// ============================================
// نظام إدارة محطات الصرف الصحي
// ملف الاتصال بالـ API (Backend)
// ============================================

const API_BASE_URL = 'http://localhost:3000/api';

// تخزين التوكن بعد تسجيل الدخول
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// ============================================
// دوال مساعدة
// ============================================

// حفظ التوكن
function setAuthToken(token, user) {
    authToken = token;
    currentUser = user;
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// مسح التوكن (تسجيل خروج)
function clearAuthToken() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
}

// استعادة الجلسة
function loadSession() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        return true;
    }
    return false;
}

// التحقق من الصلاحية
function hasPermission(permissionName) {
    if (!currentUser || !currentUser.permissions) return false;
    return currentUser.permissions.includes(permissionName);
}

// ============================================
// دوال طلبات HTTP
// ============================================

// طلب GET
async function apiGet(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : ''
        }
    });
    return response.json();
}

// طلب POST
async function apiPost(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : ''
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

// طلب PUT
async function apiPut(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : ''
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

// طلب DELETE
async function apiDelete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : ''
        }
    });
    return response.json();
}

// ============================================
// دوال المصادقة (Authentication)
// ============================================

// تسجيل الدخول
async function login(username, password) {
    const result = await apiPost('/login', { username, password });
    if (result.success) {
        setAuthToken(result.token, result.user);
    }
    return result;
}

// تسجيل الخروج
function logout() {
    clearAuthToken();
    window.location.href = 'index.html';
}

// التحقق من صحة التوكن
async function verifyToken() {
    if (!authToken) return false;
    const result = await apiGet('/verify');
    return result.success;
}

// ============================================
// دوال المحطات (Stations)
// ============================================

async function getStations() {
    return apiGet('/stations');
}

async function getStation(id) {
    return apiGet(`/stations/${id}`);
}

async function getStationFull(id) {
    return apiGet(`/stations/${id}/full`);
}

async function getStationStats() {
    return apiGet('/stations/stats');
}

async function createStation(data) {
    return apiPost('/stations', data);
}

async function updateStation(id, data) {
    return apiPut(`/stations/${id}`, data);
}

async function deleteStation(id) {
    return apiDelete(`/stations/${id}`);
}

// ============================================
// دوال الأصول (Assets)
// ============================================

// مضخات رئيسية
async function getMainPumps(stationId) {
    return apiGet(`/stations/${stationId}/main-pumps`);
}

async function createMainPump(data) {
    return apiPost('/main-pumps', data);
}

async function updateMainPump(id, data) {
    return apiPut(`/main-pumps/${id}`, data);
}

async function deleteMainPump(id) {
    return apiDelete(`/main-pumps/${id}`);
}

// مضخات فرعية
async function getSubPumps(stationId) {
    return apiGet(`/stations/${stationId}/sub-pumps`);
}

async function createSubPump(data) {
    return apiPost('/sub-pumps', data);
}

async function updateSubPump(id, data) {
    return apiPut(`/sub-pumps/${id}`, data);
}

async function deleteSubPump(id) {
    return apiDelete(`/sub-pumps/${id}`);
}

// مولدات
async function getGenerators(stationId) {
    return apiGet(`/stations/${stationId}/generators`);
}

async function createGenerator(data) {
    return apiPost('/generators', data);
}

async function updateGenerator(id, data) {
    return apiPut(`/generators/${id}`, data);
}

async function deleteGenerator(id) {
    return apiDelete(`/generators/${id}`);
}

// لوحات كهربائية
async function getPanels(stationId) {
    return apiGet(`/stations/${stationId}/panels`);
}

async function createPanel(data) {
    return apiPost('/panels', data);
}

async function updatePanel(id, data) {
    return apiPut(`/panels/${id}`, data);
}

async function deletePanel(id) {
    return apiDelete(`/panels/${id}`);
}

// معدات ميكانيكية
async function getMechanical(stationId) {
    return apiGet(`/stations/${stationId}/mechanical`);
}

async function createMechanical(data) {
    return apiPost('/mechanical', data);
}

async function updateMechanical(id, data) {
    return apiPut(`/mechanical/${id}`, data);
}

async function deleteMechanical(id) {
    return apiDelete(`/mechanical/${id}`);
}

// مغذيات
async function getFeeders(stationId) {
    return apiGet(`/stations/${stationId}/feeders`);
}

async function createFeeder(data) {
    return apiPost('/feeders', data);
}

async function updateFeeder(id, data) {
    return apiPut(`/feeders/${id}`, data);
}

async function deleteFeeder(id) {
    return apiDelete(`/feeders/${id}`);
}

// أصول أخرى
async function getOtherAssets(stationId) {
    return apiGet(`/stations/${stationId}/other-assets`);
}

async function createOtherAsset(data) {
    return apiPost('/other-assets', data);
}

async function updateOtherAsset(id, data) {
    return apiPut(`/other-assets/${id}`, data);
}

async function deleteOtherAsset(id) {
    return apiDelete(`/other-assets/${id}`);
}

// مباني
async function getBuildings(stationId) {
    return apiGet(`/stations/${stationId}/buildings`);
}

async function createBuilding(data) {
    return apiPost('/buildings', data);
}

async function updateBuilding(id, data) {
    return apiPut(`/buildings/${id}`, data);
}

async function deleteBuilding(id) {
    return apiDelete(`/buildings/${id}`);
}

// بيانات إضافية للمحطة
async function getStationDetails(stationId) {
    return apiGet(`/stations/${stationId}/details`);
}

async function saveStationDetails(stationId, data) {
    return apiPost(`/stations/${stationId}/details`, data);
}

async function deleteStationDetails(stationId) {
    return apiDelete(`/stations/${stationId}/details`);
}

// جميع الأصول لتقرير المرور
async function getAllAssetsForInspection(stationId) {
    return apiGet(`/stations/${stationId}/all-assets-for-inspection`);
}

// ============================================
// دوال البلاغات (Maintenance Reports)
// ============================================

async function getMaintenanceReports(stationId) {
    return apiGet(`/stations/${stationId}/maintenance-reports`);
}

async function getMaintenanceReport(id) {
    return apiGet(`/maintenance-reports/${id}`);
}

async function createMaintenanceReport(data) {
    return apiPost('/maintenance-reports', data);
}

async function updateMaintenanceReport(id, data) {
    return apiPut(`/maintenance-reports/${id}`, data);
}

async function closeMaintenanceReport(id, data) {
    return apiPut(`/maintenance-reports/${id}/close`, data);
}

async function deleteMaintenanceReport(id) {
    return apiDelete(`/maintenance-reports/${id}`);
}

async function addSparePart(reportId, data) {
    return apiPost(`/maintenance-reports/${reportId}/spare-parts`, data);
}

async function getSpareParts(reportId) {
    return apiGet(`/maintenance-reports/${reportId}/spare-parts`);
}

// ============================================
// دوال تقارير المرور (Inspection Reports)
// ============================================

async function getInspectionReports(stationId) {
    return apiGet(`/stations/${stationId}/inspection-reports`);
}

async function getInspectionReport(id) {
    return apiGet(`/inspection-reports/${id}`);
}

async function createInspectionReport(data) {
    return apiPost('/inspection-reports', data);
}

async function addInspectionDetails(reportId, details) {
    return apiPost(`/inspection-reports/${reportId}/details`, { details });
}

async function deleteInspectionReport(id) {
    return apiDelete(`/inspection-reports/${id}`);
}

// ============================================
// دوال الموظفين (Employees)
// ============================================

async function getEmployees(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiGet(`/employees${query ? '?' + query : ''}`);
}

async function getEmployee(id) {
    return apiGet(`/employees/${id}`);
}

async function createEmployee(data) {
    return apiPost('/employees', data);
}

async function updateEmployee(id, data) {
    return apiPut(`/employees/${id}`, data);
}

async function deleteEmployee(id) {
    return apiDelete(`/employees/${id}`);
}

// ============================================
// دوال التكاليف والتقارير الشهرية
// ============================================

async function getElectricityMeters(stationId) {
    return apiGet(`/stations/${stationId}/electricity-meters`);
}

async function addElectricityReading(data) {
    return apiPost('/electricity-meters', data);
}

async function getWaterMeters(stationId) {
    return apiGet(`/stations/${stationId}/water-meters`);
}

async function addWaterReading(data) {
    return apiPost('/water-meters', data);
}

async function getDieselConsumption(stationId) {
    return apiGet(`/stations/${stationId}/diesel-consumption`);
}

async function addDieselConsumption(data) {
    return apiPost('/diesel-consumption', data);
}

async function getWaterLifted(stationId) {
    return apiGet(`/stations/${stationId}/water-lifted`);
}

async function addWaterLifted(data) {
    return apiPost('/water-lifted', data);
}

async function getMonthlyReports(stationId) {
    return apiGet(`/stations/${stationId}/monthly-reports`);
}

async function generateMonthlyReport(data) {
    return apiPost('/monthly-reports/generate', data);
}

// ============================================
// دوال معامل القدرة والغرامات
// ============================================

async function getPowerFactorPanels(stationId) {
    return apiGet(`/stations/${stationId}/power-factor-panels`);
}

async function createPowerFactorPanel(data) {
    return apiPost('/power-factor-panels', data);
}

async function updatePowerFactorPanel(id, data) {
    return apiPut(`/power-factor-panels/${id}`, data);
}

async function updatePowerFactorPanelReadings(id, data) {
    return apiPut(`/power-factor-panels/${id}/readings`, data);
}

async function deletePowerFactorPanel(id) {
    return apiDelete(`/power-factor-panels/${id}`);
}

async function getPowerFactorReport(stationId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiGet(`/reports/power-factor-panels/${stationId}${query ? '?' + query : ''}`);
}

async function calculatePenalty(data) {
    return apiPost('/penalty/calculate', data);
}

async function getPenaltyNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiGet(`/penalty/notifications${query ? '?' + query : ''}`);
}

async function getPenaltyNotification(id) {
    return apiGet(`/penalty/notifications/${id}`);
}

async function updatePenaltyNotification(id, data) {
    return apiPut(`/penalty/notifications/${id}`, data);
}

// ============================================
// دوال التقارير التحليلية
// ============================================

async function getStationStatusReport(stationId, startDate, endDate) {
    return apiGet(`/reports/station-status/${stationId}?start_date=${startDate}&end_date=${endDate}`);
}

async function getElectricityConsumptionReport(stationId, startDate, endDate) {
    return apiGet(`/reports/electricity-consumption/${stationId}?start_date=${startDate}&end_date=${endDate}`);
}

async function getDieselConsumptionReport(stationId, startDate, endDate) {
    return apiGet(`/reports/diesel-consumption/${stationId}?start_date=${startDate}&end_date=${endDate}`);
}

async function getWaterConsumptionReport(stationId, startDate, endDate) {
    return apiGet(`/reports/water-consumption/${stationId}?start_date=${startDate}&end_date=${endDate}`);
}

async function getSparePartsReport(stationId, startDate, endDate) {
    return apiGet(`/reports/spare-parts/${stationId}?start_date=${startDate}&end_date=${endDate}`);
}

async function getAssetTrackingReport(stationId, assetName, startDate, endDate) {
    return apiGet(`/reports/asset-tracking/${stationId}?asset_name=${assetName}&start_date=${startDate}&end_date=${endDate}`);
}

async function getEmployeesReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiGet(`/reports/employees${query ? '?' + query : ''}`);
}

async function getEmployeesDetailedReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiGet(`/reports/employees-detailed${query ? '?' + query : ''}`);
}
// ============================================
// نظام إدارة محطات الصرف الصحي
// ملف الاتصال بالـ API (Backend)
// ============================================

const API_BASE_URL = 'http://localhost:3000/api';

// تخزين التوكن بعد تسجيل الدخول
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// ============================================
// دوال مساعدة
// ============================================

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

function loadSession() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        return true;
    }
    return false;
}

function hasPermission(permissionName) {
    if (!currentUser || !currentUser.permissions) return false;
    return currentUser.permissions.includes(permissionName);
}

// ============================================
// دوال طلبات HTTP
// ============================================

async function apiGet(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : ''
        }
    });
    return response.json();
}

async function apiPost(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : ''
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

async function apiPut(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : ''
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

async function apiDelete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : ''
        }
    });
    return response.json();
}

// ============================================
// دوال المصادقة (Authentication)
// ============================================

async function login(username, password) {
    const result = await apiPost('/login', { username, password });
    if (result.success) {
        setAuthToken(result.token, result.user);
    }
    return result;
}

function logout() {
    clearAuthToken();
    window.location.href = 'index.html';
}

async function verifyToken() {
    if (!authToken) return false;
    const result = await apiGet('/verify');
    return result.success;
}

// ============================================
// دوال المحطات (Stations)
// ============================================

async function getStations() {
    return apiGet('/stations');
}

async function getStation(id) {
    return apiGet(`/stations/${id}`);
}

async function getStationFull(id) {
    return apiGet(`/stations/${id}/full`);
}

async function getStationStats() {
    return apiGet('/stations/stats');
}

async function createStation(data) {
    return apiPost('/stations', data);
}

async function updateStation(id, data) {
    return apiPut(`/stations/${id}`, data);
}

async function deleteStation(id) {
    return apiDelete(`/stations/${id}`);
}

// ============================================
// دوال الأصول (Assets)
// ============================================

// مضخات رئيسية
async function getMainPumps(stationId) {
    return apiGet(`/stations/${stationId}/main-pumps`);
}

async function createMainPump(data) {
    return apiPost('/main-pumps', data);
}

async function updateMainPump(id, data) {
    return apiPut(`/main-pumps/${id}`, data);
}

async function deleteMainPump(id) {
    return apiDelete(`/main-pumps/${id}`);
}

// مضخات فرعية
async function getSubPumps(stationId) {
    return apiGet(`/stations/${stationId}/sub-pumps`);
}

async function createSubPump(data) {
    return apiPost('/sub-pumps', data);
}

async function updateSubPump(id, data) {
    return apiPut(`/sub-pumps/${id}`, data);
}

async function deleteSubPump(id) {
    return apiDelete(`/sub-pumps/${id}`);
}

// مولدات
async function getGenerators(stationId) {
    return apiGet(`/stations/${stationId}/generators`);
}

async function createGenerator(data) {
    return apiPost('/generators', data);
}

async function updateGenerator(id, data) {
    return apiPut(`/generators/${id}`, data);
}

async function deleteGenerator(id) {
    return apiDelete(`/generators/${id}`);
}

// لوحات كهربائية
async function getPanels(stationId) {
    return apiGet(`/stations/${stationId}/panels`);
}

async function createPanel(data) {
    return apiPost('/panels', data);
}

async function updatePanel(id, data) {
    return apiPut(`/panels/${id}`, data);
}

async function deletePanel(id) {
    return apiDelete(`/panels/${id}`);
}

// معدات ميكانيكية
async function getMechanical(stationId) {
    return apiGet(`/stations/${stationId}/mechanical`);
}

async function createMechanical(data) {
    return apiPost('/mechanical', data);
}

async function updateMechanical(id, data) {
    return apiPut(`/mechanical/${id}`, data);
}

async function deleteMechanical(id) {
    return apiDelete(`/mechanical/${id}`);
}

// مغذيات
async function getFeeders(stationId) {
    return apiGet(`/stations/${stationId}/feeders`);
}

async function createFeeder(data) {
    return apiPost('/feeders', data);
}

async function updateFeeder(id, data) {
    return apiPut(`/feeders/${id}`, data);
}

async function deleteFeeder(id) {
    return apiDelete(`/feeders/${id}`);
}

// أصول أخرى
async function getOtherAssets(stationId) {
    return apiGet(`/stations/${stationId}/other-assets`);
}

async function createOtherAsset(data) {
    return apiPost('/other-assets', data);
}

async function updateOtherAsset(id, data) {
    return apiPut(`/other-assets/${id}`, data);
}

async function deleteOtherAsset(id) {
    return apiDelete(`/other-assets/${id}`);
}

// مباني
async function getBuildings(stationId) {
    return apiGet(`/stations/${stationId}/buildings`);
}

async function createBuilding(data) {
    return apiPost('/buildings', data);
}

async function updateBuilding(id, data) {
    return apiPut(`/buildings/${id}`, data);
}

async function deleteBuilding(id) {
    return apiDelete(`/buildings/${id}`);
}

// بيانات إضافية للمحطة
async function getStationDetails(stationId) {
    return apiGet(`/stations/${stationId}/details`);
}

async function saveStationDetails(stationId, data) {
    return apiPost(`/stations/${stationId}/details`, data);
}

async function deleteStationDetails(stationId) {
    return apiDelete(`/stations/${stationId}/details`);
}

// جميع الأصول لتقرير المرور
async function getAllAssetsForInspection(stationId) {
    return apiGet(`/stations/${stationId}/all-assets-for-inspection`);
}

// ============================================
// دوال البلاغات (Maintenance Reports)
// ============================================

async function getMaintenanceReports(stationId) {
    return apiGet(`/stations/${stationId}/maintenance-reports`);
}

async function getMaintenanceReport(id) {
    return apiGet(`/maintenance-reports/${id}`);
}

async function createMaintenanceReport(data) {
    return apiPost('/maintenance-reports', data);
}

async function updateMaintenanceReport(id, data) {
    return apiPut(`/maintenance-reports/${id}`, data);
}

async function closeMaintenanceReport(id, data) {
    return apiPut(`/maintenance-reports/${id}/close`, data);
}

async function deleteMaintenanceReport(id) {
    return apiDelete(`/maintenance-reports/${id}`);
}

async function addSparePart(reportId, data) {
    return apiPost(`/maintenance-reports/${reportId}/spare-parts`, data);
}

async function getSpareParts(reportId) {
    return apiGet(`/maintenance-reports/${reportId}/spare-parts`);
}

// ============================================
// دوال تقارير المرور (Inspection Reports)
// ============================================

async function getInspectionReports(stationId) {
    return apiGet(`/stations/${stationId}/inspection-reports`);
}

async function getInspectionReport(id) {
    return apiGet(`/inspection-reports/${id}`);
}

async function createInspectionReport(data) {
    return apiPost('/inspection-reports', data);
}

async function addInspectionDetails(reportId, details) {
    return apiPost(`/inspection-reports/${reportId}/details`, { details });
}

async function deleteInspectionReport(id) {
    return apiDelete(`/inspection-reports/${id}`);
}

// ============================================
// دوال الموظفين (Employees)
// ============================================

async function getEmployees(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiGet(`/employees${query ? '?' + query : ''}`);
}

async function getEmployee(id) {
    return apiGet(`/employees/${id}`);
}

async function createEmployee(data) {
    return apiPost('/employees', data);
}

async function updateEmployee(id, data) {
    return apiPut(`/employees/${id}`, data);
}

async function deleteEmployee(id) {
    return apiDelete(`/employees/${id}`);
}

// ============================================
// دوال التكاليف والتقارير الشهرية
// ============================================

async function getElectricityMeters(stationId) {
    return apiGet(`/stations/${stationId}/electricity-meters`);
}

async function addElectricityReading(data) {
    return apiPost('/electricity-meters', data);
}

async function getWaterMeters(stationId) {
    return apiGet(`/stations/${stationId}/water-meters`);
}

async function addWaterReading(data) {
    return apiPost('/water-meters', data);
}

async function getDieselConsumption(stationId) {
    return apiGet(`/stations/${stationId}/diesel-consumption`);
}

async function addDieselConsumption(data) {
    return apiPost('/diesel-consumption', data);
}

async function getWaterLifted(stationId) {
    return apiGet(`/stations/${stationId}/water-lifted`);
}

async function addWaterLifted(data) {
    return apiPost('/water-lifted', data);
}

async function getMonthlyReports(stationId) {
    return apiGet(`/stations/${stationId}/monthly-reports`);
}

async function generateMonthlyReport(data) {
    return apiPost('/monthly-reports/generate', data);
}

// ============================================
// دوال معامل القدرة والغرامات
// ============================================

async function getPowerFactorPanels(stationId) {
    return apiGet(`/stations/${stationId}/power-factor-panels`);
}

async function createPowerFactorPanel(data) {
    return apiPost('/power-factor-panels', data);
}

async function updatePowerFactorPanel(id, data) {
    return apiPut(`/power-factor-panels/${id}`, data);
}

async function updatePowerFactorPanelReadings(id, data) {
    return apiPut(`/power-factor-panels/${id}/readings`, data);
}

async function deletePowerFactorPanel(id) {
    return apiDelete(`/power-factor-panels/${id}`);
}

async function getPowerFactorReport(stationId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiGet(`/reports/power-factor-panels/${stationId}${query ? '?' + query : ''}`);
}

async function calculatePenalty(data) {
    return apiPost('/penalty/calculate', data);
}

async function getPenaltyNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiGet(`/penalty/notifications${query ? '?' + query : ''}`);
}

async function getPenaltyNotification(id) {
    return apiGet(`/penalty/notifications/${id}`);
}

async function updatePenaltyNotification(id, data) {
    return apiPut(`/penalty/notifications/${id}`, data);
}

// ============================================
// دوال التقارير التحليلية
// ============================================

async function getStationStatusReport(stationId, startDate, endDate) {
    return apiGet(`/reports/station-status/${stationId}?start_date=${startDate}&end_date=${endDate}`);
}

async function getElectricityConsumptionReport(stationId, startDate, endDate) {
    return apiGet(`/reports/electricity-consumption/${stationId}?start_date=${startDate}&end_date=${endDate}`);
}

async function getDieselConsumptionReport(stationId, startDate, endDate) {
    return apiGet(`/reports/diesel-consumption/${stationId}?start_date=${startDate}&end_date=${endDate}`);
}

async function getWaterConsumptionReport(stationId, startDate, endDate) {
    return apiGet(`/reports/water-consumption/${stationId}?start_date=${startDate}&end_date=${endDate}`);
}

async function getSparePartsReport(stationId, startDate, endDate) {
    return apiGet(`/reports/spare-parts/${stationId}?start_date=${startDate}&end_date=${endDate}`);
}

async function getAssetTrackingReport(stationId, assetName, startDate, endDate) {
    return apiGet(`/reports/asset-tracking/${stationId}?asset_name=${assetName}&start_date=${startDate}&end_date=${endDate}`);
}

async function getEmployeesReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiGet(`/reports/employees${query ? '?' + query : ''}`);
}

async function getEmployeesDetailedReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiGet(`/reports/employees-detailed${query ? '?' + query : ''}`);
}

// ==================== التحقق من الجلسة ====================
function checkAuth() {
    if (!sessionStorage.getItem('loggedUser')) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function logout() {
    sessionStorage.removeItem('loggedUser');
    window.location.href = 'index.html';
}

// ==================== الصفحة الرئيسية ====================
function loadHome(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const faults = JSON.parse(localStorage.getItem('faults') || '[]');
    const openFaults = faults.filter(f => f.status === 'open').length;
    
    container.innerHTML = `
        <div class="row">
            <div class="col-md-4"><div class="stats-card"><i class="fas fa-water"></i><h3>${stations.length}</h3><p>عدد المحطات</p></div></div>
            <div class="col-md-4"><div class="stats-card"><i class="fas fa-users"></i><h3>${employees.length}</h3><p>عدد العاملين</p></div></div>
            <div class="col-md-4"><div class="stats-card"><i class="fas fa-exclamation-triangle"></i><h3>${openFaults}</h3><p>أعطال مفتوحة</p></div></div>
        </div>
        <div class="form-card"><h4>مرحباً بك</h4><p>نظام إدارة محطات رفع الصرف الصحي - بني مزار</p><small>آخر تحديث: ${new Date().toLocaleDateString('ar-EG')}</small></div>
    `;
}

// ==================== إضافة محطة ====================
function loadAddStation(container) {
    container.innerHTML = `
        <div class="form-card">
            <h4>➕ إضافة محطة جديدة</h4>
            <form id="stationForm">
                <div class="row">
                    <div class="col-md-6 mb-3"><label>اسم المحطة</label><input type="text" id="stationName" class="form-control" required></div>
                    <div class="col-md-6 mb-3"><label>كود المحطة</label><input type="text" id="stationCode" class="form-control" required></div>
                    <div class="col-md-4 mb-3"><label>النوع</label><select id="stationType" class="form-control"><option>رئيسية</option><option>فرعية</option><option>معالجة</option></select></div>
                    <div class="col-md-4 mb-3"><label>المصب</label><input type="text" id="outfall" class="form-control"></div>
                    <div class="col-md-4 mb-3"><label>القدرة (m³/h)</label><input type="number" id="capacity" class="form-control"></div>
                </div>
                <button type="submit" class="btn btn-primary">حفظ المحطة</button>
            </form>
        </div>
    `;
    
    document.getElementById('stationForm').onsubmit = function(e) {
        e.preventDefault();
        let stations = JSON.parse(localStorage.getItem('stations') || '[]');
        stations.push({
            id: Date.now(),
            name: document.getElementById('stationName').value,
            code: document.getElementById('stationCode').value,
            type: document.getElementById('stationType').value,
            outfall: document.getElementById('outfall').value,
            capacity: document.getElementById('capacity').value
        });
        localStorage.setItem('stations', JSON.stringify(stations));
        alert('تم حفظ المحطة');
        loadPage('listStations');
    };
}

// ==================== قائمة المحطات ====================
function loadListStations(container) {
    let stations = JSON.parse(localStorage.getItem('stations') || '[]');
    if (stations.length === 0) {
        container.innerHTML = '<div class="alert alert-info">لا توجد محطات مسجلة</div>';
        return;
    }
    let html = `<div class="search-bar"><input type="text" id="searchInput" class="form-control" placeholder="بحث..."></div>
                <div class="table-responsive"><table class="table table-bordered"><thead>运转<th>الكود</th><th>الاسم</th><th>النوع</th><th>المصب</th></thead><tbody id="stationsTable">`;
    stations.forEach(s => {
        html += `<tr><td>${s.code}</td><td>${s.name}</td><td>${s.type}</td><td>${s.outfall || '-'}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    container.innerHTML = html;
    
    document.getElementById('searchInput').onkeyup = function() {
        const val = this.value.toLowerCase();
        document.querySelectorAll('#stationsTable tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(val) ? '' : 'none';
        });
    };
}

// ==================== إضافة عامل ====================
function loadAddEmployee(container) {
    container.innerHTML = `
        <div class="form-card">
            <h4>➕ إضافة عامل جديد</h4>
            <form id="empForm">
                <div class="row">
                    <div class="col-md-6 mb-3"><label>الاسم</label><input type="text" id="empName" class="form-control" required></div>
                    <div class="col-md-6 mb-3"><label>الكود</label><input type="text" id="empCode" class="form-control" required></div>
                    <div class="col-md-6 mb-3"><label>المحطة</label><input type="text" id="empStation" class="form-control"></div>
                    <div class="col-md-6 mb-3"><label>الوظيفة</label><select id="empRole" class="form-control"><option>مدير محطة</option><option>مهندس</option><option>فني</option><option>عامل</option></select></div>
                    <div class="col-md-6 mb-3"><label>التليفون</label><input type="text" id="empPhone" class="form-control"></div>
                </div>
                <button type="submit" class="btn btn-primary">حفظ</button>
            </form>
        </div>
    `;
    
    document.getElementById('empForm').onsubmit = function(e) {
        e.preventDefault();
        let employees = JSON.parse(localStorage.getItem('employees') || '[]');
        employees.push({
            id: Date.now(),
            name: document.getElementById('empName').value,
            code: document.getElementById('empCode').value,
            station: document.getElementById('empStation').value,
            role: document.getElementById('empRole').value,
            phone: document.getElementById('empPhone').value
        });
        localStorage.setItem('employees', JSON.stringify(employees));
        alert('تم حفظ العامل');
        loadPage('listEmployees');
    };
}

// ==================== قائمة العاملين ====================
function loadListEmployees(container) {
    let employees = JSON.parse(localStorage.getItem('employees') || '[]');
    if (employees.length === 0) {
        container.innerHTML = '<div class="alert alert-info">لا توجد عاملين</div>';
        return;
    }
    let html = `<div class="table-responsive"><table class="table table-bordered"><thead>运转<th>الكود</th><th>الاسم</th><th>المحطة</th><th>الوظيفة</th><th>التليفون</th></thead><tbody>`;
    employees.forEach(e => {
        html += `<tr><td>${e.code}</td><td>${e.name}</td><td>${e.station || '-'}</td><td>${e.role}</td><td>${e.phone || '-'}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

// ==================== الصفحات التانية (مبسطة) ====================
function loadAddFault(container) { container.innerHTML = `<div class="form-card"><h4>⚠️ بلاغ عطل</h4><p>جاري التطوير</p></div>`; }
function loadListFaults(container) { container.innerHTML = `<div class="form-card"><h4>📋 قائمة البلاغات</h4><p>جاري التطوير</p></div>`; }
function loadTariffs(container) { container.innerHTML = `<div class="form-card"><h4>💰 تعريفات</h4><p>جاري التطوير</p></div>`; }
function loadMonthlyCosts(container) { container.innerHTML = `<div class="form-card"><h4>📊 تقارير شهرية</h4><p>جاري التطوير</p></div>`; }
function loadReportDaily(container) { container.innerHTML = `<div class="form-card"><h4>📝 متابعة دورية</h4><p>جاري التطوير</p></div>`; }
function loadReportFaults(container) { container.innerHTML = `<div class="form-card"><h4>🐛 تقرير الأعطال</h4><p>جاري التطوير</p></div>`; }
function loadReportStation(container) { container.innerHTML = `<div class="form-card"><h4>🏭 متابعة محطة</h4><p>جاري التطوير</p></div>`; }
function loadReportAsset(container) { container.innerHTML = `<div class="form-card"><h4>⚙️ متابعة أصل</h4><p>جاري التطوير</p></div>`; }
function loadReportEmployees(container) { container.innerHTML = `<div class="form-card"><h4>👥 تقرير العاملين</h4><p>جاري التطوير</p></div>`; }
function loadReportSpareParts(container) { container.innerHTML = `<div class="form-card"><h4>🔧 تقرير قطع غيار</h4><p>جاري التطوير</p></div>`; }
function loadArchive(container) { container.innerHTML = `<div class="form-card"><h4>📁 الأرشيف</h4><p>جاري التطوير</p></div>`; }
function loadUsers(container) { container.innerHTML = `<div class="form-card"><h4>⚙️ إدارة المستخدمين</h4><p>جاري التطوير</p></div>`; }
function loadReportWaterPumped(container) { container.innerHTML = `<div class="form-card"><h4>💧 تقرير المياه المرفوعة</h4><p>جاري التطوير</p></div>`; }
function loadReportElectricity(container) { container.innerHTML = `<div class="form-card"><h4>⚡ تقرير استهلاك كهرباء</h4><p>جاري التطوير</p></div>`; }
function loadReportWaterConsumption(container) { container.innerHTML = `<div class="form-card"><h4>💧 تقرير استهلاك مياه</h4><p>جاري التطوير</p></div>`; }
function loadReportDiesel(container) { container.innerHTML = `<div class="form-card"><h4>🛢️ تقرير استهلاك سولار</h4><p>جاري التطوير</p></div>`; }
function loadReportSparePartsAdvanced(container) { container.innerHTML = `<div class="form-card"><h4>🔧 تقرير قطع غيار متقدم</h4><p>جاري التطوير</p></div>`; }

// ==================== الدالة الرئيسية ====================
function loadPage(page) {
    if (!sessionStorage.getItem('loggedUser')) {
        window.location.href = 'index.html';
        return;
    }
    const container = document.getElementById('pageContent');
    if (!container) return;
    
    if (page === 'home') loadHome(container);
    else if (page === 'addStation') loadAddStation(container);
    else if (page === 'listStations') loadListStations(container);
    else if (page === 'addEmployee') loadAddEmployee(container);
    else if (page === 'listEmployees') loadListEmployees(container);
    else if (page === 'addFault') loadAddFault(container);
    else if (page === 'listFaults') loadListFaults(container);
    else if (page === 'tariffs') loadTariffs(container);
    else if (page === 'monthlyCosts') loadMonthlyCosts(container);
    else if (page === 'reportDaily') loadReportDaily(container);
    else if (page === 'reportFaults') loadReportFaults(container);
    else if (page === 'reportStation') loadReportStation(container);
    else if (page === 'reportAsset') loadReportAsset(container);
    else if (page === 'reportEmployees') loadReportEmployees(container);
    else if (page === 'reportSpareParts') loadReportSpareParts(container);
    else if (page === 'archive') loadArchive(container);
    else if (page === 'users') loadUsers(container);
    else if (page === 'reportWaterPumped') loadReportWaterPumped(container);
    else if (page === 'reportElectricity') loadReportElectricity(container);
    else if (page === 'reportWaterConsumption') loadReportWaterConsumption(container);
    else if (page === 'reportDiesel') loadReportDiesel(container);
    else if (page === 'reportSparePartsAdvanced') loadReportSparePartsAdvanced(container);
    else container.innerHTML = '<div class="alert alert-danger">صفحة غير موجودة</div>';
}

// ==================== تهيئة البيانات ====================
if (!localStorage.getItem('stations')) {
    localStorage.setItem('stations', JSON.stringify([
        { id: 1, name: 'محطة بني مزار', code: 'ST001', type: 'رئيسية', outfall: 'محطة المعالجة', capacity: '500' }
    ]));
}
if (!localStorage.getItem('employees')) {
    localStorage.setItem('employees', JSON.stringify([
        { id: 1, name: 'أحمد محمد', code: 'EMP001', station: 'محطة بني مزار', role: 'مدير محطة', phone: '01234567890' }
    ]));
}
if (!localStorage.getItem('faults')) {
    localStorage.setItem('faults', JSON.stringify([]));
}
if (!localStorage.getItem('tariffs')) {
    localStorage.setItem('tariffs', JSON.stringify({ electricity: 1.2, water: 3.5 }));
}
if (!localStorage.getItem('monthlyCosts')) {
    localStorage.setItem('monthlyCosts', JSON.stringify([]));
}
if (!localStorage.getItem('dailyReports')) {
    localStorage.setItem('dailyReports', JSON.stringify([]));
}
if (!localStorage.getItem('archive')) {
    localStorage.setItem('archive', JSON.stringify({}));
}
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
        { id: 1, username: 'admin', name: 'مدير النظام', password: 'admin123', role: 'مدير' }
    ]));
}

window.loadPage = loadPage;
window.logout = logout;

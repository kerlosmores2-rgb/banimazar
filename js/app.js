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
    sessionStorage.removeItem('loginTime');
    window.location.href = 'index.html';
}

function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('loggedUser') || '{}');
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

// ==================== دوال إضافة الأصول مع الأرقام التسلسلية ====================

function getPowerSourceHTML() {
    return `<div class="row">
        <div class="col-md-3"><input type="text" class="form-control" placeholder="رقم/اسم المصدر"></div>
        <div class="col-md-3"><select class="form-select source-type" onchange="toggleSourceFields(this)"><option>محول</option><option>مولد</option></select></div>
        <div class="col-md-6 transformer-fields"><input type="text" class="form-control" placeholder="جهد الدخول (V)"></div>
        <div class="col-md-6 transformer-fields"><input type="text" class="form-control" placeholder="جهد الخروج (V)"></div>
        <div class="col-md-6 transformer-fields"><input type="text" class="form-control" placeholder="القدرة (kVA)"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="نوع المحرك"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="قدرة المحرك (HP/kW)"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="معدل الاستهلاك على الحمل (لتر/س)"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="معدل الاستهلاك بدون حمل (لتر/س)"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="نوع المولد"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="قدرة المولد (kVA)"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="قدرة المولد (kW)"></div>
    </div>`;
}

function getMainPumpHTML() {
    return `<div class="row">
        <div class="col-md-3"><input type="text" class="form-control" placeholder="رقم/اسم الطلمبة"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="نوع الوحدة (غاطس/رأسية)"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="الماركة"></div>
        <div class="col-md-3"><input type="number" class="form-control" placeholder="التصرف m³/h"></div>
        <div class="col-md-3"><input type="number" class="form-control" placeholder="الرفع m"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="فتحة السحب/الطرد"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="محبس السحب/الطرد"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="محبس عدم رجوع"></div>
    </div>`;
}

function getDrainPumpHTML() {
    return `<div class="row">
        <div class="col-md-3"><input type="text" class="form-control" placeholder="رقم/اسم الطلمبة"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="النوع"></div>
        <div class="col-md-3"><input type="number" class="form-control" placeholder="التصرف m³/h"></div>
        <div class="col-md-3"><input type="number" class="form-control" placeholder="الرفع m"></div>
        <div class="col-md-3"><input type="number" class="form-control" placeholder="قدرة المحرك kW"></div>
    </div>`;
}

function getWinchHTML() {
    return `<div class="row">
        <div class="col-md-3"><input type="text" class="form-control" placeholder="رقم/اسم الونش"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="نوع الونش"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="القدرة (طن)"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="جهد التشغيل V"></div>
        <div class="col-md-3"><input type="number" class="form-control" placeholder="قدرة المحرك kW"></div>
    </div>`;
}

function getPanelHTML() {
    return `<div class="row">
        <div class="col-md-3"><input type="text" class="form-control" placeholder="رقم/اسم اللوحة"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="نوع اللوحة"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="اسم اللوحة"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="وظيفة اللوحة"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="مصدر التغذية"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="جهد التغذية V"></div>
        <div class="col-md-6"><input type="text" class="form-control" placeholder="وصف اللوحة"></div>
    </div>`;
}

function getBuildingHTML() {
    return `<div class="row">
        <div class="col-md-6"><input type="text" class="form-control" placeholder="رقم/اسم المبنى"></div>
        <div class="col-md-6"><input type="text" class="form-control" placeholder="اسم المبنى"></div>
    </div>`;
}

function getSealPumpHTML() {
    return `<div class="row">
        <div class="col-md-4"><input type="text" class="form-control" placeholder="رقم/اسم الطلمبة"></div>
        <div class="col-md-4"><input type="text" class="form-control" placeholder="نوع طلمبة حبس جلندات"></div>
        <div class="col-md-4"><input type="number" class="form-control" placeholder="قدرة الطلمبة"></div>
        <div class="col-md-4"><input type="number" class="form-control" placeholder="قدرة المحرك kW"></div>
    </div>`;
}

function getFanHTML() {
    return `<div class="row">
        <div class="col-md-4"><input type="text" class="form-control" placeholder="رقم/اسم المروحة"></div>
        <div class="col-md-4"><input type="text" class="form-control" placeholder="نوع المروحة"></div>
        <div class="col-md-4"><select class="form-select"><option>يعمل</option><option>لا يعمل</option></select></div>
    </div>`;
}

function addDynamicItem(containerId, htmlFunc) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'border p-2 mb-2 rounded';
    div.innerHTML = htmlFunc();
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-sm btn-danger mt-2';
    removeBtn.innerHTML = 'حذف';
    removeBtn.onclick = () => div.remove();
    div.appendChild(removeBtn);
    container.appendChild(div);
}

function collectItems(containerId) {
    const items = [];
    const container = document.getElementById(containerId);
    if (!container) return items;
    document.querySelectorAll(`#${containerId} .border`).forEach(div => {
        const data = {};
        div.querySelectorAll('input, select').forEach(input => {
            const placeholder = input.placeholder || '';
            if (placeholder) data[placeholder] = input.value;
            else if (input.className.includes('source-type')) data['النوع'] = input.value;
            else data[input.id || 'field'] = input.value;
        });
        items.push(data);
    });
    return items;
}

window.toggleSourceFields = function(select) {
    const div = select.closest('.border');
    if (!div) return;
    const isGenerator = select.value === 'مولد';
    div.querySelectorAll('.transformer-fields').forEach(el => el.style.display = isGenerator ? 'none' : '');
    div.querySelectorAll('.generator-fields').forEach(el => el.style.display = isGenerator ? '' : 'none');
};

// ==================== إضافة محطة ====================
function loadAddStation(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    let outfallOptions = '<option value="">بدون</option>';
    stations.forEach(s => { outfallOptions += `<option value="${s.name}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>➕ إضافة محطة جديدة</h4>
            <form id="stationForm">
                <div class="row">
                    <div class="col-md-6 mb-3"><label>اسم المحطة</label><input type="text" id="stationName" class="form-control" required></div>
                    <div class="col-md-6 mb-3"><label>كود المحطة</label><input type="text" id="stationCode" class="form-control" required></div>
                    <div class="col-md-4 mb-3"><label>النوع</label><select id="stationType" class="form-control"><option>رئيسية</option><option>فرعية</option><option>معالجة</option></select></div>
                    <div class="col-md-4 mb-3"><label>المصب</label><select id="outfall" class="form-control">${outfallOptions}</select></div>
                    <div class="col-md-4 mb-3"><label>القدرة (m³/h)</label><input type="number" id="capacity" class="form-control"></div>
                    <div class="col-md-12 mb-3"><label>الموقع الجغرافي</label><input type="text" id="location" class="form-control" placeholder="إحداثيات أو عنوان"></div>
                </div>
                
                <div class="mt-3"><h5>مصادر التغذية</h5><div id="powerSources"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addPowerSource()">+ إضافة مصدر</button></div>
                <div class="mt-3"><h5>الوحدات الرئيسية (طلمبات)</h5><div id="mainPumps"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addMainPump()">+ إضافة طلمبة</button></div>
                <div class="mt-3"><h5>طلمبات نزح</h5><div id="drainPumps"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addDrainPump()">+ إضافة طلمبة نزح</button></div>
                <div class="mt-3"><h5>أوناش</h5><div id="winches"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addWinch()">+ إضافة ونش</button></div>
                <div class="mt-3"><h5>لوحات كهربائية</h5><div id="panels"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addPanel()">+ إضافة لوحة</button></div>
                <div class="mt-3"><h5>مباني</h5><div id="buildings"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addBuilding()">+ إضافة مبنى</button></div>
                <div class="mt-3"><h5>طلمبات حبس جلندات</h5><div id="sealPumps"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addSealPump()">+ إضافة طلمبة حبس جلندات</button></div>
                <div class="mt-3"><h5>مراوح تهوية</h5><div id="fans"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addFan()">+ إضافة مروحة</button></div>
                
                <button type="submit" class="btn btn-primary mt-4">💾 حفظ المحطة</button>
            </form>
        </div>
    `;
    
    window.addPowerSource = () => addDynamicItem('powerSources', getPowerSourceHTML);
    window.addMainPump = () => addDynamicItem('mainPumps', getMainPumpHTML);
    window.addDrainPump = () => addDynamicItem('drainPumps', getDrainPumpHTML);
    window.addWinch = () => addDynamicItem('winches', getWinchHTML);
    window.addPanel = () => addDynamicItem('panels', getPanelHTML);
    window.addBuilding = () => addDynamicItem('buildings', getBuildingHTML);
    window.addSealPump = () => addDynamicItem('sealPumps', getSealPumpHTML);
    window.addFan = () => addDynamicItem('fans', getFanHTML);
    
    addPowerSource(); addMainPump(); addDrainPump(); addWinch(); addPanel(); addBuilding(); addSealPump(); addFan();
    
    document.getElementById('stationForm').onsubmit = function(e) {
        e.preventDefault();
        let stationsList = JSON.parse(localStorage.getItem('stations') || '[]');
        stationsList.push({
            id: Date.now(),
            name: document.getElementById('stationName').value,
            code: document.getElementById('stationCode').value,
            type: document.getElementById('stationType').value,
            outfall: document.getElementById('outfall').value,
            capacity: document.getElementById('capacity').value,
            location: document.getElementById('location').value,
            powerSources: collectItems('powerSources'),
            mainPumps: collectItems('mainPumps'),
            drainPumps: collectItems('drainPumps'),
            winches: collectItems('winches'),
            panels: collectItems('panels'),
            buildings: collectItems('buildings'),
            sealPumps: collectItems('sealPumps'),
            fans: collectItems('fans'),
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('stations', JSON.stringify(stationsList));
        alert('تم حفظ المحطة بنجاح');
        loadPage('listStations');
    };
}

// ==================== قائمة المحطات مع تعديل وحذف ====================
function loadListStations(container) {
    let stations = JSON.parse(localStorage.getItem('stations') || '[]');
    if (stations.length === 0) {
        container.innerHTML = '<div class="alert alert-info">لا توجد محطات مسجلة</div>';
        return;
    }
    let html = `<div class="search-bar"><input type="text" id="searchInput" class="form-control" placeholder="بحث..."></div>
                <div class="table-responsive"><table class="table table-bordered"><thead>运转<th>الكود</th><th>الاسم</th><th>النوع</th><th>المصب</th><th></th> </thead><tbody id="stationsTable">`;
    stations.forEach(s => {
        html += `运转
            <td>${s.code}</td>
            <td>${s.name}</td>
            <td>${s.type}</td>
            <td>${s.outfall || '-'}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editStation(${s.id})">✏️ تعديل</button>
                <button class="btn btn-sm btn-danger" onclick="deleteStationNow(${s.id})">🗑️ حذف</button>
                <button class="btn btn-sm btn-info" onclick="viewStation(${s.id})">عرض</button>
             </td>
         </tr>`;
    });
    html += `</tbody> </table></div>`;
    container.innerHTML = html;
    
    document.getElementById('searchInput').onkeyup = function() {
        const val = this.value.toLowerCase();
        document.querySelectorAll('#stationsTable tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(val) ? '' : 'none';
        });
    };
    
    window.editStation = (id) => loadEditStation(document.getElementById('pageContent'), id);
    window.deleteStationNow = (id) => {
        if (confirm('هل تريد حذف هذه المحطة وجميع بياناتها؟')) {
            let stationsList = JSON.parse(localStorage.getItem('stations'));
            stationsList = stationsList.filter(s => s.id != id);
            localStorage.setItem('stations', JSON.stringify(stationsList));
            alert('تم حذف المحطة');
            loadPage('listStations');
        }
    };
    window.viewStation = (id) => {
        const station = stations.find(s => s.id === id);
        container.innerHTML = `<div class="form-card"><h4>${station.name} (${station.code})</h4><pre>${JSON.stringify(station, null, 2)}</pre>
                               <button class="btn btn-secondary" onclick="loadPage('listStations')">رجوع</button></div>`;
    };
}

// ==================== تعديل المحطة ====================
function loadEditStation(container, stationId) {
    let stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const station = stations.find(s => s.id == stationId);
    if (!station) return;
    
    const allStations = JSON.parse(localStorage.getItem('stations') || '[]');
    let outfallOptions = '<option value="">بدون</option>';
    allStations.forEach(s => { outfallOptions += `<option value="${s.name}" ${station.outfall == s.name ? 'selected' : ''}>${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>✏️ تعديل المحطة: ${station.name}</h4>
            <form id="editStationForm">
                <div class="row">
                    <div class="col-md-6 mb-3"><label>اسم المحطة</label><input type="text" id="stationName" class="form-control" value="${station.name}" required></div>
                    <div class="col-md-6 mb-3"><label>كود المحطة</label><input type="text" id="stationCode" class="form-control" value="${station.code}" required></div>
                    <div class="col-md-4 mb-3"><label>النوع</label><select id="stationType" class="form-control"><option ${station.type == 'رئيسية' ? 'selected' : ''}>رئيسية</option><option ${station.type == 'فرعية' ? 'selected' : ''}>فرعية</option><option ${station.type == 'معالجة' ? 'selected' : ''}>معالجة</option></select></div>
                    <div class="col-md-4 mb-3"><label>المصب</label><select id="outfall" class="form-control">${outfallOptions}</select></div>
                    <div class="col-md-4 mb-3"><label>القدرة (m³/h)</label><input type="number" id="capacity" class="form-control" value="${station.capacity || ''}"></div>
                    <div class="col-md-12 mb-3"><label>الموقع الجغرافي</label><input type="text" id="location" class="form-control" value="${station.location || ''}"></div>
                </div>
                
                <div class="mt-3"><h5>مصادر التغذية</h5><div id="powerSourcesEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditPowerSource()">+ إضافة مصدر</button></div>
                <div class="mt-3"><h5>الوحدات الرئيسية (طلمبات)</h5><div id="mainPumpsEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditMainPump()">+ إضافة طلمبة</button></div>
                <div class="mt-3"><h5>طلمبات نزح</h5><div id="drainPumpsEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditDrainPump()">+ إضافة طلمبة نزح</button></div>
                <div class="mt-3"><h5>أوناش</h5><div id="winchesEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditWinch()">+ إضافة ونش</button></div>
                <div class="mt-3"><h5>لوحات كهربائية</h5><div id="panelsEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditPanel()">+ إضافة لوحة</button></div>
                <div class="mt-3"><h5>مباني</h5><div id="buildingsEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditBuilding()">+ إضافة مبنى</button></div>
                <div class="mt-3"><h5>طلمبات حبس جلندات</h5><div id="sealPumpsEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditSealPump()">+ إضافة طلمبة حبس جلندات</button></div>
                <div class="mt-3"><h5>مراوح تهوية</h5><div id="fansEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditFan()">+ إضافة مروحة</button></div>
                
                <div class="mt-4">
                    <button type="submit" class="btn btn-primary">💾 حفظ التعديلات</button>
                    <button type="button" class="btn btn-secondary" onclick="loadPage('listStations')">رجوع</button>
                </div>
            </form>
        </div>
    `;
    
    function addEditItem(containerId, htmlFunc, existingDataArray) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        if (existingDataArray && existingDataArray.length) {
            existingDataArray.forEach(data => {
                const div = document.createElement('div');
                div.className = 'border p-2 mb-2 rounded';
                div.innerHTML = htmlFunc();
                Object.keys(data).forEach(key => {
                    const input = div.querySelector(`[placeholder*="${key}"]`) || div.querySelector(`input`);
                    if (input) input.value = data[key];
                });
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'btn btn-sm btn-danger mt-2';
                removeBtn.innerHTML = 'حذف';
                removeBtn.onclick = () => div.remove();
                div.appendChild(removeBtn);
                container.appendChild(div);
            });
        }
    }
    
    addEditItem('powerSourcesEdit', getPowerSourceHTML, station.powerSources);
    addEditItem('mainPumpsEdit', getMainPumpHTML, station.mainPumps);
    addEditItem('drainPumpsEdit', getDrainPumpHTML, station.drainPumps);
    addEditItem('winchesEdit', getWinchHTML, station.winches);
    addEditItem('panelsEdit', getPanelHTML, station.panels);
    addEditItem('buildingsEdit', getBuildingHTML, station.buildings);
    addEditItem('sealPumpsEdit', getSealPumpHTML, station.sealPumps);
    addEditItem('fansEdit', getFanHTML, station.fans);
    
    window.addEditPowerSource = () => addDynamicItem('powerSourcesEdit', getPowerSourceHTML);
    window.addEditMainPump = () => addDynamicItem('mainPumpsEdit', getMainPumpHTML);
    window.addEditDrainPump = () => addDynamicItem('drainPumpsEdit', getDrainPumpHTML);
    window.addEditWinch = () => addDynamicItem('winchesEdit', getWinchHTML);
    window.addEditPanel = () => addDynamicItem('panelsEdit', getPanelHTML);
    window.addEditBuilding = () => addDynamicItem('buildingsEdit', getBuildingHTML);
    window.addEditSealPump = () => addDynamicItem('sealPumpsEdit', getSealPumpHTML);
    window.addEditFan = () => addDynamicItem('fansEdit', getFanHTML);
    
    document.getElementById('editStationForm').onsubmit = function(e) {
        e.preventDefault();
        let stationsList = JSON.parse(localStorage.getItem('stations'));
        const index = stationsList.findIndex(s => s.id == stationId);
        if (index !== -1) {
            stationsList[index] = {
                ...stationsList[index],
                name: document.getElementById('stationName').value,
                code: document.getElementById('stationCode').value,
                type: document.getElementById('stationType').value,
                outfall: document.getElementById('outfall').value,
                capacity: document.getElementById('capacity').value,
                location: document.getElementById('location').value,
                powerSources: collectItems('powerSourcesEdit'),
                mainPumps: collectItems('mainPumpsEdit'),
                drainPumps: collectItems('drainPumpsEdit'),
                winches: collectItems('winchesEdit'),
                panels: collectItems('panelsEdit'),
                buildings: collectItems('buildingsEdit'),
                sealPumps: collectItems('sealPumpsEdit'),
                fans: collectItems('fansEdit'),
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('stations', JSON.stringify(stationsList));
            alert('تم حفظ التعديلات');
            loadPage('listStations');
        }
    };
}

// ==================== الموارد البشرية ====================
function loadAddEmployee(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    let stationOptions = '<option value="">اختر محطة</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>➕ إضافة عامل جديد</h4>
            <form id="empForm">
                <div class="row">
                    <div class="col-md-3 mb-3"><label>الكود</label><input type="text" id="empCode" class="form-control" required></div>
                    <div class="col-md-3 mb-3"><label>الاسم</label><input type="text" id="empName" class="form-control" required></div>
                    <div class="col-md-3 mb-3"><label>المحطة</label><select id="empStation" class="form-control">${stationOptions}</select></div>
                    <div class="col-md-3 mb-3"><label>الوظيفة</label><select id="empRole" class="form-control"><option>مدير محطة</option><option>مهندس</option><option>فني</option><option>عامل</option></select></div>
                    <div class="col-md-3 mb-3"><label>الوردية</label><select id="empShift" class="form-control"><option>أولى</option><option>ثانية</option><option>ثالثة</option></select></div>
                    <div class="col-md-3 mb-3"><label>التليفون</label><input type="text" id="empPhone" class="form-control"></div>
                    <div class="col-md-3 mb-3"><label>الحالة</label><select id="empStatus" class="form-control"><option>يعمل</option><option>إجازة</option></select></div>
                </div>
                <button type="submit" class="btn btn-primary">حفظ</button>
                <button type="button" class="btn btn-info" onclick="loadPage('listEmployees')">عرض الكل</button>
            </form>
        </div>
    `;
    
    document.getElementById('empForm').onsubmit = function(e) {
        e.preventDefault();
        let employees = JSON.parse(localStorage.getItem('employees') || '[]');
        employees.push({
            id: Date.now(),
            code: document.getElementById('empCode').value,
            name: document.getElementById('empName').value,
            stationId: document.getElementById('empStation').value,
            role: document.getElementById('empRole').value,
            shift: document.getElementById('empShift').value,
            phone: document.getElementById('empPhone').value,
            status: document.getElementById('empStatus').value
        });
        localStorage.setItem('employees', JSON.stringify(employees));
        alert('تم حفظ العامل');
        loadPage('listEmployees');
    };
}

function loadListEmployees(container) {
    let employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const stationMap = {};
    stations.forEach(s => stationMap[s.id] = s.name);
    
    if (employees.length === 0) {
        container.innerHTML = '<div class="alert alert-info">لا توجد عاملين</div>';
        return;
    }
    let html = `<div class="search-bar"><input type="text" id="searchEmpInput" class="form-control" placeholder="بحث..."></div>
                <div class="table-responsive"><table class="table table-bordered"><thead>运转<th>الكود</th><th>الاسم</th><th>المحطة</th><th>الوظيفة</th><th>الوردية</th><th>التليفون</th><th>الحالة</th><th></th> </thead><tbody id="empTable">`;
    employees.forEach(e => {
        html += `运转
            <td>${e.code}</td>
            <td>${e.name}</td>
            <td>${stationMap[e.stationId] || '-'}</td>
            <td>${e.role}</td>
            <td>${e.shift || '-'}</td>
            <td>${e.phone || '-'}</td>
            <td>${e.status}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editEmployee(${e.id})">✏️ تعديل</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEmployeeNow(${e.id})">🗑️ حذف</button>
            </td>
         </tr>`;
    });
    html += `</tbody> </table></div>`;
    container.innerHTML = html;
    
    document.getElementById('searchEmpInput').onkeyup = function() {
        const val = this.value.toLowerCase();
        document.querySelectorAll('#empTable tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(val) ? '' : 'none';
        });
    };
    
    window.editEmployee = (id) => loadEditEmployee(document.getElementById('pageContent'), id);
    window.deleteEmployeeNow = (id) => {
        if (confirm('هل تريد حذف هذا العامل؟')) {
            let employeesList = JSON.parse(localStorage.getItem('employees'));
            employeesList = employeesList.filter(e => e.id != id);
            localStorage.setItem('employees', JSON.stringify(employeesList));
            loadPage('listEmployees');
        }
    };
}

function loadEditEmployee(container, employeeId) {
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const employee = employees.find(e => e.id == employeeId);
    if (!employee) return;
    
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    let stationOptions = '<option value="">اختر محطة</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}" ${employee.stationId == s.id ? 'selected' : ''}>${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>✏️ تعديل بيانات العامل</h4>
            <form id="editEmpForm">
                <div class="row">
                    <div class="col-md-3 mb-3"><label>الكود</label><input type="text" id="empCode" class="form-control" value="${employee.code}" required></div>
                    <div class="col-md-3 mb-3"><label>الاسم</label><input type="text" id="empName" class="form-control" value="${employee.name}" required></div>
                    <div class="col-md-3 mb-3"><label>المحطة</label><select id="empStation" class="form-control">${stationOptions}</select></div>
                    <div class="col-md-3 mb-3"><label>الوظيفة</label><select id="empRole" class="form-control"><option ${employee.role == 'مدير محطة' ? 'selected' : ''}>مدير محطة</option><option ${employee.role == 'مهندس' ? 'selected' : ''}>مهندس</option><option ${employee.role == 'فني' ? 'selected' : ''}>فني</option><option ${employee.role == 'عامل' ? 'selected' : ''}>عامل</option></select></div>
                    <div class="col-md-3 mb-3"><label>الوردية</label><select id="empShift" class="form-control"><option ${employee.shift == 'أولى' ? 'selected' : ''}>أولى</option><option ${employee.shift == 'ثانية' ? 'selected' : ''}>ثانية</option><option ${employee.shift == 'ثالثة' ? 'selected' : ''}>ثالثة</option></select></div>
                    <div class="col-md-3 mb-3"><label>التليفون</label><input type="text" id="empPhone" class="form-control" value="${employee.phone || ''}"></div>
                    <div class="col-md-3 mb-3"><label>الحالة</label><select id="empStatus" class="form-control"><option ${employee.status == 'يعمل' ? 'selected' : ''}>يعمل</option><option ${employee.status == 'إجازة' ? 'selected' : ''}>إجازة</option></select></div>
                </div>
                <button type="submit" class="btn btn-primary">💾 حفظ التعديل</button>
                <button type="button" class="btn btn-secondary" onclick="loadPage('listEmployees')">رجوع</button>
            </form>
        </div>
    `;
    
    document.getElementById('editEmpForm').onsubmit = function(e) {
        e.preventDefault();
        let employeesList = JSON.parse(localStorage.getItem('employees'));
        const index = employeesList.findIndex(e => e.id == employeeId);
        if (index !== -1) {
            employeesList[index] = {
                ...employeesList[index],
                code: document.getElementById('empCode').value,
                name: document.getElementById('empName').value,
                stationId: document.getElementById('empStation').value,
                role: document.getElementById('empRole').value,
                shift: document.getElementById('empShift').value,
                phone: document.getElementById('empPhone').value,
                status: document.getElementById('empStatus').value
            };
            localStorage.setItem('employees', JSON.stringify(employeesList));
            alert('تم حفظ التعديل');
            loadPage('listEmployees');
        }
    };
}

// ==================== الصيانة ====================
function loadAddFault(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    let stationOptions = '<option value="">اختر محطة</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    let empOptions = '<option value="">اختر مبلغ</option>';
    employees.forEach(e => { empOptions += `<option value="${e.id}">${e.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>⚠️ بلاغ عطل جديد</h4>
            <form id="faultForm">
                <div class="row">
                    <div class="col-md-6 mb-3"><label>المحطة</label><select id="faultStation" class="form-control" required>${stationOptions}</select></div>
                    <div class="col-md-6 mb-3"><label>كود المحطة</label><input type="text" id="stationCode" class="form-control" readonly></div>
                    <div class="col-md-6 mb-3"><label>الأصل المعطل</label><select id="faultAsset" class="form-control"><option value="">اختر الأصل</option></select></div>
                    <div class="col-md-6 mb-3"><label>نوع العطل</label><select id="faultType" class="form-control"><option>كهرباء</option><option>ميكانيكا</option></select></div>
                    <div class="col-md-6 mb-3"><label>التاريخ</label><input type="date" id="faultDate" class="form-control" required></div>
                    <div class="col-md-6 mb-3"><label>المبلغ</label><select id="faultReporter" class="form-control">${empOptions}</select></div>
                    <div class="col-12 mb-3"><label>وصف العطل</label><textarea id="faultDesc" class="form-control" rows="3" required></textarea></div>
                    <div class="col-12 mb-3"><label>إجراءات الإصلاح</label><textarea id="faultActions" class="form-control" rows="2"></textarea></div>
                    <div class="col-12 mb-3"><label>قطع الغيار</label><input type="text" id="faultParts" class="form-control"></div>
                </div>
                <button type="submit" class="btn btn-primary">حفظ البلاغ</button>
            </form>
        </div>
    `;
    
    document.getElementById('faultStation').addEventListener('change', function() {
        const stationId = this.value;
        const station = JSON.parse(localStorage.getItem('stations')).find(s => s.id == stationId);
        if (station) {
            document.getElementById('stationCode').value = station.code;
            const assets = [];
            if (station.mainPumps) station.mainPumps.forEach((p, i) => assets.push({ id: `pump_${i}`, name: p['رقم/اسم الطلمبة'] || `طلمبة رئيسية ${i+1}` }));
            if (station.drainPumps) station.drainPumps.forEach((p, i) => assets.push({ id: `drain_${i}`, name: p['رقم/اسم الطلمبة'] || `طلمبة نزح ${i+1}` }));
            if (station.winches) station.winches.forEach((w, i) => assets.push({ id: `winch_${i}`, name: w['رقم/اسم الونش'] || `ونش ${i+1}` }));
            if (station.panels) station.panels.forEach((p, i) => assets.push({ id: `panel_${i}`, name: p['رقم/اسم اللوحة'] || `لوحة ${i+1}` }));
            if (station.fans) station.fans.forEach((f, i) => assets.push({ id: `fan_${i}`, name: f['رقم/اسم المروحة'] || `مروحة ${i+1}` }));
            if (station.sealPumps) station.sealPumps.forEach((s, i) => assets.push({ id: `seal_${i}`, name: s['رقم/اسم الطلمبة'] || `طلمبة حبس جلندات ${i+1}` }));
            const assetSelect = document.getElementById('faultAsset');
            assetSelect.innerHTML = '<option value="">اختر الأصل</option>' + assets.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
        }
    });
    
    document.getElementById('faultForm').onsubmit = function(e) {
        e.preventDefault();
        let faults = JSON.parse(localStorage.getItem('faults') || '[]');
        faults.push({
            id: Date.now(),
            stationId: document.getElementById('faultStation').value,
            stationName: document.getElementById('faultStation').selectedOptions[0]?.text,
            assetId: document.getElementById('faultAsset').value,
            assetName: document.getElementById('faultAsset').selectedOptions[0]?.text,
            type: document.getElementById('faultType').value,
            date: document.getElementById('faultDate').value,
            reporterId: document.getElementById('faultReporter').value,
            description: document.getElementById('faultDesc').value,
            actions: document.getElementById('faultActions').value,
            parts: document.getElementById('faultParts').value,
            status: 'open'
        });
        localStorage.setItem('faults', JSON.stringify(faults));
        alert('تم حفظ البلاغ');
        loadPage('listFaults');
    };
}

function loadListFaults(container) {
    let faults = JSON.parse(localStorage.getItem('faults') || '[]');
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const stationMap = {};
    stations.forEach(s => stationMap[s.id] = s.name);
    
    let stationFilter = '<option value="">كل المحطات</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    const html = `
        <div class="search-bar">
            <div class="row">
                <div class="col-md-4"><label>المحطة</label><select id="filterStation" class="form-control">${stationFilter}</select></div>
                <div class="col-md-4"><label>من تاريخ</label><input type="date" id="filterDateFrom" class="form-control"></div>
                <div class="col-md-4"><label>إلى تاريخ</label><input type="date" id="filterDateTo" class="form-control"></div>
                <div class="col-md-12 mt-2"><button class="btn btn-primary" onclick="filterFaults()">تصفية</button></div>
            </div>
        </div>
        <div id="faultsListContainer"></div>
    `;
    container.innerHTML = html;
    
    window.filterFaults = () => {
        const stationId = document.getElementById('filterStation').value;
        const from = document.getElementById('filterDateFrom').value;
        const to = document.getElementById('filterDateTo').value;
        let filtered = faults;
        if (stationId) filtered = filtered.filter(f => f.stationId == stationId);
        if (from) filtered = filtered.filter(f => f.date >= from);
        if (to) filtered = filtered.filter(f => f.date <= to);
        displayFaultsList(filtered);
    };
    
    function displayFaultsList(list) {
        const containerDiv = document.getElementById('faultsListContainer');
        if (list.length === 0) {
            containerDiv.innerHTML = '<div class="alert alert-info">لا توجد بلاغات</div>';
            return;
        }
        let html = '<div class="table-responsive"><table class="table table-bordered"><thead>运转<th>المحطة</th><th>الأصل</th><th>النوع</th><th>التاريخ</th><th>الحالة</th><th></th> </thead><tbody>';
        list.forEach(f => {
            html += `运转
                <td>${f.stationName || stationMap[f.stationId]}</td>
                <td>${f.assetName || '-'}</td>
                <td>${f.type}</td>
                <td>${f.date}</td>
                <td>${f.status === 'open' ? 'مفتوح' : 'مغلق'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editFault(${f.id})">✏️ تعديل</button>
                    <button class="btn btn-sm btn-info" onclick="viewFaultDetail(${f.id})">عرض</button>
                </td>
             </tr>`;
        });
        html += '</tbody> </table></div>';
        containerDiv.innerHTML = html;
    }
    
    window.editFault = (id) => loadEditFault(document.getElementById('pageContent'), id);
    window.viewFaultDetail = (id) => {
        const fault = faults.find(f => f.id === id);
        const details = `
            <div class="form-card">
                <h4>تفاصيل البلاغ</h4>
                <p><strong>المحطة:</strong> ${fault.stationName || stationMap[fault.stationId]}</p>
                <p><strong>الأصل:</strong> ${fault.assetName || '-'}</p>
                <p><strong>النوع:</strong> ${fault.type}</p>
                <p><strong>التاريخ:</strong> ${fault.date}</p>
                <p><strong>الوصف:</strong> ${fault.description}</p>
                <p><strong>إجراءات الإصلاح:</strong> ${fault.actions || '-'}</p>
                <p><strong>قطع الغيار:</strong> ${fault.parts || '-'}</p>
                <p><strong>الحالة:</strong> ${fault.status === 'open' ? 'مفتوح' : 'مغلق'}</p>
                ${fault.status === 'open' ? '<button class="btn btn-success" onclick="closeFaultNow('+fault.id+')">إقفال البلاغ</button>' : ''}
                <button class="btn btn-secondary" onclick="loadPage(\'listFaults\')">رجوع</button>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = details;
    };
    
    window.closeFaultNow = (id) => {
        let faultsList = JSON.parse(localStorage.getItem('faults'));
        const idx = faultsList.findIndex(f => f.id === id);
        if (idx !== -1) {
            faultsList[idx].status = 'closed';
            localStorage.setItem('faults', JSON.stringify(faultsList));
            alert('تم إقفال البلاغ');
            loadPage('listFaults');
        }
    };
    
    filterFaults();
}

function loadEditFault(container, faultId) {
    let faults = JSON.parse(localStorage.getItem('faults') || '[]');
    const fault = faults.find(f => f.id == faultId);
    if (!fault) return;
    
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    let stationOptions = '<option value="">اختر محطة</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}" ${fault.stationId == s.id ? 'selected' : ''}>${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>✏️ تعديل البلاغ</h4>
            <form id="editFaultForm">
                <div class="row">
                    <div class="col-md-6 mb-3"><label>المحطة</label><select id="faultStation" class="form-control">${stationOptions}</select></div>
                    <div class="col-md-6 mb-3"><label>الأصل المعطل</label><input type="text" id="faultAsset" class="form-control" value="${fault.assetName || ''}"></div>
                    <div class="col-md-6 mb-3"><label>نوع العطل</label><select id="faultType" class="form-control"><option ${fault.type == 'كهرباء' ? 'selected' : ''}>كهرباء</option><option ${fault.type == 'ميكانيكا' ? 'selected' : ''}>ميكانيكا</option></select></div>
                    <div class="col-md-6 mb-3"><label>التاريخ</label><input type="date" id="faultDate" class="form-control" value="${fault.date}"></div>
                    <div class="col-12 mb-3"><label>وصف العطل</label><textarea id="faultDesc" class="form-control" rows="3">${fault.description || ''}</textarea></div>
                    <div class="col-12 mb-3"><label>إجراءات الإصلاح</label><textarea id="faultActions" class="form-control" rows="2">${fault.actions || ''}</textarea></div>
                    <div class="col-12 mb-3"><label>قطع الغيار</label><input type="text" id="faultParts" class="form-control" value="${fault.parts || ''}"></div>
                </div>
                <button type="submit" class="btn btn-primary">💾 حفظ التعديل</button>
                <button type="button" class="btn btn-danger" onclick="deleteFaultNow(${fault.id})">🗑️ حذف البلاغ</button>
                <button type="button" class="btn btn-secondary" onclick="loadPage('listFaults')">رجوع</button>
            </form>
        </div>
    `;
    
    document.getElementById('editFaultForm').onsubmit = function(e) {
        e.preventDefault();
        let faultsList = JSON.parse(localStorage.getItem('faults'));
        const index = faultsList.findIndex(f => f.id == faultId);
        if (index !== -1) {
            faultsList[index] = {
                ...faultsList[index],
                stationId: document.getElementById('faultStation').value,
                assetName: document.getElementById('faultAsset').value,
                type: document.getElementById('faultType').value,
                date: document.getElementById('faultDate').value,
                description: document.getElementById('faultDesc').value,
                actions: document.getElementById('faultActions').value,
                parts: document.getElementById('faultParts').value
            };
            localStorage.setItem('faults', JSON.stringify(faultsList));
            alert('تم حفظ التعديل');
            loadPage('listFaults');
        }
    };
    
    window.deleteFaultNow = (id) => {
        if (confirm('هل تريد حذف هذا البلاغ؟')) {
            let faultsList = JSON.parse(localStorage.getItem('faults'));
            faultsList = faultsList.filter(f => f.id != id);
            localStorage.setItem('faults', JSON.stringify(faultsList));
            alert('تم حذف البلاغ');
            loadPage('listFaults');
        }
    };
}

// ==================== التكاليف ====================
function loadTariffs(container) {
    const t = JSON.parse(localStorage.getItem('tariffs') || '{"electricity":1.2,"water":3.5}');
    container.innerHTML = `
        <div class="form-card">
            <h4>💰 تعريفات</h4>
            <form id="tariffsForm">
                <div class="mb-3"><label>تعريفة الكهرباء (جنيه/كيلو وات)</label><input type="number" step="0.01" id="elecTariff" class="form-control" value="${t.electricity}"></div>
                <div class="mb-3"><label>تعريفة المياه (جنيه/متر مكعب)</label><input type="number" step="0.01" id="waterTariff" class="form-control" value="${t.water}"></div>
                <button type="submit" class="btn btn-primary">حفظ</button>
            </form>
        </div>
    `;
    document.getElementById('tariffsForm').onsubmit = function(e) {
        e.preventDefault();
        localStorage.setItem('tariffs', JSON.stringify({
            electricity: parseFloat(document.getElementById('elecTariff').value),
            water: parseFloat(document.getElementById('waterTariff').value)
        }));
        alert('تم حفظ التعريفات');
    };
}

// ==================== التقرير الشهري ====================
function loadMonthlyCosts(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const tariffs = JSON.parse(localStorage.getItem('tariffs') || '{"electricity":1.2,"water":3.5}');
    const monthlyCosts = JSON.parse(localStorage.getItem('monthlyCosts') || '[]');
    
    let stationOptions = '<option value="">اختر محطة</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>📊 التقرير الشهري</h4>
            <form id="monthlyForm">
                <div class="row">
                    <div class="col-md-4 mb-3"><label>المحطة</label><select id="monthStation" class="form-control" required>${stationOptions}</select></div>
                    <div class="col-md-4 mb-3"><label>كود المحطة</label><input type="text" id="monthStationCode" class="form-control" readonly></div>
                    <div class="col-md-4 mb-3"><label>شهر المحاسبة</label><input type="month" id="monthPeriod" class="form-control" required></div>
                </div>
                
                <div class="mt-4 p-3 border rounded">
                    <h5>💧 كمية المياه المرفوعة</h5>
                    <div class="row">
                        <div class="col-md-4"><label>ساعات التشغيل</label><input type="number" id="operatingHours" class="form-control" step="0.5"></div>
                        <div class="col-md-4"><label>اختر وحدة رئيسية</label><select id="pumpForFlow" class="form-control"></select></div>
                        <div class="col-md-4"><label>المياه المرفوعة (m³)</label><input type="text" id="waterPumped" class="form-control" readonly style="background:#e9ecef"></div>
                    </div>
                </div>
                
                <div class="mt-4 p-3 border rounded" id="transformersSection">
                    <h5>⚡ المحولات</h5>
                    <div id="transformersInputs"></div>
                </div>
                
                <div class="mt-4 p-3 border rounded" id="generatorsSection">
                    <h5>🛢️ المولدات</h5>
                    <div id="generatorsInputs"></div>
                </div>
                
                <div class="mt-4 p-3 border rounded">
                    <h5>💧 عداد المياه</h5>
                    <div class="row">
                        <div class="col-md-4"><label>القراءة الحالية</label><input type="number" id="currentWater" class="form-control" step="0.1"></div>
                        <div class="col-md-4"><label>القراءة السابقة</label><input type="number" id="prevWater" class="form-control" step="0.1"></div>
                        <div class="col-md-4"><label>الاستهلاك</label><input type="text" id="waterConsumed" class="form-control" readonly style="background:#e9ecef"></div>
                        <div class="col-md-4"><label>التعريفة</label><input type="text" id="waterTariff" class="form-control" value="${tariffs.water}" readonly></div>
                        <div class="col-md-4"><label>قيمة الاستهلاك</label><input type="text" id="waterCost" class="form-control" readonly style="background:#e9ecef"></div>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary mt-3">💾 حفظ التقرير</button>
                <button type="button" class="btn btn-info mt-3" onclick="showPreviousReports()">📋 التقارير السابقة</button>
            </form>
        </div>
        <div id="previousReportsList" class="mt-4" style="display:none"></div>
    `;
    
    window.showPreviousReports = () => {
        const stationId = document.getElementById('monthStation').value;
        if (!stationId) { alert('اختر محطة أولاً'); return; }
        const reports = monthlyCosts.filter(r => r.stationId == stationId).sort((a,b) => b.month.localeCompare(a.month));
        const listDiv = document.getElementById('previousReportsList');
        if (reports.length === 0) {
            listDiv.innerHTML = '<div class="alert alert-info">لا توجد تقارير سابقة</div>';
        } else {
            let html = '<div class="form-card"><h5>التقارير السابقة</h5><table class="table"><thead><tr><th>الشهر</th><th>المياه المرفوعة</th><th>كهرباء</th><th>سولار</th><th></th></tr></thead><tbody>';
            reports.forEach(r => {
                html += `<tr><td>${r.month}</td><td>${r.waterPumped || 0} m³</td><td>${r.totalElecCost || 0} ج</td><td>${r.totalDieselBalance || 0} لتر</td>
                <td><button class="btn btn-sm btn-warning" onclick="editMonthlyReport(${r.id})">تعديل</button>
                <button class="btn btn-sm btn-danger" onclick="deleteMonthlyReport(${r.id})">حذف</button></td></tr>`;
            });
            html += '</tbody></table></div>';
            listDiv.innerHTML = html;
        }
        listDiv.style.display = 'block';
    };
    
    document.getElementById('monthStation').addEventListener('change', function() {
        const stationId = this.value;
        const station = stations.find(s => s.id == stationId);
        if (station) {
            document.getElementById('monthStationCode').value = station.code;
            const pumpsSelect = document.getElementById('pumpForFlow');
            pumpsSelect.innerHTML = '<option value="">اختر وحدة</option>';
            if (station.mainPumps) {
                station.mainPumps.forEach((p, idx) => {
                    const flow = p['التصرف m³/h'] || 0;
                    pumpsSelect.innerHTML += `<option value="${flow}">${p['رقم/اسم الطلمبة'] || 'طلمبة '+(idx+1)} (${flow} m³/h)</option>`;
                });
            }
            
            const transformersDiv = document.getElementById('transformersInputs');
            if (station.powerSources) {
                const transformers = station.powerSources.filter(ps => ps['النوع'] === 'محول');
                if (transformers.length) {
                    let html = '';
                    transformers.forEach((t, idx) => {
                        const name = t['رقم/اسم المصدر'] || `محول ${idx+1}`;
                        const lastReport = monthlyCosts.filter(r => r.stationId == stationId).sort((a,b)=>b.month.localeCompare(a.month))[0];
                        const prevReading = (lastReport && lastReport.transformers && lastReport.transformers[idx]) ? lastReport.transformers[idx].current : 0;
                        html += `<div class="border p-2 mb-2">
                            <strong>${name}</strong>
                            <div class="row mt-2">
                                <div class="col-md-4"><label>القراءة الحالية</label><input type="number" class="form-control transformer-current" data-idx="${idx}"></div>
                                <div class="col-md-4"><label>القراءة السابقة</label><input type="number" class="form-control transformer-prev" value="${prevReading}"></div>
                                <div class="col-md-2"><label>الفرق</label><input type="text" class="form-control transformer-diff" readonly></div>
                                <div class="col-md-2"><label>التكلفة</label><input type="text" class="form-control transformer-cost" readonly></div>
                            </div>
                        </div>`;
                    });
                    transformersDiv.innerHTML = html;
                    document.querySelectorAll('.transformer-current').forEach(inp => {
                        inp.addEventListener('input', function() {
                            const div = this.closest('.border');
                            const curr = parseFloat(this.value) || 0;
                            const prev = parseFloat(div.querySelector('.transformer-prev').value) || 0;
                            const diff = curr - prev;
                            const cost = diff * tariffs.electricity;
                            div.querySelector('.transformer-diff').value = diff.toFixed(2);
                            div.querySelector('.transformer-cost').value = cost.toFixed(2);
                        });
                    });
                } else transformersDiv.innerHTML = '<div class="alert alert-warning">لا توجد محولات</div>';
            }
            
            const generatorsDiv = document.getElementById('generatorsInputs');
            if (station.powerSources) {
                const generators = station.powerSources.filter(ps => ps['النوع'] === 'مولد');
                if (generators.length) {
                    let html = '';
                    generators.forEach((g, idx) => {
                        const name = g['رقم/اسم المصدر'] || `مولد ${idx+1}`;
                        const loadRate = g['معدل الاستهلاك على الحمل (لتر/س)'] || 10;
                        const idleRate = g['معدل الاستهلاك بدون حمل (لتر/س)'] || 5;
                        const lastReport = monthlyCosts.filter(r => r.stationId == stationId).sort((a,b)=>b.month.localeCompare(a.month))[0];
                        const prevBalance = (lastReport && lastReport.generators && lastReport.generators[idx]) ? lastReport.generators[idx].balance : 0;
                        html += `<div class="border p-2 mb-2">
                            <strong>${name}</strong>
                            <div class="row mt-2">
                                <div class="col-md-3"><label>سولار مضاف</label><input type="number" class="form-control gen-added" data-idx="${idx}"></div>
                                <div class="col-md-3"><label>رصيد سابق</label><input type="number" class="form-control gen-prev" value="${prevBalance}"></div>
                                <div class="col-md-3"><label>ساعات على حمل</label><input type="number" class="form-control gen-load-hours" step="0.5"></div>
                                <div class="col-md-3"><label>ساعات بدون حمل</label><input type="number" class="form-control gen-idle-hours" step="0.5"></div>
                                <div class="col-md-3"><label>معدل حمل</label><input type="text" class="form-control" value="${loadRate}" readonly></div>
                                <div class="col-md-3"><label>معدل بدون حمل</label><input type="text" class="form-control" value="${idleRate}" readonly></div>
                                <div class="col-md-3"><label>الاستهلاك</label><input type="text" class="form-control gen-consumed" readonly></div>
                                <div class="col-md-3"><label>الرصيد المتبقي</label><input type="text" class="form-control gen-balance" readonly></div>
                            </div>
                        </div>`;
                    });
                    generatorsDiv.innerHTML = html;
                    document.querySelectorAll('.gen-load-hours, .gen-idle-hours, .gen-added').forEach(inp => {
                        inp.addEventListener('input', function() {
                            const div = this.closest('.border');
                            const loadHours = parseFloat(div.querySelector('.gen-load-hours').value) || 0;
                            const idleHours = parseFloat(div.querySelector('.gen-idle-hours').value) || 0;
                            const loadRate = parseFloat(div.querySelector('.gen-load-hours').closest('.row').querySelector('input[readonly]').value) || 0;
                            const idleRate = parseFloat(div.querySelector('.gen-idle-hours').closest('.row').querySelectorAll('input[readonly]')[1].value) || 0;
                            const added = parseFloat(div.querySelector('.gen-added').value) || 0;
                            const prevBalance = parseFloat(div.querySelector('.gen-prev').value) || 0;
                            const consumed = (loadHours * loadRate) + (idleHours * idleRate);
                            const balance = prevBalance + added - consumed;
                            div.querySelector('.gen-consumed').value = consumed.toFixed(2);
                            div.querySelector('.gen-balance').value = balance.toFixed(2);
                        });
                    });
                } else generatorsDiv.innerHTML = '<div class="alert alert-warning">لا توجد مولدات</div>';
            }
        }
    });
    
    function calculateWaterPumped() {
        const hours = parseFloat(document.getElementById('operatingHours').value) || 0;
        const flow = parseFloat(document.getElementById('pumpForFlow').value) || 0;
        document.getElementById('waterPumped').value = (hours * flow).toFixed(2);
    }
    document.getElementById('operatingHours').addEventListener('input', calculateWaterPumped);
    document.getElementById('pumpForFlow').addEventListener('change', calculateWaterPumped);
    
    function calculateWater() {
        const curr = parseFloat(document.getElementById('currentWater').value) || 0;
        const prev = parseFloat(document.getElementById('prevWater').value) || 0;
        const consumed = curr - prev;
        const cost = consumed * tariffs.water;
        document.getElementById('waterConsumed').value = consumed.toFixed(2);
        document.getElementById('waterCost').value = cost.toFixed(2);
    }
    document.getElementById('currentWater').addEventListener('input', calculateWater);
    document.getElementById('prevWater').addEventListener('input', calculateWater);
    
    document.getElementById('monthlyForm').onsubmit = function(e) {
        e.preventDefault();
        const stationId = document.getElementById('monthStation').value;
        const station = stations.find(s => s.id == stationId);
        const month = document.getElementById('monthPeriod').value;
        if (!stationId || !month) { alert('اختر المحطة والشهر'); return; }
        
        const operatingHours = parseFloat(document.getElementById('operatingHours').value) || 0;
        const pumpFlow = parseFloat(document.getElementById('pumpForFlow').value) || 0;
        const waterPumped = operatingHours * pumpFlow;
        
        const transformers = [];
        document.querySelectorAll('#transformersInputs .border').forEach(div => {
            const current = parseFloat(div.querySelector('.transformer-current').value) || 0;
            const prev = parseFloat(div.querySelector('.transformer-prev').value) || 0;
            const diff = current - prev;
            const cost = diff * tariffs.electricity;
            transformers.push({ current, prev, diff, cost });
        });
        const totalElecCost = transformers.reduce((sum, t) => sum + t.cost, 0);
        
        const generators = [];
        document.querySelectorAll('#generatorsInputs .border').forEach(div => {
            const added = parseFloat(div.querySelector('.gen-added').value) || 0;
            const prevBalance = parseFloat(div.querySelector('.gen-prev').value) || 0;
            const loadHours = parseFloat(div.querySelector('.gen-load-hours').value) || 0;
            const idleHours = parseFloat(div.querySelector('.gen-idle-hours').value) || 0;
            const loadRate = parseFloat(div.querySelector('.gen-load-hours').closest('.row').querySelector('input[readonly]').value) || 0;
            const idleRate = parseFloat(div.querySelector('.gen-idle-hours').closest('.row').querySelectorAll('input[readonly]')[1].value) || 0;
            const consumed = (loadHours * loadRate) + (idleHours * idleRate);
            const balance = prevBalance + added - consumed;
            generators.push({ added, prevBalance, loadHours, idleHours, consumed, balance });
        });
        const totalDieselBalance = generators.reduce((sum, g) => sum + g.balance, 0);
        
        const currentWater = parseFloat(document.getElementById('currentWater').value) || 0;
        const prevWater = parseFloat(document.getElementById('prevWater').value) || 0;
        const waterConsumed = currentWater - prevWater;
        const waterCost = waterConsumed * tariffs.water;
        
        const report = {
            id: Date.now(), stationId, stationName: station.name, month,
            operatingHours, pumpFlow, waterPumped,
            transformers, totalElecCost,
            generators, totalDieselBalance,
            water: { current: currentWater, prev: prevWater, consumed: waterConsumed, cost: waterCost }
        };
        
        let monthlyList = JSON.parse(localStorage.getItem('monthlyCosts') || '[]');
        const existingIndex = monthlyList.findIndex(r => r.stationId == stationId && r.month == month);
        if (existingIndex !== -1) {
            if (confirm('يوجد تقرير لهذا الشهر. هل تريد تحديثه؟')) monthlyList[existingIndex] = report;
            else return;
        } else monthlyList.push(report);
        localStorage.setItem('monthlyCosts', JSON.stringify(monthlyList));
        alert('تم حفظ التقرير');
        loadPage('home');
    };
    
    window.editMonthlyReport = (id) => {
        const report = monthlyCosts.find(r => r.id == id);
        if (!report) return;
        document.getElementById('monthStation').value = report.stationId;
        document.getElementById('monthStation').dispatchEvent(new Event('change'));
        document.getElementById('monthPeriod').value = report.month;
        document.getElementById('operatingHours').value = report.operatingHours;
        setTimeout(() => {
            document.getElementById('pumpForFlow').value = report.pumpFlow;
            calculateWaterPumped();
            if (report.transformers) {
                report.transformers.forEach((t, idx) => {
                    const inputs = document.querySelectorAll('.transformer-current');
                    if (inputs[idx]) inputs[idx].value = t.current;
                    const prevInputs = document.querySelectorAll('.transformer-prev');
                    if (prevInputs[idx]) prevInputs[idx].value = t.prev;
                    inputs[idx]?.dispatchEvent(new Event('input'));
                });
            }
            if (report.generators) {
                report.generators.forEach((g, idx) => {
                    const addedInputs = document.querySelectorAll('.gen-added');
                    if (addedInputs[idx]) addedInputs[idx].value = g.added;
                    const loadInputs = document.querySelectorAll('.gen-load-hours');
                    if (loadInputs[idx]) loadInputs[idx].value = g.loadHours;
                    const idleInputs = document.querySelectorAll('.gen-idle-hours');
                    if (idleInputs[idx]) idleInputs[idx].value = g.idleHours;
                    loadInputs[idx]?.dispatchEvent(new Event('input'));
                });
            }
            document.getElementById('currentWater').value = report.water?.current || 0;
            document.getElementById('prevWater').value = report.water?.prev || 0;
            calculateWater();
        }, 200);
        document.getElementById('previousReportsList').style.display = 'none';
    };
    
    window.deleteMonthlyReport = (id) => {
        if (confirm('هل تريد حذف هذا التقرير؟')) {
            let monthlyList = JSON.parse(localStorage.getItem('monthlyCosts') || '[]');
            monthlyList = monthlyList.filter(r => r.id != id);
            localStorage.setItem('monthlyCosts', JSON.stringify(monthlyList));
            showPreviousReports();
        }
    };
}

// ==================== تقرير المتابعة الدورية ====================
function loadReportDaily(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const dailyReports = JSON.parse(localStorage.getItem('dailyReports') || '[]');
    let stationOptions = '<option value="">اختر محطة</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>📝 تقرير المتابعة الدورية</h4>
            <div class="row">
                <div class="col-md-4"><label>المحطة</label><select id="dailyStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4"><label>التاريخ</label><input type="date" id="dailyDate" class="form-control"></div>
                <div class="col-md-4"><label>المتابع</label><input type="text" id="dailyInspector" class="form-control"></div>
            </div>
            <div id="assetsStatus" class="mt-3"></div>
            <button class="btn btn-primary mt-3" onclick="saveDailyReport()">💾 حفظ</button>
            <button class="btn btn-info mt-3" onclick="showDailyReportsList()">📋 قائمة التقارير</button>
        </div>
        <div id="dailyReportsList" class="mt-4" style="display:none"></div>
    `;
    
    document.getElementById('dailyStation').addEventListener('change', function() {
        const stationId = this.value;
        const station = stations.find(s => s.id == stationId);
        if (!station) return;
        let html = '<h5>حالة الأصول</h5>';
        const allAssets = [];
        if (station.mainPumps) station.mainPumps.forEach((p,i) => allAssets.push({ name: p['رقم/اسم الطلمبة'] || `طلمبة رئيسية ${i+1}`, type: 'main', idx: i }));
        if (station.drainPumps) station.drainPumps.forEach((p,i) => allAssets.push({ name: p['رقم/اسم الطلمبة'] || `طلمبة نزح ${i+1}`, type: 'drain', idx: i }));
        if (station.winches) station.winches.forEach((w,i) => allAssets.push({ name: w['رقم/اسم الونش'] || `ونش ${i+1}`, type: 'winch', idx: i }));
        if (station.panels) station.panels.forEach((p,i) => allAssets.push({ name: p['رقم/اسم اللوحة'] || `لوحة ${i+1}`, type: 'panel', idx: i }));
        if (station.fans) station.fans.forEach((f,i) => allAssets.push({ name: f['رقم/اسم المروحة'] || `مروحة ${i+1}`, type: 'fan', idx: i }));
        if (station.sealPumps) station.sealPumps.forEach((s,i) => allAssets.push({ name: s['رقم/اسم الطلمبة'] || `حبس جلندات ${i+1}`, type: 'seal', idx: i }));
        if (station.buildings) station.buildings.forEach((b,i) => allAssets.push({ name: b['رقم/اسم المبنى'] || `مبنى ${i+1}`, type: 'building', idx: i }));
        
        allAssets.forEach(asset => {
            html += `<div class="border p-2 mb-2">
                <strong>${asset.name}</strong>
                <div class="row mt-2">
                    <div class="col-md-4"><label><input type="radio" name="status_${asset.type}_${asset.idx}" value="يعمل"> يعمل</label> <label><input type="radio" name="status_${asset.type}_${asset.idx}" value="لا يعمل"> لا يعمل</label></div>
                    <div class="col-md-4"><input type="text" class="form-control" placeholder="ملاحظات" id="notes_${asset.type}_${asset.idx}"></div>
                    <div class="col-md-4"><input type="text" class="form-control" placeholder="سبب التوقف" id="reason_${asset.type}_${asset.idx}"></div>
                </div>
            </div>`;
        });
        document.getElementById('assetsStatus').innerHTML = html;
    });
    
    window.saveDailyReport = () => {
        const stationId = document.getElementById('dailyStation').value;
        const date = document.getElementById('dailyDate').value;
        const inspector = document.getElementById('dailyInspector').value;
        if (!stationId || !date) { alert('اختر المحطة والتاريخ'); return; }
        const assets = [];
        document.querySelectorAll('#assetsStatus .border').forEach(div => {
            const name = div.querySelector('strong').innerText;
            const statusRadio = div.querySelector('input[type="radio"]:checked');
            const status = statusRadio ? statusRadio.value : '';
            const notes = div.querySelector('input[placeholder="ملاحظات"]')?.value || '';
            const reason = div.querySelector('input[placeholder="سبب التوقف"]')?.value || '';
            assets.push({ name, status, notes, reason });
        });
        let reports = JSON.parse(localStorage.getItem('dailyReports') || '[]');
        reports.push({ id: Date.now(), stationId, stationName: stations.find(s=>s.id==stationId)?.name, date, inspector, assets });
        localStorage.setItem('dailyReports', JSON.stringify(reports));
        alert('تم حفظ التقرير');
        loadPage('home');
    };
    
    window.showDailyReportsList = () => {
        const stationId = document.getElementById('dailyStation').value;
        const reports = dailyReports.filter(r => !stationId || r.stationId == stationId).sort((a,b)=>b.date.localeCompare(a.date));
        const listDiv = document.getElementById('dailyReportsList');
        if (reports.length === 0) listDiv.innerHTML = '<div class="alert alert-info">لا توجد تقارير</div>';
        else {
            let html = '<div class="form-card"><h5>قائمة التقارير</h5><table class="table"><thead><tr><th>المحطة</th><th>التاريخ</th><th>المتابع</th><th></th></tr></thead><tbody>';
            reports.forEach(r => {
                html += `<tr><td>${r.stationName}</td><td>${r.date}</td><td>${r.inspector || '-'}</td>
                <td><button class="btn btn-sm btn-warning" onclick="editDailyReport(${r.id})">تعديل</button>
                <button class="btn btn-sm btn-danger" onclick="deleteDailyReport(${r.id})">حذف</button>
                <button class="btn btn-sm btn-info" onclick="printDailyReport(${r.id})">طباعة</button></td></tr>`;
            });
            html += '</tbody></table></div>';
            listDiv.innerHTML = html;
        }
        listDiv.style.display = 'block';
    };
    
    window.editDailyReport = (id) => {
        const report = dailyReports.find(r => r.id == id);
        if (!report) return;
        document.getElementById('dailyStation').value = report.stationId;
        document.getElementById('dailyStation').dispatchEvent(new Event('change'));
        document.getElementById('dailyDate').value = report.date;
        document.getElementById('dailyInspector').value = report.inspector || '';
        setTimeout(() => {
            report.assets.forEach((asset, idx) => {
                const radios = document.querySelectorAll(`input[type="radio"][value="${asset.status}"]`);
                if (radios[idx]) radios[idx].checked = true;
                const notesInputs = document.querySelectorAll('input[placeholder="ملاحظات"]');
                if (notesInputs[idx]) notesInputs[idx].value = asset.notes;
                const reasonInputs = document.querySelectorAll('input[placeholder="سبب التوقف"]');
                if (reasonInputs[idx]) reasonInputs[idx].value = asset.reason;
            });
        }, 200);
        document.getElementById('dailyReportsList').style.display = 'none';
        alert('عدل البيانات ثم احفظ التقرير مرة أخرى');
    };
    
    window.deleteDailyReport = (id) => {
        if (confirm('هل تريد حذف هذا التقرير؟')) {
            let reports = JSON.parse(localStorage.getItem('dailyReports') || '[]');
            reports = reports.filter(r => r.id != id);
            localStorage.setItem('dailyReports', JSON.stringify(reports));
            showDailyReportsList();
        }
    };
    
    window.printDailyReport = (id) => {
        const report = dailyReports.find(r => r.id == id);
        if (report) {
            const win = window.open('', '_blank');
            win.document.write(`<html dir="rtl"><head><title>تقرير ${report.stationName} - ${report.date}</title>
            <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px}</style></head>
            <body><h2>تقرير المتابعة الدورية</h2><p><strong>المحطة:</strong> ${report.stationName}</p>
            <p><strong>التاريخ:</strong> ${report.date}</p><p><strong>المتابع:</strong> ${report.inspector || '-'}</p>
            <table><thead><tr><th>الأصل</th><th>الحالة</th><th>ملاحظات</th><th>سبب التوقف</th></tr></thead><tbody>
            ${report.assets.map(a => `<tr><td>${a.name}</td><td>${a.status}</td><td>${a.notes}</td><td>${a.reason}</td></tr>`).join('')}
            </tbody></table></body></html>`);
            win.document.close();
            win.print();
        }
    };
}

// ==================== تقرير الأعطال ====================
function loadReportFaults(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    let stationOptions = '<option value="">كل المحطات</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    container.innerHTML = `
        <div class="form-card">
            <h4>🐛 تقرير الأعطال</h4>
            <div class="row">
                <div class="col-md-4"><label>المحطة</label><select id="faultReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4"><label>من تاريخ</label><input type="date" id="faultFrom" class="form-control"></div>
                <div class="col-md-4"><label>إلى تاريخ</label><input type="date" id="faultTo" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-3" onclick="showFaultsReport()">عرض</button>
            <button class="btn btn-secondary mt-3" onclick="printFaultsReport()">طباعة</button>
            <div id="faultsReportResult" class="mt-4"></div>
        </div>
    `;
    
    window.showFaultsReport = () => {
        const stationId = document.getElementById('faultReportStation').value;
        const from = document.getElementById('faultFrom').value;
        const to = document.getElementById('faultTo').value;
        let faults = JSON.parse(localStorage.getItem('faults') || '[]');
        if (stationId) faults = faults.filter(f => f.stationId == stationId);
        if (from) faults = faults.filter(f => f.date >= from);
        if (to) faults = faults.filter(f => f.date <= to);
        const resultDiv = document.getElementById('faultsReportResult');
        if (faults.length === 0) { resultDiv.innerHTML = '<div class="alert alert-info">لا توجد أعطال</div>'; return; }
        let html = '<div class="table-responsive"><table class="table"><thead><tr><th>المحطة</th><th>الأصل</th><th>النوع</th><th>التاريخ</th><th>الوصف</th><th>الإجراء</th><th>الحالة</th></tr></thead><tbody>';
        faults.forEach(f => {
            html += `<tr><td>${f.stationName || '-'}</td><td>${f.assetName || '-'}</td><td>${f.type}</td><td>${f.date}</td><td>${f.description}</td><td>${f.actions || '-'}</td><td>${f.status === 'open' ? 'مفتوح' : 'مغلق'}</td></tr>`;
        });
        html += '</tbody></table></div>';
        resultDiv.innerHTML = html;
    };
    window.printFaultsReport = () => window.print();
}

// ==================== تقرير متابعة محطة ====================
function loadReportStation(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const dailyReports = JSON.parse(localStorage.getItem('dailyReports') || '[]');
    const faults = JSON.parse(localStorage.getItem('faults') || '[]');
    const openFaults = faults.filter(f => f.status === 'open');
    
    let stationOptions = '<option value="">اختر محطة</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    container.innerHTML = `
        <div class="form-card">
            <h4>🏭 تقرير متابعة محطة</h4>
            <div class="row"><div class="col-md-6"><select id="stationReportSelect" class="form-control">${stationOptions}</select></div>
            <div class="col-md-6"><button class="btn btn-primary" onclick="showStationFullReport()">عرض</button></div></div>
            <div id="stationFullReport" class="mt-4"></div>
            <button id="printStationBtn" class="btn btn-secondary mt-3" style="display:none" onclick="printStationReport()">طباعة</button>
        </div>
    `;
    
    window.showStationFullReport = () => {
        const stationId = document.getElementById('stationReportSelect').value;
        const station = stations.find(s => s.id == stationId);
        if (!station) { alert('اختر محطة'); return; }
        
        const lastDaily = dailyReports.filter(r => r.stationId == stationId).sort((a,b)=>b.date.localeCompare(a.date))[0];
        const dailyMap = {};
        if (lastDaily && lastDaily.assets) lastDaily.assets.forEach(a => { dailyMap[a.name] = { status: a.status, notes: a.notes, reason: a.reason }; });
        
        const stationOpenFaults = openFaults.filter(f => f.stationId == stationId);
        const faultMap = {};
        stationOpenFaults.forEach(f => { faultMap[f.assetName] = { reason: f.description, date: f.date }; });
        
        const allAssets = [];
        if (station.mainPumps) station.mainPumps.forEach((p,i) => allAssets.push(p['رقم/اسم الطلمبة'] || `طلمبة رئيسية ${i+1}`));
        if (station.drainPumps) station.drainPumps.forEach((p,i) => allAssets.push(p['رقم/اسم الطلمبة'] || `طلمبة نزح ${i+1}`));
        if (station.winches) station.winches.forEach((w,i) => allAssets.push(w['رقم/اسم الونش'] || `ونش ${i+1}`));
        if (station.panels) station.panels.forEach((p,i) => allAssets.push(p['رقم/اسم اللوحة'] || `لوحة ${i+1}`));
        if (station.fans) station.fans.forEach((f,i) => allAssets.push(f['رقم/اسم المروحة'] || `مروحة ${i+1}`));
        if (station.sealPumps) station.sealPumps.forEach((s,i) => allAssets.push(s['رقم/اسم الطلمبة'] || `حبس جلندات ${i+1}`));
        
        let html = `<h5>${station.name} (${station.code})</h5><table class="table table-bordered"><thead><tr><th>الأصل</th><th>الحالة</th><th>سبب التوقف</th><th>المصدر</th></tr></thead><tbody>`;
        allAssets.forEach(name => {
            let status = '-', reason = '-', source = '';
            if (faultMap[name]) { status = 'لا يعمل'; reason = faultMap[name].reason; source = `بلاغ عطل (${faultMap[name].date})`; }
            else if (dailyMap[name]) { status = dailyMap[name].status; reason = dailyMap[name].reason; source = `تقرير متابعة (${lastDaily?.date})`; if(dailyMap[name].notes) source += ` - ملاحظات: ${dailyMap[name].notes}`; }
            html += `<tr><td>${name}</td><td>${status}</td><td>${reason}</td><td>${source}</td></tr>`;
        });
        html += '</tbody></table>';
        document.getElementById('stationFullReport').innerHTML = html;
        document.getElementById('printStationBtn').style.display = 'block';
    };
    
    window.printStationReport = () => {
        const content = document.getElementById('stationFullReport').innerHTML;
        const stationName = document.getElementById('stationReportSelect').selectedOptions[0]?.text;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير متابعة ${stationName}</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px}</style></head>
        <body><h2>تقرير متابعة محطة ${stationName}</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

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
        { id: 1, name: 'محطة بني مزار', code: 'ST001', type: 'رئيسية', outfall: 'محطة المعالجة', capacity: '500', mainPumps: [{ 'رقم/اسم الطلمبة': 'طلمبة 1', 'التصرف m³/h': '500' }] }
    ]));
}
if (!localStorage.getItem('employees')) {
    localStorage.setItem('employees', JSON.stringify([
        { id: 1, name: 'أحمد محمد', code: 'EMP001', stationId: '1', role: 'مدير محطة', shift: 'أولى', phone: '01234567890', status: 'يعمل' }
    ]));
}
if (!localStorage.getItem('faults')) localStorage.setItem('faults', JSON.stringify([]));
if (!localStorage.getItem('tariffs')) localStorage.setItem('tariffs', JSON.stringify({ electricity: 1.2, water: 3.5 }));
if (!localStorage.getItem('monthlyCosts')) localStorage.setItem('monthlyCosts', JSON.stringify([]));
if (!localStorage.getItem('dailyReports')) localStorage.setItem('dailyReports', JSON.stringify([]));
if (!localStorage.getItem('archive')) localStorage.setItem('archive', JSON.stringify({}));
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
        { id: 1, username: 'admin', name: 'مدير النظام', password: 'admin123', role: 'مدير' }
    ]));
}
// ==================== تقرير العاملين ====================
function loadReportEmployees(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const stationMap = {};
    stations.forEach(s => stationMap[s.id] = s.name);
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>👥 تقرير العاملين</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="empReportStationFilter" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>الوظيفة</label><select id="empReportRoleFilter" class="form-control"><option value="">الكل</option><option>مدير محطة</option><option>مهندس</option><option>فني</option><option>عامل</option></select></div>
                <div class="col-md-4 mb-2"><label>الحالة</label><select id="empReportStatusFilter" class="form-control"><option value="">الكل</option><option>يعمل</option><option>إجازة</option></select></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showEmployeesReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printEmployeesReport()">🖨️ طباعة</button>
            <div id="employeesReportResult" class="mt-4"></div>
        </div>
    `;
    
    window.showEmployeesReport = () => {
        const stationId = document.getElementById('empReportStationFilter').value;
        const role = document.getElementById('empReportRoleFilter').value;
        const status = document.getElementById('empReportStatusFilter').value;
        
        let filtered = employees;
        if (stationId) filtered = filtered.filter(e => e.stationId == stationId);
        if (role) filtered = filtered.filter(e => e.role == role);
        if (status) filtered = filtered.filter(e => e.status == status);
        
        const resultDiv = document.getElementById('employeesReportResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد بيانات مطابقة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead>运转<th>الكود</th><th>الاسم</th><th>المحطة</th><th>الوظيفة</th><th>الوردية</th><th>التليفون</th><th>الحالة</th> </thead>
            <tbody>`;
        filtered.forEach(e => {
            html += `运转
                <td>${e.code}</td>
                <td>${e.name}</td>
                <td>${stationMap[e.stationId] || '-'}</td>
                <td>${e.role}</td>
                <td>${e.shift || '-'}</td>
                <td>${e.phone || '-'}</td>
                <td>${e.status}</td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printEmployeesReport = () => {
        const content = document.getElementById('employeesReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير العاملين</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right}</style></head>
        <body><h2>تقرير العاملين</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== تقرير قطع الغيار ====================
function loadReportSpareParts(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const faults = JSON.parse(localStorage.getItem('faults') || '[]');
    const faultsWithParts = faults.filter(f => f.parts && f.parts.trim() !== '');
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>🔧 تقرير قطع الغيار المستخدمة</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="spareReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>من تاريخ</label><input type="date" id="spareFromDate" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>إلى تاريخ</label><input type="date" id="spareToDate" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showSparePartsReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printSparePartsReport()">🖨️ طباعة</button>
            <div id="sparePartsReportResult" class="mt-4"></div>
        </div>
    `;
    
    window.showSparePartsReport = () => {
        const stationId = document.getElementById('spareReportStation').value;
        const fromDate = document.getElementById('spareFromDate').value;
        const toDate = document.getElementById('spareToDate').value;
        
        let filtered = faultsWithParts;
        if (stationId) filtered = filtered.filter(f => f.stationId == stationId);
        if (fromDate) filtered = filtered.filter(f => f.date >= fromDate);
        if (toDate) filtered = filtered.filter(f => f.date <= toDate);
        
        const resultDiv = document.getElementById('sparePartsReportResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد قطع غيار مسجلة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead>运转<th>التاريخ</th><th>المحطة</th><th>الأصل المعطل</th><th>قطع الغيار المستخدمة</th><th>نوع العطل</th> </thead>
            <tbody>`;
        filtered.forEach(f => {
            const station = stations.find(s => s.id == f.stationId);
            html += `<tr>
                <td>${f.date}</td>
                <td>${station?.name || '-'}</td>
                <td>${f.assetName || '-'}</td>
                <td>${f.parts}</td>
                <td>${f.type}</td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printSparePartsReport = () => {
        const content = document.getElementById('sparePartsReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير قطع الغيار</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right}</style></head>
        <body><h2>تقرير قطع الغيار المستخدمة</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== الأرشيف ====================
function loadArchive(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    let stationOptions = '<option value="">اختر محطة</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>📁 أرشيف المستندات</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="archiveStationSelect" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><input type="file" id="archiveFileInput" class="form-control" accept="image/*,application/pdf"></div>
                <div class="col-md-4 mb-2"><button class="btn btn-primary" onclick="uploadArchiveFile()">📤 رفع ملف</button></div>
            </div>
            <div id="archiveFilesContainer" class="mt-4 row"></div>
        </div>
    `;
    
    function displayArchiveFiles() {
        const stationId = document.getElementById('archiveStationSelect').value;
        if (!stationId) {
            document.getElementById('archiveFilesContainer').innerHTML = '<div class="alert alert-info">اختر محطة لعرض ملفاتها</div>';
            return;
        }
        const archive = JSON.parse(localStorage.getItem('archive') || '{}');
        const files = archive[stationId] || [];
        const containerDiv = document.getElementById('archiveFilesContainer');
        containerDiv.innerHTML = '';
        if (files.length === 0) {
            containerDiv.innerHTML = '<div class="alert alert-info">لا توجد ملفات مرفوعة لهذه المحطة</div>';
            return;
        }
        files.forEach((file, idx) => {
            const col = document.createElement('div');
            col.className = 'col-md-3 mb-3';
            const isImage = file.type === 'image';
            col.innerHTML = `
                <div class="card">
                    ${isImage ? `<img src="${file.data}" class="card-img-top" alt="${file.name}" style="height:150px;object-fit:cover">` : `<div class="card-header bg-secondary text-white">📄 ${file.name}</div>`}
                    <div class="card-body">
                        <p class="card-text"><small>${new Date(file.date).toLocaleString('ar-EG')}</small></p>
                        <button class="btn btn-sm btn-info" onclick="viewArchiveFile('${stationId}', ${idx})">عرض</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteArchiveFile('${stationId}', ${idx})">حذف</button>
                    </div>
                </div>
            `;
            containerDiv.appendChild(col);
        });
    }
    
    window.uploadArchiveFile = () => {
        const stationId = document.getElementById('archiveStationSelect').value;
        const fileInput = document.getElementById('archiveFileInput');
        if (!stationId) { alert('اختر محطة أولاً'); return; }
        if (!fileInput.files.length) { alert('اختر ملف أولاً'); return; }
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            let archive = JSON.parse(localStorage.getItem('archive') || '{}');
            if (!archive[stationId]) archive[stationId] = [];
            archive[stationId].push({
                name: file.name,
                data: e.target.result,
                type: file.type.startsWith('image/') ? 'image' : 'file',
                date: new Date().toISOString()
            });
            localStorage.setItem('archive', JSON.stringify(archive));
            alert('تم رفع الملف بنجاح');
            fileInput.value = '';
            displayArchiveFiles();
        };
        reader.readAsDataURL(file);
    };
    
    window.viewArchiveFile = (stationId, index) => {
        const archive = JSON.parse(localStorage.getItem('archive') || '{}');
        const file = archive[stationId]?.[index];
        if (file) {
            const win = window.open('', '_blank');
            win.document.write(`<html dir="rtl"><head><title>${file.name}</title></head><body style="text-align:center">`);
            if (file.type === 'image') {
                win.document.write(`<img src="${file.data}" style="max-width:100%;max-height:90vh">`);
            } else {
                win.document.write(`<iframe src="${file.data}" style="width:100%;height:90vh" frameborder="0"></iframe>`);
            }
            win.document.write(`</body></html>`);
            win.document.close();
        }
    };
    
    window.deleteArchiveFile = (stationId, index) => {
        if (confirm('هل تريد حذف هذا الملف؟')) {
            let archive = JSON.parse(localStorage.getItem('archive') || '{}');
            if (archive[stationId]) {
                archive[stationId].splice(index, 1);
                if (archive[stationId].length === 0) delete archive[stationId];
                localStorage.setItem('archive', JSON.stringify(archive));
                displayArchiveFiles();
                alert('تم حذف الملف');
            }
        }
    };
    
    document.getElementById('archiveStationSelect').addEventListener('change', displayArchiveFiles);
    displayArchiveFiles();
}

// ==================== إدارة المستخدمين ====================
function loadUsers(container) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    container.innerHTML = `
        <div class="form-card">
            <h4>⚙️ إدارة المستخدمين والصلاحيات</h4>
            <form id="userForm">
                <div class="row">
                    <div class="col-md-3 mb-2"><input type="text" id="userCode" class="form-control" placeholder="كود المستخدم" required></div>
                    <div class="col-md-3 mb-2"><input type="text" id="userName" class="form-control" placeholder="الاسم" required></div>
                    <div class="col-md-3 mb-2"><input type="password" id="userPass" class="form-control" placeholder="كلمة المرور" required></div>
                    <div class="col-md-3 mb-2"><select id="userRole" class="form-control">
                        <option>مدير (كل الصلاحيات)</option>
                        <option>مدير محدود (صلاحيات محددة لكل المواقع)</option>
                        <option>مدير موقع (صلاحيات محددة لموقع واحد)</option>
                    </select></div>
                </div>
                <button type="submit" class="btn btn-primary mt-2">➕ إضافة مستخدم</button>
            </form>
        </div>
        <div class="table-responsive mt-4"><table class="table table-bordered">
            <thead>运转<th>الكود</th><th>الاسم</th><th>الصلاحية</th><th>تاريخ الإضافة</th><th></th> </thead>
            <tbody id="usersTableBody"></tbody>
        </table></div>
    `;
    
    function renderUsersTable() {
        const usersList = JSON.parse(localStorage.getItem('users') || '[]');
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        usersList.forEach(u => {
            const row = tbody.insertRow();
            row.insertCell(0).innerText = u.username;
            row.insertCell(1).innerText = u.name;
            row.insertCell(2).innerText = u.role;
            row.insertCell(3).innerText = u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '-';
            const delCell = row.insertCell(4);
            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-sm btn-danger';
            delBtn.innerHTML = '<i class="fas fa-trash"></i> حذف';
            delBtn.onclick = () => {
                if (u.username === 'admin') {
                    alert('لا يمكن حذف المستخدم admin');
                    return;
                }
                if (confirm(`حذف المستخدم ${u.name}؟`)) {
                    const updated = usersList.filter(us => us.username !== u.username);
                    localStorage.setItem('users', JSON.stringify(updated));
                    renderUsersTable();
                }
            };
            delCell.appendChild(delBtn);
        });
    }
    
    document.getElementById('userForm').onsubmit = function(e) {
        e.preventDefault();
        let usersList = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
            id: Date.now(),
            username: document.getElementById('userCode').value,
            name: document.getElementById('userName').value,
            password: document.getElementById('userPass').value,
            role: document.getElementById('userRole').value,
            createdAt: new Date().toISOString()
        };
        if (usersList.find(u => u.username === newUser.username)) {
            alert('كود المستخدم موجود مسبقاً');
            return;
        }
        usersList.push(newUser);
        localStorage.setItem('users', JSON.stringify(usersList));
        alert('تم إضافة المستخدم بنجاح');
        document.getElementById('userForm').reset();
        renderUsersTable();
    };
    
    renderUsersTable();
}
function loadReportAsset(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const dailyReports = JSON.parse(localStorage.getItem('dailyReports') || '[]');
    const faults = JSON.parse(localStorage.getItem('faults') || '[]');
    const openFaults = faults.filter(f => f.status === 'open');
    
    let stationOptions = '<option value="">اختر محطة</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>⚙️ تقرير متابعة أصل</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="assetReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>اختر الأصل</label><select id="assetReportSelect" class="form-control"><option value="">اختر المحطة أولاً</option></select></div>
                <div class="col-md-4 mb-2"><button class="btn btn-primary mt-4" onclick="showAssetFullReport()">عرض التقرير</button></div>
            </div>
            <div id="assetFullReport" class="mt-4"></div>
            <button id="printAssetBtn" class="btn btn-secondary mt-3" style="display:none" onclick="printAssetReport()">🖨️ طباعة</button>
        </div>
    `;
    
    document.getElementById('assetReportStation').addEventListener('change', function() {
        const stationId = this.value;
        const station = stations.find(s => s.id == stationId);
        const assetSelect = document.getElementById('assetReportSelect');
        if (!station) { 
            assetSelect.innerHTML = '<option value="">اختر المحطة أولاً</option>'; 
            return; 
        }
        
        const assets = [];
        if (station.mainPumps && station.mainPumps.length) {
            station.mainPumps.forEach((p,i) => {
                assets.push({ id: `main_${i}`, name: p['رقم/اسم الطلمبة'] || `طلمبة رئيسية ${i+1}` });
            });
        }
        if (station.drainPumps && station.drainPumps.length) {
            station.drainPumps.forEach((p,i) => {
                assets.push({ id: `drain_${i}`, name: p['رقم/اسم الطلمبة'] || `طلمبة نزح ${i+1}` });
            });
        }
        if (station.winches && station.winches.length) {
            station.winches.forEach((w,i) => {
                assets.push({ id: `winch_${i}`, name: w['رقم/اسم الونش'] || `ونش ${i+1}` });
            });
        }
        if (station.panels && station.panels.length) {
            station.panels.forEach((p,i) => {
                assets.push({ id: `panel_${i}`, name: p['رقم/اسم اللوحة'] || `لوحة ${i+1}` });
            });
        }
        if (station.fans && station.fans.length) {
            station.fans.forEach((f,i) => {
                assets.push({ id: `fan_${i}`, name: f['رقم/اسم المروحة'] || `مروحة ${i+1}` });
            });
        }
        if (station.sealPumps && station.sealPumps.length) {
            station.sealPumps.forEach((s,i) => {
                assets.push({ id: `seal_${i}`, name: s['رقم/اسم الطلمبة'] || `طلمبة حبس جلندات ${i+1}` });
            });
        }
        
        if (assets.length === 0) {
            assetSelect.innerHTML = '<option value="">لا توجد أصول مسجلة</option>';
        } else {
            assetSelect.innerHTML = '<option value="">اختر الأصل</option>' + assets.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
        }
    });
    
    window.showAssetFullReport = () => {
        const stationId = document.getElementById('assetReportStation').value;
        const assetId = document.getElementById('assetReportSelect').value;
        const assetName = document.getElementById('assetReportSelect').selectedOptions[0]?.text;
        
        if (!stationId) { alert('اختر محطة أولاً'); return; }
        if (!assetId) { alert('اختر الأصل أولاً'); return; }
        
        const station = stations.find(s => s.id == stationId);
        
        // جلب آخر تقرير متابعة دورية
        const lastDaily = dailyReports.filter(r => r.stationId == stationId).sort((a,b)=>b.date.localeCompare(a.date))[0];
        let assetStatus = '-', assetReason = '-', assetNotes = '', lastDate = '-';
        
        if (lastDaily && lastDaily.assets) {
            const assetDaily = lastDaily.assets.find(a => a.name === assetName);
            if (assetDaily) {
                assetStatus = assetDaily.status || '-';
                assetReason = assetDaily.reason || '-';
                assetNotes = assetDaily.notes || '';
                lastDate = lastDaily.date;
            }
        }
        
        // جلب البلاغات المفتوحة لهذا الأصل
        const assetFaults = openFaults.filter(f => f.stationId == stationId && f.assetName === assetName);
        
        let html = `<h5 class="mb-3">تقرير متابعة الأصل: ${assetName}</h5>
                    <p><strong>المحطة:</strong> ${station?.name} (${station?.code})</p>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead class="table-primary">
                                <tr><th>المصدر</th><th>الحالة</th><th>سبب التوقف</th><th>ملاحظات / تفاصيل</th></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>آخر تقرير متابعة دورية<br><small class="text-muted">${lastDate}</small></td>
                                    <td><span class="badge ${assetStatus === 'يعمل' ? 'bg-success' : (assetStatus === 'لا يعمل' ? 'bg-danger' : 'bg-secondary')}">${assetStatus || '-'}</span></td>
                                    <td>${assetReason || '-'}</td>
                                    <td>${assetNotes || '-'}</td>
                                </tr>`;
        
        if (assetFaults.length) {
            assetFaults.forEach(f => {
                html += `<tr style="background-color:#fff3cd">
                            <td>بلاغ عطل مفتوح<br><small class="text-muted">${f.date}</small></td>
                            <td><span class="badge bg-danger">لا يعمل</span></td>
                            <td>${f.description || '-'}</td>
                            <td><strong>الإجراء:</strong> ${f.actions || '-'}<br><strong>قطع الغيار:</strong> ${f.parts || '-'}</td>
                         </tr>`;
            });
        } else {
            html += `<tr><td>بلاغات الأعطال</td><td colspan="3">لا توجد بلاغات مفتوحة لهذا الأصل</td></tr>`;
        }
        
        html += `</tbody></table></div>`;
        
        document.getElementById('assetFullReport').innerHTML = html;
        document.getElementById('printAssetBtn').style.display = 'block';
    };
    
    window.printAssetReport = () => {
        const content = document.getElementById('assetFullReport').innerHTML;
        const assetName = document.getElementById('assetReportSelect').selectedOptions[0]?.text || 'الأصل';
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير متابعة أصل ${assetName}</title>
        <style>
            body{font-family:Tahoma;padding:20px;margin:0}
            table{border-collapse:collapse;width:100%;margin-bottom:20px}
            th,td{border:1px solid #ddd;padding:10px;text-align:right}
            th{background:#0d6efd;color:white}
            .badge{display:inline-block;padding:3px 8px;border-radius:12px;color:white}
            .bg-success{background:#28a745}
            .bg-danger{background:#dc3545}
            .bg-secondary{background:#6c757d}
            .text-muted{color:#6c757d}
        </style></head>
        <body><h2>تقرير متابعة أصل: ${assetName}</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}
// ==================== تقرير المياه المرفوعة ====================
function loadReportWaterPumped(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const monthlyCosts = JSON.parse(localStorage.getItem('monthlyCosts') || '[]');
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>💧 تقرير المياه المرفوعة</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="waterReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>من شهر</label><input type="month" id="waterFromMonth" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>إلى شهر</label><input type="month" id="waterToMonth" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showWaterPumpedReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printWaterPumpedReport()">🖨️ طباعة</button>
            <div id="waterPumpedReportResult" class="mt-4"></div>
        </div>
    `;
    
    window.showWaterPumpedReport = () => {
        const stationId = document.getElementById('waterReportStation').value;
        const fromMonth = document.getElementById('waterFromMonth').value;
        const toMonth = document.getElementById('waterToMonth').value;
        
        let filtered = monthlyCosts;
        if (stationId) filtered = filtered.filter(c => c.stationId == stationId);
        if (fromMonth) filtered = filtered.filter(c => c.month >= fromMonth);
        if (toMonth) filtered = filtered.filter(c => c.month <= toMonth);
        
        filtered.sort((a,b) => a.month.localeCompare(b.month));
        
        const resultDiv = document.getElementById('waterPumpedReportResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد بيانات في المدة المحددة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead class="table-primary">
                <tr><th>الشهر</th><th>المحطة</th><th>ساعات التشغيل</th><th>التصرف (m³/h)</th><th>المياه المرفوعة (m³)</th></tr>
            </thead>
            <tbody>`;
        
        let totalWater = 0;
        filtered.forEach(c => {
            const station = stations.find(s => s.id == c.stationId);
            totalWater += (c.waterPumped || 0);
            html += `<tr>
                <td>${c.month}</td>
                <td>${station?.name || '-'}</td>
                <td>${c.operatingHours || 0}</td>
                <td>${c.pumpFlow || 0}</td>
                <td><strong>${(c.waterPumped || 0).toLocaleString()} m³</strong></td>
            </tr>`;
        });
        
        html += `<tr class="table-secondary fw-bold">
            <td colspan="4" class="text-center">الإجمالي</td>
            <td>${totalWater.toLocaleString()} m³</td>
        </tr>`;
        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printWaterPumpedReport = () => {
        const content = document.getElementById('waterPumpedReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير المياه المرفوعة</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right} th{background:#0d6efd;color:white}</style></head>
        <body><h2>تقرير المياه المرفوعة</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== تقرير استهلاك الكهرباء ====================
function loadReportElectricity(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const monthlyCosts = JSON.parse(localStorage.getItem('monthlyCosts') || '[]');
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>⚡ تقرير استهلاك الكهرباء</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="elecReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>المحول</label><select id="elecReportTransformer" class="form-control"><option value="">كل المحولات</option></select></div>
                <div class="col-md-4 mb-2"><label>من شهر</label><input type="month" id="elecFromMonth" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>إلى شهر</label><input type="month" id="elecToMonth" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showElectricityReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printElectricityReport()">🖨️ طباعة</button>
            <div id="electricityReportResult" class="mt-4"></div>
        </div>
    `;
    
    // تعبئة قائمة المحولات عند اختيار المحطة
    document.getElementById('elecReportStation').addEventListener('change', function() {
        const stationId = this.value;
        const transformerSelect = document.getElementById('elecReportTransformer');
        if (!stationId) {
            transformerSelect.innerHTML = '<option value="">كل المحولات</option>';
            return;
        }
        const station = stations.find(s => s.id == stationId);
        if (station && station.powerSources) {
            const transformers = station.powerSources.filter(ps => ps['النوع'] === 'محول');
            if (transformers.length) {
                transformerSelect.innerHTML = '<option value="">كل المحولات</option>' + 
                    transformers.map((t, idx) => `<option value="${idx}">${t['رقم/اسم المصدر'] || `محول ${idx+1}`}</option>`).join('');
            } else {
                transformerSelect.innerHTML = '<option value="">لا توجد محولات</option>';
            }
        } else {
            transformerSelect.innerHTML = '<option value="">لا توجد محولات</option>';
        }
    });
    
    window.showElectricityReport = () => {
        const stationId = document.getElementById('elecReportStation').value;
        const transformerIdx = document.getElementById('elecReportTransformer').value;
        const fromMonth = document.getElementById('elecFromMonth').value;
        const toMonth = document.getElementById('elecToMonth').value;
        
        let filtered = monthlyCosts;
        if (stationId) filtered = filtered.filter(c => c.stationId == stationId);
        if (fromMonth) filtered = filtered.filter(c => c.month >= fromMonth);
        if (toMonth) filtered = filtered.filter(c => c.month <= toMonth);
        filtered.sort((a,b) => a.month.localeCompare(b.month));
        
        const resultDiv = document.getElementById('electricityReportResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد بيانات في المدة المحددة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead class="table-primary">
                <tr><th>الشهر</th><th>المحطة</th><th>المحول</th><th>الاستهلاك (kWh)</th><th>التكلفة (جنيه)</th></tr>
            </thead>
            <tbody>`;
        
        let totalKwh = 0, totalCost = 0;
        
        filtered.forEach(c => {
            const station = stations.find(s => s.id == c.stationId);
            if (c.transformers && c.transformers.length) {
                c.transformers.forEach((t, idx) => {
                    if (transformerIdx !== '' && transformerIdx != idx) return;
                    const transformerName = (station?.powerSources?.[idx]?.['رقم/اسم المصدر']) || `محول ${idx+1}`;
                    totalKwh += (t.diff || 0);
                    totalCost += (t.cost || 0);
                    html += `<tr>
                        <td>${c.month}</td>
                        <td>${station?.name || '-'}</td>
                        <td>${transformerName}</td>
                        <td>${(t.diff || 0).toLocaleString()}</td>
                        <td>${(t.cost || 0).toLocaleString()}</td>
                    </tr>`;
                });
            }
        });
        
        if (html === `<tr><td colspan="5" class="text-center">لا توجد بيانات</td></tr>`) {
            html = `<tr><td colspan="5" class="text-center">لا توجد بيانات للمحول المحدد</td></tr>`;
        }
        
        html += `<tr class="table-secondary fw-bold">
            <td colspan="3" class="text-center">الإجمالي</td>
            <td>${totalKwh.toLocaleString()} kWh</td>
            <td>${totalCost.toLocaleString()} جنيه</td>
        </tr>`;
        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printElectricityReport = () => {
        const content = document.getElementById('electricityReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير استهلاك الكهرباء</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right} th{background:#0d6efd;color:white}</style></head>
        <body><h2>تقرير استهلاك الكهرباء</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== تقرير استهلاك المياه ====================
function loadReportWaterConsumption(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const monthlyCosts = JSON.parse(localStorage.getItem('monthlyCosts') || '[]');
    const tariffs = JSON.parse(localStorage.getItem('tariffs') || '{"water":3.5}');
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>💧 تقرير استهلاك المياه (عدادات)</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="waterConsumptionStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>من شهر</label><input type="month" id="waterConsumptionFrom" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>إلى شهر</label><input type="month" id="waterConsumptionTo" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showWaterConsumptionReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printWaterConsumptionReport()">🖨️ طباعة</button>
            <div id="waterConsumptionResult" class="mt-4"></div>
        </div>
    `;
    
    window.showWaterConsumptionReport = () => {
        const stationId = document.getElementById('waterConsumptionStation').value;
        const fromMonth = document.getElementById('waterConsumptionFrom').value;
        const toMonth = document.getElementById('waterConsumptionTo').value;
        
        let filtered = monthlyCosts;
        if (stationId) filtered = filtered.filter(c => c.stationId == stationId);
        if (fromMonth) filtered = filtered.filter(c => c.month >= fromMonth);
        if (toMonth) filtered = filtered.filter(c => c.month <= toMonth);
        filtered.sort((a,b) => a.month.localeCompare(b.month));
        
        const resultDiv = document.getElementById('waterConsumptionResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد بيانات في المدة المحددة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead class="table-primary">
                <tr><th>الشهر</th><th>المحطة</th><th>الاستهلاك (m³)</th><th>التكلفة (جنيه)</th></tr>
            </thead>
            <tbody>`;
        
        let totalConsumed = 0, totalCost = 0;
        filtered.forEach(c => {
            const station = stations.find(s => s.id == c.stationId);
            const consumed = c.water?.consumed || 0;
            const cost = c.water?.cost || 0;
            totalConsumed += consumed;
            totalCost += cost;
            html += `<tr>
                <td>${c.month}</td>
                <td>${station?.name || '-'}</td>
                <td>${consumed.toLocaleString()} m³</td>
                <td>${cost.toLocaleString()} جنيه</td>
            </tr>`;
        });
        
        html += `<tr class="table-secondary fw-bold">
            <td colspan="2" class="text-center">الإجمالي</td>
            <td>${totalConsumed.toLocaleString()} m³</td>
            <td>${totalCost.toLocaleString()} جنيه</td>
        </tr>`;
        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printWaterConsumptionReport = () => {
        const content = document.getElementById('waterConsumptionResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير استهلاك المياه</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right} th{background:#0d6efd;color:white}</style></head>
        <body><h2>تقرير استهلاك المياه</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== تقرير استهلاك سولار ====================
function loadReportDiesel(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const monthlyCosts = JSON.parse(localStorage.getItem('monthlyCosts') || '[]');
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>🛢️ تقرير استهلاك السولار</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="dieselReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>المولد</label><select id="dieselReportGenerator" class="form-control"><option value="">كل المولدات</option></select></div>
                <div class="col-md-4 mb-2"><label>من شهر</label><input type="month" id="dieselFromMonth" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>إلى شهر</label><input type="month" id="dieselToMonth" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showDieselReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printDieselReport()">🖨️ طباعة</button>
            <div id="dieselReportResult" class="mt-4"></div>
        </div>
    `;
    
    document.getElementById('dieselReportStation').addEventListener('change', function() {
        const stationId = this.value;
        const generatorSelect = document.getElementById('dieselReportGenerator');
        if (!stationId) {
            generatorSelect.innerHTML = '<option value="">كل المولدات</option>';
            return;
        }
        const station = stations.find(s => s.id == stationId);
        if (station && station.powerSources) {
            const generators = station.powerSources.filter(ps => ps['النوع'] === 'مولد');
            if (generators.length) {
                generatorSelect.innerHTML = '<option value="">كل المولدات</option>' + 
                    generators.map((g, idx) => `<option value="${idx}">${g['رقم/اسم المصدر'] || `مولد ${idx+1}`}</option>`).join('');
            } else {
                generatorSelect.innerHTML = '<option value="">لا توجد مولدات</option>';
            }
        } else {
            generatorSelect.innerHTML = '<option value="">لا توجد مولدات</option>';
        }
    });
    
    window.showDieselReport = () => {
        const stationId = document.getElementById('dieselReportStation').value;
        const generatorIdx = document.getElementById('dieselReportGenerator').value;
        const fromMonth = document.getElementById('dieselFromMonth').value;
        const toMonth = document.getElementById('dieselToMonth').value;
        
        let filtered = monthlyCosts;
        if (stationId) filtered = filtered.filter(c => c.stationId == stationId);
        if (fromMonth) filtered = filtered.filter(c => c.month >= fromMonth);
        if (toMonth) filtered = filtered.filter(c => c.month <= toMonth);
        filtered.sort((a,b) => a.month.localeCompare(b.month));
        
        const resultDiv = document.getElementById('dieselReportResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد بيانات في المدة المحددة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead class="table-primary">
                <tr><th>الشهر</th><th>المحطة</th><th>المولد</th><th>الاستهلاك (لتر)</th><th>الرصيد المتبقي (لتر)</th></tr>
            </thead>
            <tbody>`;
        
        let totalConsumed = 0;
        
        filtered.forEach(c => {
            const station = stations.find(s => s.id == c.stationId);
            if (c.generators && c.generators.length) {
                c.generators.forEach((g, idx) => {
                    if (generatorIdx !== '' && generatorIdx != idx) return;
                    const generatorName = (station?.powerSources?.[idx]?.['رقم/اسم المصدر']) || `مولد ${idx+1}`;
                    totalConsumed += (g.consumed || 0);
                    html += `<tr>
                        <td>${c.month}</td>
                        <td>${station?.name || '-'}</td>
                        <td>${generatorName}</td>
                        <td>${(g.consumed || 0).toLocaleString()} لتر</td>
                        <td>${(g.balance || 0).toLocaleString()} لتر</td>
                    </tr>`;
                });
            }
        });
        
        html += `<tr class="table-secondary fw-bold">
            <td colspan="3" class="text-center">إجمالي الاستهلاك</td>
            <td>${totalConsumed.toLocaleString()} لتر</td>
            <td>-</td>
        </tr>`;
        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printDieselReport = () => {
        const content = document.getElementById('dieselReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير استهلاك السولار</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right} th{background:#0d6efd;color:white}</style></head>
        <body><h2>تقرير استهلاك السولار</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== تقرير قطع الغيار المتقدم ====================
function loadReportSparePartsAdvanced(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const faults = JSON.parse(localStorage.getItem('faults') || '[]');
    const faultsWithParts = faults.filter(f => f.parts && f.parts.trim() !== '');
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>🔧 تقرير قطع الغيار المستخدمة</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="spareAdvancedStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>من تاريخ</label><input type="date" id="spareAdvancedFrom" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>إلى تاريخ</label><input type="date" id="spareAdvancedTo" class="form-control"></div>
                <div class="col-md-12 mb-2"><label>بحث في قطع الغيار</label><input type="text" id="spareAdvancedSearch" class="form-control" placeholder="اكتب اسم قطعة الغيار..."></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showSparePartsAdvancedReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printSparePartsAdvancedReport()">🖨️ طباعة</button>
            <div id="sparePartsAdvancedResult" class="mt-4"></div>
        </div>
    `;
    
    window.showSparePartsAdvancedReport = () => {
        const stationId = document.getElementById('spareAdvancedStation').value;
        const fromDate = document.getElementById('spareAdvancedFrom').value;
        const toDate = document.getElementById('spareAdvancedTo').value;
        const searchTerm = document.getElementById('spareAdvancedSearch').value.toLowerCase();
        
        let filtered = faultsWithParts;
        if (stationId) filtered = filtered.filter(f => f.stationId == stationId);
        if (fromDate) filtered = filtered.filter(f => f.date >= fromDate);
        if (toDate) filtered = filtered.filter(f => f.date <= toDate);
        if (searchTerm) filtered = filtered.filter(f => f.parts.toLowerCase().includes(searchTerm));
        
        filtered.sort((a,b) => b.date.localeCompare(a.date));
        
        const resultDiv = document.getElementById('sparePartsAdvancedResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد قطع غيار مطابقة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead class="table-primary">
                <tr><th>التاريخ</th><th>المحطة</th><th>الأصل المعطل</th><th>قطع الغيار المستخدمة</th><th>نوع العطل</th><th>إجراءات الإصلاح</th></tr>
            </thead>
            <tbody>`;
        
        filtered.forEach(f => {
            const station = stations.find(s => s.id == f.stationId);
            html += `<tr>
                <td>${f.date}</td>
                <td>${station?.name || '-'}</td>
                <td>${f.assetName || '-'}</td>
                <td class="fw-bold text-primary">${f.parts}</td>
                <td>${f.type}</td>
                <td>${f.actions || '-'}</td>
            </tr>`;
        });
        
        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printSparePartsAdvancedReport = () => {
        const content = document.getElementById('sparePartsAdvancedResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير قطع الغيار</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right} th{background:#0d6efd;color:white}</style></head>
        <body><h2>تقرير قطع الغيار المستخدمة</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}
// ==================== تقرير متابعة أصل ====================
function loadReportAsset(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const dailyReports = JSON.parse(localStorage.getItem('dailyReports') || '[]');
    const faults = JSON.parse(localStorage.getItem('faults') || '[]');
    const openFaults = faults.filter(f => f.status === 'open');
    
    let stationOptions = '<option value="">اختر محطة</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>⚙️ تقرير متابعة أصل</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="assetReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>اختر الأصل</label><select id="assetReportSelect" class="form-control"><option value="">اختر المحطة أولاً</option></select></div>
                <div class="col-md-4 mb-2"><button class="btn btn-primary mt-4" onclick="showAssetFullReport()">عرض التقرير</button></div>
            </div>
            <div id="assetFullReport" class="mt-4"></div>
            <button id="printAssetBtn" class="btn btn-secondary mt-3" style="display:none" onclick="printAssetReport()">🖨️ طباعة</button>
        </div>
    `;
    
    document.getElementById('assetReportStation').addEventListener('change', function() {
        const stationId = this.value;
        const station = stations.find(s => s.id == stationId);
        const assetSelect = document.getElementById('assetReportSelect');
        if (!station) { 
            assetSelect.innerHTML = '<option value="">اختر المحطة أولاً</option>'; 
            return; 
        }
        
        const assets = [];
        if (station.mainPumps && station.mainPumps.length) {
            station.mainPumps.forEach((p,i) => {
                assets.push({ id: `main_${i}`, name: p['رقم/اسم الطلمبة'] || `طلمبة رئيسية ${i+1}` });
            });
        }
        if (station.drainPumps && station.drainPumps.length) {
            station.drainPumps.forEach((p,i) => {
                assets.push({ id: `drain_${i}`, name: p['رقم/اسم الطلمبة'] || `طلمبة نزح ${i+1}` });
            });
        }
        if (station.winches && station.winches.length) {
            station.winches.forEach((w,i) => {
                assets.push({ id: `winch_${i}`, name: w['رقم/اسم الونش'] || `ونش ${i+1}` });
            });
        }
        if (station.panels && station.panels.length) {
            station.panels.forEach((p,i) => {
                assets.push({ id: `panel_${i}`, name: p['رقم/اسم اللوحة'] || `لوحة ${i+1}` });
            });
        }
        if (station.fans && station.fans.length) {
            station.fans.forEach((f,i) => {
                assets.push({ id: `fan_${i}`, name: f['رقم/اسم المروحة'] || `مروحة ${i+1}` });
            });
        }
        if (station.sealPumps && station.sealPumps.length) {
            station.sealPumps.forEach((s,i) => {
                assets.push({ id: `seal_${i}`, name: s['رقم/اسم الطلمبة'] || `طلمبة حبس جلندات ${i+1}` });
            });
        }
        
        if (assets.length === 0) {
            assetSelect.innerHTML = '<option value="">لا توجد أصول مسجلة</option>';
        } else {
            assetSelect.innerHTML = '<option value="">اختر الأصل</option>' + assets.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
        }
    });
    
    window.showAssetFullReport = () => {
        const stationId = document.getElementById('assetReportStation').value;
        const assetId = document.getElementById('assetReportSelect').value;
        const assetName = document.getElementById('assetReportSelect').selectedOptions[0]?.text;
        
        if (!stationId) { alert('اختر محطة أولاً'); return; }
        if (!assetId) { alert('اختر الأصل أولاً'); return; }
        
        const station = stations.find(s => s.id == stationId);
        
        const lastDaily = dailyReports.filter(r => r.stationId == stationId).sort((a,b)=>b.date.localeCompare(a.date))[0];
        let assetStatus = '-', assetReason = '-', assetNotes = '', lastDate = '-';
        
        if (lastDaily && lastDaily.assets) {
            const assetDaily = lastDaily.assets.find(a => a.name === assetName);
            if (assetDaily) {
                assetStatus = assetDaily.status || '-';
                assetReason = assetDaily.reason || '-';
                assetNotes = assetDaily.notes || '';
                lastDate = lastDaily.date;
            }
        }
        
        const assetFaults = openFaults.filter(f => f.stationId == stationId && f.assetName === assetName);
        
        let html = `<h5 class="mb-3">تقرير متابعة الأصل: ${assetName}</h5>
                    <p><strong>المحطة:</strong> ${station?.name} (${station?.code})</p>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead class="table-primary">
                                运转<th>المصدر</th><th>الحالة</th><th>سبب التوقف</th><th>ملاحظات / تفاصيل</th>\\
                            </thead>
                            <tbody>
                                运转
                                    <td>آخر تقرير متابعة دورية<br><small class="text-muted">${lastDate}</small></td>
                                    <td><span class="badge ${assetStatus === 'يعمل' ? 'bg-success' : (assetStatus === 'لا يعمل' ? 'bg-danger' : 'bg-secondary')}">${assetStatus || '-'}</span></td>
                                    <td>${assetReason || '-'}</td>
                                    <td>${assetNotes || '-'}</td>
                                </tr>`;
        
        if (assetFaults.length) {
            assetFaults.forEach(f => {
                html += `<tr style="background-color:#fff3cd">
                             <td>بلاغ عطل مفتوح<br><small class="text-muted">${f.date}</small></td>
                             <td><span class="badge bg-danger">لا يعمل</span></td>
                             <td>${f.description || '-'}</td>
                             <td><strong>الإجراء:</strong> ${f.actions || '-'}<br><strong>قطع الغيار:</strong> ${f.parts || '-'}</td>
                          </tr>`;
            });
        } else {
            html += `<tr><td>بلاغات الأعطال</td><td colspan="3">لا توجد بلاغات مفتوحة لهذا الأصل</td></tr>`;
        }
        
        html += `</tbody> 格</div>`;
        
        document.getElementById('assetFullReport').innerHTML = html;
        document.getElementById('printAssetBtn').style.display = 'block';
    };
    
    window.printAssetReport = () => {
        const content = document.getElementById('assetFullReport').innerHTML;
        const assetName = document.getElementById('assetReportSelect').selectedOptions[0]?.text || 'الأصل';
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير متابعة أصل ${assetName}</title>
        <style>
            body{font-family:Tahoma;padding:20px;margin:0}
            table{border-collapse:collapse;width:100%;margin-bottom:20px}
            th,td{border:1px solid #ddd;padding:10px;text-align:right}
            th{background:#0d6efd;color:white}
            .badge{display:inline-block;padding:3px 8px;border-radius:12px;color:white}
            .bg-success{background:#28a745}
            .bg-danger{background:#dc3545}
            .bg-secondary{background:#6c757d}
            .text-muted{color:#6c757d}
        </style></head>
        <body><h2>تقرير متابعة أصل: ${assetName}</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== تقرير العاملين ====================
function loadReportEmployees(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const stationMap = {};
    stations.forEach(s => stationMap[s.id] = s.name);
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>👥 تقرير العاملين</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="empReportStationFilter" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>الوظيفة</label><select id="empReportRoleFilter" class="form-control"><option value="">الكل</option><option>مدير محطة</option><option>مهندس</option><option>فني</option><option>عامل</option></select></div>
                <div class="col-md-4 mb-2"><label>الحالة</label><select id="empReportStatusFilter" class="form-control"><option value="">الكل</option><option>يعمل</option><option>إجازة</option></select></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showEmployeesReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printEmployeesReport()">🖨️ طباعة</button>
            <div id="employeesReportResult" class="mt-4"></div>
        </div>
    `;
    
    window.showEmployeesReport = () => {
        const stationId = document.getElementById('empReportStationFilter').value;
        const role = document.getElementById('empReportRoleFilter').value;
        const status = document.getElementById('empReportStatusFilter').value;
        
        let filtered = employees;
        if (stationId) filtered = filtered.filter(e => e.stationId == stationId);
        if (role) filtered = filtered.filter(e => e.role == role);
        if (status) filtered = filtered.filter(e => e.status == status);
        
        const resultDiv = document.getElementById('employeesReportResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد بيانات مطابقة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead>运转<th>الكود</th><th>الاسم</th><th>المحطة</th><th>الوظيفة</th><th>الوردية</th><th>التليفون</th><th>الحالة</th> </thead>
            <tbody>`;
        filtered.forEach(e => {
            html += `运转
                <td>${e.code}</td>
                <td>${e.name}</td>
                <td>${stationMap[e.stationId] || '-'}</td>
                <td>${e.role}</td>
                <td>${e.shift || '-'}</td>
                <td>${e.phone || '-'}</td>
                <td>${e.status}</td>
             </tr>`;
        });
        html += `</tbody> 格</div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printEmployeesReport = () => {
        const content = document.getElementById('employeesReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير العاملين</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right}</style></head>
        <body><h2>تقرير العاملين</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== تقرير قطع الغيار ====================
function loadReportSpareParts(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const faults = JSON.parse(localStorage.getItem('faults') || '[]');
    const faultsWithParts = faults.filter(f => f.parts && f.parts.trim() !== '');
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>🔧 تقرير قطع الغيار المستخدمة</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="spareReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>من تاريخ</label><input type="date" id="spareFromDate" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>إلى تاريخ</label><input type="date" id="spareToDate" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showSparePartsReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printSparePartsReport()">🖨️ طباعة</button>
            <div id="sparePartsReportResult" class="mt-4"></div>
        </div>
    `;
    
    window.showSparePartsReport = () => {
        const stationId = document.getElementById('spareReportStation').value;
        const fromDate = document.getElementById('spareFromDate').value;
        const toDate = document.getElementById('spareToDate').value;
        
        let filtered = faultsWithParts;
        if (stationId) filtered = filtered.filter(f => f.stationId == stationId);
        if (fromDate) filtered = filtered.filter(f => f.date >= fromDate);
        if (toDate) filtered = filtered.filter(f => f.date <= toDate);
        
        const resultDiv = document.getElementById('sparePartsReportResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد قطع غيار مسجلة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead>运转<th>التاريخ</th><th>المحطة</th><th>الأصل المعطل</th><th>قطع الغيار المستخدمة</th><th>نوع العطل</th> </thead>
            <tbody>`;
        filtered.forEach(f => {
            const station = stations.find(s => s.id == f.stationId);
            html += `运转
                <td>${f.date}</td>
                <td>${station?.name || '-'}</td>
                <td>${f.assetName || '-'}</td>
                <td>${f.parts}</td>
                <td>${f.type}</td>
             </tr>`;
        });
        html += `</tbody> 格</div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printSparePartsReport = () => {
        const content = document.getElementById('sparePartsReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير قطع الغيار</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right}</style></head>
        <body><h2>تقرير قطع الغيار المستخدمة</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== الأرشيف ====================
function loadArchive(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    let stationOptions = '<option value="">اختر محطة</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>📁 أرشيف المستندات</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="archiveStationSelect" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><input type="file" id="archiveFileInput" class="form-control" accept="image/*,application/pdf"></div>
                <div class="col-md-4 mb-2"><button class="btn btn-primary" onclick="uploadArchiveFile()">📤 رفع ملف</button></div>
            </div>
            <div id="archiveFilesContainer" class="mt-4 row"></div>
        </div>
    `;
    
    function displayArchiveFiles() {
        const stationId = document.getElementById('archiveStationSelect').value;
        if (!stationId) {
            document.getElementById('archiveFilesContainer').innerHTML = '<div class="alert alert-info">اختر محطة لعرض ملفاتها</div>';
            return;
        }
        const archive = JSON.parse(localStorage.getItem('archive') || '{}');
        const files = archive[stationId] || [];
        const containerDiv = document.getElementById('archiveFilesContainer');
        containerDiv.innerHTML = '';
        if (files.length === 0) {
            containerDiv.innerHTML = '<div class="alert alert-info">لا توجد ملفات مرفوعة لهذه المحطة</div>';
            return;
        }
        files.forEach((file, idx) => {
            const col = document.createElement('div');
            col.className = 'col-md-3 mb-3';
            const isImage = file.type === 'image';
            col.innerHTML = `
                <div class="card">
                    ${isImage ? `<img src="${file.data}" class="card-img-top" alt="${file.name}" style="height:150px;object-fit:cover">` : `<div class="card-header bg-secondary text-white">📄 ${file.name}</div>`}
                    <div class="card-body">
                        <p class="card-text"><small>${new Date(file.date).toLocaleString('ar-EG')}</small></p>
                        <button class="btn btn-sm btn-info" onclick="viewArchiveFile('${stationId}', ${idx})">عرض</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteArchiveFile('${stationId}', ${idx})">حذف</button>
                    </div>
                </div>
            `;
            containerDiv.appendChild(col);
        });
    }
    
    window.uploadArchiveFile = () => {
        const stationId = document.getElementById('archiveStationSelect').value;
        const fileInput = document.getElementById('archiveFileInput');
        if (!stationId) { alert('اختر محطة أولاً'); return; }
        if (!fileInput.files.length) { alert('اختر ملف أولاً'); return; }
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            let archive = JSON.parse(localStorage.getItem('archive') || '{}');
            if (!archive[stationId]) archive[stationId] = [];
            archive[stationId].push({
                name: file.name,
                data: e.target.result,
                type: file.type.startsWith('image/') ? 'image' : 'file',
                date: new Date().toISOString()
            });
            localStorage.setItem('archive', JSON.stringify(archive));
            alert('تم رفع الملف بنجاح');
            fileInput.value = '';
            displayArchiveFiles();
        };
        reader.readAsDataURL(file);
    };
    
    window.viewArchiveFile = (stationId, index) => {
        const archive = JSON.parse(localStorage.getItem('archive') || '{}');
        const file = archive[stationId]?.[index];
        if (file) {
            const win = window.open('', '_blank');
            win.document.write(`<html dir="rtl"><head><title>${file.name}</title></head><body style="text-align:center">`);
            if (file.type === 'image') {
                win.document.write(`<img src="${file.data}" style="max-width:100%;max-height:90vh">`);
            } else {
                win.document.write(`<iframe src="${file.data}" style="width:100%;height:90vh" frameborder="0"></iframe>`);
            }
            win.document.write(`</body></html>`);
            win.document.close();
        }
    };
    
    window.deleteArchiveFile = (stationId, index) => {
        if (confirm('هل تريد حذف هذا الملف؟')) {
            let archive = JSON.parse(localStorage.getItem('archive') || '{}');
            if (archive[stationId]) {
                archive[stationId].splice(index, 1);
                if (archive[stationId].length === 0) delete archive[stationId];
                localStorage.setItem('archive', JSON.stringify(archive));
                displayArchiveFiles();
                alert('تم حذف الملف');
            }
        }
    };
    
    document.getElementById('archiveStationSelect').addEventListener('change', displayArchiveFiles);
    displayArchiveFiles();
}

// ==================== إدارة المستخدمين ====================
function loadUsers(container) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    container.innerHTML = `
        <div class="form-card">
            <h4>⚙️ إدارة المستخدمين والصلاحيات</h4>
            <form id="userForm">
                <div class="row">
                    <div class="col-md-3 mb-2"><input type="text" id="userCode" class="form-control" placeholder="كود المستخدم" required></div>
                    <div class="col-md-3 mb-2"><input type="text" id="userName" class="form-control" placeholder="الاسم" required></div>
                    <div class="col-md-3 mb-2"><input type="password" id="userPass" class="form-control" placeholder="كلمة المرور" required></div>
                    <div class="col-md-3 mb-2"><select id="userRole" class="form-control">
                        <option>مدير (كل الصلاحيات)</option>
                        <option>مدير محدود (صلاحيات محددة لكل المواقع)</option>
                        <option>مدير موقع (صلاحيات محددة لموقع واحد)</option>
                    </select></div>
                </div>
                <button type="submit" class="btn btn-primary mt-2">➕ إضافة مستخدم</button>
            </form>
        </div>
        <div class="table-responsive mt-4"><table class="table table-bordered">
            <thead>运转<th>الكود</th><th>الاسم</th><th>الصلاحية</th><th>تاريخ الإضافة</th><th></th> </thead>
            <tbody id="usersTableBody"></tbody>
         </div>
    `;
    
    function renderUsersTable() {
        const usersList = JSON.parse(localStorage.getItem('users') || '[]');
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        usersList.forEach(u => {
            const row = tbody.insertRow();
            row.insertCell(0).innerText = u.username;
            row.insertCell(1).innerText = u.name;
            row.insertCell(2).innerText = u.role;
            row.insertCell(3).innerText = u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '-';
            const delCell = row.insertCell(4);
            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-sm btn-danger';
            delBtn.innerHTML = '<i class="fas fa-trash"></i> حذف';
            delBtn.onclick = () => {
                if (u.username === 'admin') {
                    alert('لا يمكن حذف المستخدم admin');
                    return;
                }
                if (confirm(`حذف المستخدم ${u.name}؟`)) {
                    const updated = usersList.filter(us => us.username !== u.username);
                    localStorage.setItem('users', JSON.stringify(updated));
                    renderUsersTable();
                }
            };
            delCell.appendChild(delBtn);
        });
    }
    
    document.getElementById('userForm').onsubmit = function(e) {
        e.preventDefault();
        let usersList = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
            id: Date.now(),
            username: document.getElementById('userCode').value,
            name: document.getElementById('userName').value,
            password: document.getElementById('userPass').value,
            role: document.getElementById('userRole').value,
            createdAt: new Date().toISOString()
        };
        if (usersList.find(u => u.username === newUser.username)) {
            alert('كود المستخدم موجود مسبقاً');
            return;
        }
        usersList.push(newUser);
        localStorage.setItem('users', JSON.stringify(usersList));
        alert('تم إضافة المستخدم بنجاح');
        document.getElementById('userForm').reset();
        renderUsersTable();
    };
    
    renderUsersTable();
}

// ==================== تقرير المياه المرفوعة ====================
function loadReportWaterPumped(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const monthlyCosts = JSON.parse(localStorage.getItem('monthlyCosts') || '[]');
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>💧 تقرير المياه المرفوعة</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="waterReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>من شهر</label><input type="month" id="waterFromMonth" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>إلى شهر</label><input type="month" id="waterToMonth" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showWaterPumpedReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printWaterPumpedReport()">🖨️ طباعة</button>
            <div id="waterPumpedReportResult" class="mt-4"></div>
        </div>
    `;
    
    window.showWaterPumpedReport = () => {
        const stationId = document.getElementById('waterReportStation').value;
        const fromMonth = document.getElementById('waterFromMonth').value;
        const toMonth = document.getElementById('waterToMonth').value;
        
        let filtered = monthlyCosts;
        if (stationId) filtered = filtered.filter(c => c.stationId == stationId);
        if (fromMonth) filtered = filtered.filter(c => c.month >= fromMonth);
        if (toMonth) filtered = filtered.filter(c => c.month <= toMonth);
        
        filtered.sort((a,b) => a.month.localeCompare(b.month));
        
        const resultDiv = document.getElementById('waterPumpedReportResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد بيانات في المدة المحددة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead class="table-primary">
                运转<th>الشهر</th><th>المحطة</th><th>ساعات التشغيل</th><th>التصرف (m³/h)</th><th>المياه المرفوعة (m³)</th>\\
            </thead>
            <tbody>`;
        
        let totalWater = 0;
        filtered.forEach(c => {
            const station = stations.find(s => s.id == c.stationId);
            totalWater += (c.waterPumped || 0);
            html += `运转
                <td>${c.month}</td>
                <td>${station?.name || '-'}</td>
                <td>${c.operatingHours || 0}</td>
                <td>${c.pumpFlow || 0}</td>
                <td><strong>${(c.waterPumped || 0).toLocaleString()} m³</strong></td>
             </tr>`;
        });
        
        html += `<tr class="table-secondary fw-bold">
            <td colspan="4" class="text-center">الإجمالي</td>
            <td>${totalWater.toLocaleString()} m³</td>
         </tr>`;
        html += `</tbody> 格</div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printWaterPumpedReport = () => {
        const content = document.getElementById('waterPumpedReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير المياه المرفوعة</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right} th{background:#0d6efd;color:white}</style></head>
        <body><h2>تقرير المياه المرفوعة</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== تقرير استهلاك الكهرباء ====================
function loadReportElectricity(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const monthlyCosts = JSON.parse(localStorage.getItem('monthlyCosts') || '[]');
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>⚡ تقرير استهلاك الكهرباء</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="elecReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>المحول</label><select id="elecReportTransformer" class="form-control"><option value="">كل المحولات</option></select></div>
                <div class="col-md-4 mb-2"><label>من شهر</label><input type="month" id="elecFromMonth" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>إلى شهر</label><input type="month" id="elecToMonth" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showElectricityReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printElectricityReport()">🖨️ طباعة</button>
            <div id="electricityReportResult" class="mt-4"></div>
        </div>
    `;
    
    document.getElementById('elecReportStation').addEventListener('change', function() {
        const stationId = this.value;
        const transformerSelect = document.getElementById('elecReportTransformer');
        if (!stationId) {
            transformerSelect.innerHTML = '<option value="">كل المحولات</option>';
            return;
        }
        const station = stations.find(s => s.id == stationId);
        if (station && station.powerSources) {
            const transformers = station.powerSources.filter(ps => ps['النوع'] === 'محول');
            if (transformers.length) {
                transformerSelect.innerHTML = '<option value="">كل المحولات</option>' + 
                    transformers.map((t, idx) => `<option value="${idx}">${t['رقم/اسم المصدر'] || `محول ${idx+1}`}</option>`).join('');
            } else {
                transformerSelect.innerHTML = '<option value="">لا توجد محولات</option>';
            }
        } else {
            transformerSelect.innerHTML = '<option value="">لا توجد محولات</option>';
        }
    });
    
    window.showElectricityReport = () => {
        const stationId = document.getElementById('elecReportStation').value;
        const transformerIdx = document.getElementById('elecReportTransformer').value;
        const fromMonth = document.getElementById('elecFromMonth').value;
        const toMonth = document.getElementById('elecToMonth').value;
        
        let filtered = monthlyCosts;
        if (stationId) filtered = filtered.filter(c => c.stationId == stationId);
        if (fromMonth) filtered = filtered.filter(c => c.month >= fromMonth);
        if (toMonth) filtered = filtered.filter(c => c.month <= toMonth);
        filtered.sort((a,b) => a.month.localeCompare(b.month));
        
        const resultDiv = document.getElementById('electricityReportResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد بيانات في المدة المحددة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead class="table-primary">
                运转<th>الشهر</th><th>المحطة</th><th>المحول</th><th>الاستهلاك (kWh)</th><th>التكلفة (جنيه)</th>\\
            </thead>
            <tbody>`;
        
        let totalKwh = 0, totalCost = 0;
        
        filtered.forEach(c => {
            const station = stations.find(s => s.id == c.stationId);
            if (c.transformers && c.transformers.length) {
                c.transformers.forEach((t, idx) => {
                    if (transformerIdx !== '' && transformerIdx != idx) return;
                    const transformerName = (station?.powerSources?.[idx]?.['رقم/اسم المصدر']) || `محول ${idx+1}`;
                    totalKwh += (t.diff || 0);
                    totalCost += (t.cost || 0);
                    html += `运转
                        日起${c.month}起
                        日起${station?.name || '-'}起
                        日起${transformerName}起
                        日起${(t.diff || 0).toLocaleString()}起
                        日起${(t.cost || 0).toLocaleString()}起
                     \)`;
                });
            }
        });
        
        if (html === `运转<td colspan="5" class="text-center">لا توجد بيانات\)`) {
            html = `运转<td colspan="5" class="text-center">لا توجد بيانات للمحول المحدد\)`;
        }
        
        html += `<tr class="table-secondary fw-bold">
            <td colspan="3" class="text-center">الإجمالي</td>
            <td>${totalKwh.toLocaleString()} kWh</td>
            <td>${totalCost.toLocaleString()} جنيه</td>
         </tr>`;
        html += `</tbody> </table></div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printElectricityReport = () => {
        const content = document.getElementById('electricityReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير استهلاك الكهرباء</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right} th{background:#0d6efd;color:white}</style></head>
        <body><h2>تقرير استهلاك الكهرباء</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== تقرير استهلاك المياه ====================
function loadReportWaterConsumption(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const monthlyCosts = JSON.parse(localStorage.getItem('monthlyCosts') || '[]');
    const tariffs = JSON.parse(localStorage.getItem('tariffs') || '{"water":3.5}');
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>💧 تقرير استهلاك المياه (عدادات)</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="waterConsumptionStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>من شهر</label><input type="month" id="waterConsumptionFrom" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>إلى شهر</label><input type="month" id="waterConsumptionTo" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showWaterConsumptionReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printWaterConsumptionReport()">🖨️ طباعة</button>
            <div id="waterConsumptionResult" class="mt-4"></div>
        </div>
    `;
    
    window.showWaterConsumptionReport = () => {
        const stationId = document.getElementById('waterConsumptionStation').value;
        const fromMonth = document.getElementById('waterConsumptionFrom').value;
        const toMonth = document.getElementById('waterConsumptionTo').value;
        
        let filtered = monthlyCosts;
        if (stationId) filtered = filtered.filter(c => c.stationId == stationId);
        if (fromMonth) filtered = filtered.filter(c => c.month >= fromMonth);
        if (toMonth) filtered = filtered.filter(c => c.month <= toMonth);
        filtered.sort((a,b) => a.month.localeCompare(b.month));
        
        const resultDiv = document.getElementById('waterConsumptionResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد بيانات في المدة المحددة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead class="table-primary">
                运转<th>الشهر</th><th>المحطة</th><th>الاستهلاك (m³)</th><th>التكلفة (جنيه)</th>\\
            </thead>
            <tbody>`;
        
        let totalConsumed = 0, totalCost = 0;
        filtered.forEach(c => {
            const station = stations.find(s => s.id == c.stationId);
            const consumed = c.water?.consumed || 0;
            const cost = c.water?.cost || 0;
            totalConsumed += consumed;
            totalCost += cost;
            html += `运转
                日起${c.month}起
                日起${station?.name || '-'}起
                日起${consumed.toLocaleString()} m³起
                日起${cost.toLocaleString()} جنيه起
             \)`;
        });
        
        html += `<tr class="table-secondary fw-bold">
            <td colspan="2" class="text-center">الإجمالي</td>
            <td>${totalConsumed.toLocaleString()} m³</td>
            <td>${totalCost.toLocaleString()} جنيه</td>
         </tr>`;
        html += `</tbody> </table></div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printWaterConsumptionReport = () => {
        const content = document.getElementById('waterConsumptionResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير استهلاك المياه</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right} th{background:#0d6efd;color:white}</style></head>
        <body><h2>تقرير استهلاك المياه</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== تقرير استهلاك سولار ====================
function loadReportDiesel(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const monthlyCosts = JSON.parse(localStorage.getItem('monthlyCosts') || '[]');
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>🛢️ تقرير استهلاك السولار</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="dieselReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>المولد</label><select id="dieselReportGenerator" class="form-control"><option value="">كل المولدات</option></select></div>
                <div class="col-md-4 mb-2"><label>من شهر</label><input type="month" id="dieselFromMonth" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>إلى شهر</label><input type="month" id="dieselToMonth" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showDieselReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printDieselReport()">🖨️ طباعة</button>
            <div id="dieselReportResult" class="mt-4"></div>
        </div>
    `;
    
    document.getElementById('dieselReportStation').addEventListener('change', function() {
        const stationId = this.value;
        const generatorSelect = document.getElementById('dieselReportGenerator');
        if (!stationId) {
            generatorSelect.innerHTML = '<option value="">كل المولدات</option>';
            return;
        }
        const station = stations.find(s => s.id == stationId);
        if (station && station.powerSources) {
            const generators = station.powerSources.filter(ps => ps['النوع'] === 'مولد');
            if (generators.length) {
                generatorSelect.innerHTML = '<option value="">كل المولدات</option>' + 
                    generators.map((g, idx) => `<option value="${idx}">${g['رقم/اسم المصدر'] || `مولد ${idx+1}`}</option>`).join('');
            } else {
                generatorSelect.innerHTML = '<option value="">لا توجد مولدات</option>';
            }
        } else {
            generatorSelect.innerHTML = '<option value="">لا توجد مولدات</option>';
        }
    });
    
    window.showDieselReport = () => {
        const stationId = document.getElementById('dieselReportStation').value;
        const generatorIdx = document.getElementById('dieselReportGenerator').value;
        const fromMonth = document.getElementById('dieselFromMonth').value;
        const toMonth = document.getElementById('dieselToMonth').value;
        
        let filtered = monthlyCosts;
        if (stationId) filtered = filtered.filter(c => c.stationId == stationId);
        if (fromMonth) filtered = filtered.filter(c => c.month >= fromMonth);
        if (toMonth) filtered = filtered.filter(c => c.month <= toMonth);
        filtered.sort((a,b) => a.month.localeCompare(b.month));
        
        const resultDiv = document.getElementById('dieselReportResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد بيانات في المدة المحددة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead class="table-primary">
                运转<th>الشهر</th><th>المحطة</th><th>المولد</th><th>الاستهلاك (لتر)</th><th>الرصيد المتبقي (لتر)</th>\\
            </thead>
            <tbody>`;
        
        let totalConsumed = 0;
        
        filtered.forEach(c => {
            const station = stations.find(s => s.id == c.stationId);
            if (c.generators && c.generators.length) {
                c.generators.forEach((g, idx) => {
                    if (generatorIdx !== '' && generatorIdx != idx) return;
                    const generatorName = (station?.powerSources?.[idx]?.['رقم/اسم المصدر']) || `مولد ${idx+1}`;
                    totalConsumed += (g.consumed || 0);
                    html += `运转
                        日起${c.month}起
                        日起${station?.name || '-'}起
                        日起${generatorName}起
                        日起${(g.consumed || 0).toLocaleString()} لتر起
                        日起${(g.balance || 0).toLocaleString()} لتر起
                     \)`;
                });
            }
        });
        
        html += `<tr class="table-secondary fw-bold">
            <td colspan="3" class="text-center">إجمالي الاستهلاك</td>
            <td>${totalConsumed.toLocaleString()} لتر</td>
            <td>-</td>
         </tr>`;
        html += `</tbody> </table></div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printDieselReport = () => {
        const content = document.getElementById('dieselReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير استهلاك السولار</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right} th{background:#0d6efd;color:white}</style></head>
        <body><h2>تقرير استهلاك السولار</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== تقرير قطع الغيار المتقدم ====================
function loadReportSparePartsAdvanced(container) {
    const stations = JSON.parse(localStorage.getItem('stations') || '[]');
    const faults = JSON.parse(localStorage.getItem('faults') || '[]');
    const faultsWithParts = faults.filter(f => f.parts && f.parts.trim() !== '');
    
    let stationOptions = '<option value="">كل المحطات</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    
    container.innerHTML = `
        <div class="form-card">
            <h4>🔧 تقرير قطع الغيار المستخدمة</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>المحطة</label><select id="spareAdvancedStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>من تاريخ</label><input type="date" id="spareAdvancedFrom" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>إلى تاريخ</label><input type="date" id="spareAdvancedTo" class="form-control"></div>
                <div class="col-md-12 mb-2"><label>بحث في قطع الغيار</label><input type="text" id="spareAdvancedSearch" class="form-control" placeholder="اكتب اسم قطعة الغيار..."></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showSparePartsAdvancedReport()">عرض</button>
            <button class="btn btn-secondary mt-2" onclick="printSparePartsAdvancedReport()">🖨️ طباعة</button>
            <div id="sparePartsAdvancedResult" class="mt-4"></div>
        </div>
    `;
    
    window.showSparePartsAdvancedReport = () => {
        const stationId = document.getElementById('spareAdvancedStation').value;
        const fromDate = document.getElementById('spareAdvancedFrom').value;
        const toDate = document.getElementById('spareAdvancedTo').value;
        const searchTerm = document.getElementById('spareAdvancedSearch').value.toLowerCase();
        
        let filtered = faultsWithParts;
        if (stationId) filtered = filtered.filter(f => f.stationId == stationId);
        if (fromDate) filtered = filtered.filter(f => f.date >= fromDate);
        if (toDate) filtered = filtered.filter(f => f.date <= toDate);
        if (searchTerm) filtered = filtered.filter(f => f.parts.toLowerCase().includes(searchTerm));
        
        filtered.sort((a,b) => b.date.localeCompare(a.date));
        
        const resultDiv = document.getElementById('sparePartsAdvancedResult');
        if (filtered.length === 0) {
            resultDiv.innerHTML = '<div class="alert alert-info">لا توجد قطع غيار مطابقة</div>';
            return;
        }
        
        let html = `<div class="table-responsive"><table class="table table-bordered">
            <thead class="table-primary">
                运转<th>التاريخ</th><th>المحطة</th><th>الأصل المعطل</th><th>قطع الغيار المستخدمة</th><th>نوع العطل</th><th>إجراءات الإصلاح</th>\\
            </thead>
            <tbody>`;
        
        filtered.forEach(f => {
            const station = stations.find(s => s.id == f.stationId);
            html += `运转
                日起${f.date}起
                日起${station?.name || '-'}起
                日起${f.assetName || '-'}起
                <td class="fw-bold text-primary">${f.parts}</td>
                日起${f.type}起
                日起${f.actions || '-'}起
             \)`;
        });
        
        html += `</tbody> </table></div>`;
        resultDiv.innerHTML = html;
    };
    
    window.printSparePartsAdvancedReport = () => {
        const content = document.getElementById('sparePartsAdvancedResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>تقرير قطع الغيار</title>
        <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:right} th{background:#0d6efd;color:white}</style></head>
        <body><h2>تقرير قطع الغيار المستخدمة</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

// ==================== إنهاء الملف ====================
window.loadPage = loadPage;
window.logout = logout;

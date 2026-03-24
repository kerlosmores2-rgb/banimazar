// ==================== إعدادات Supabase ====================
const SUPABASE_URL = 'https://pbzpumetrmirnsshjdoe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_O9BKPIjk5xXvbGNjvsBXVw_9V_TIoUu';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabaseClient = supabaseClient;
// ==================== إعدادات Supabase ====================
if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded');
} else {
    const SUPABASE_URL = 'https://pbzpumetrmirnsshjdoe.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_O9BKPIjk5xXvbGNjvsBXVw_9V_TIoUu';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.supabaseClient = supabaseClient;
    console.log('✅ Supabase initialized');
}
// ==================== ???? ?????? ??? Supabase ====================
async function apiCall(table, action, data = null, id = null) {
    try {
        if (action === 'select') {
            const { data: result, error } = await window.supabaseClient
                .from(table)
                .select('*')
                .order('id', { ascending: false });
            if (error) throw error;
            return result || [];
        }
        if (action === 'insert') {
            const { data: result, error } = await window.supabaseClient
                .from(table)
                .insert([data])
                .select();
            if (error) throw error;
            return result[0];
        }
        if (action === 'update') {
            const { data: result, error } = await window.supabaseClient
                .from(table)
                .update(data)
                .eq('id', id)
                .select();
            if (error) throw error;
            return result[0];
        }
        if (action === 'delete') {
            const { error } = await window.supabaseClient
                .from(table)
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        }
    } catch (err) {
        console.error(`??? ?? apiCall (${table}, ${action}):`, err);
        throw err;
    }
}

// ==================== ?????? ?? ?????? ====================
function checkAuth() {
    if (!localStorage.getItem('loggedUser')) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('loggedUser');
    localStorage.removeItem('loginTime');
    window.location.href = 'index.html';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('loggedUser') || '{}');
}

// ==================== ?????? ???????? ====================
async function loadHome(container) {
    const stations = await apiCall('stations', 'select');
    const employees = await apiCall('employees', 'select');
    const faults = await apiCall('faults', 'select');
    const openFaults = faults.filter(f => f.status === 'open').length;

    container.innerHTML = `
        <div class="row">
            <div class="col-md-4"><div class="stats-card"><i class="fas fa-water"></i><h3>${stations.length}</h3><p>??? ???????</p></div></div>
            <div class="col-md-4"><div class="stats-card"><i class="fas fa-users"></i><h3>${employees.length}</h3><p>??? ????????</p></div></div>
            <div class="col-md-4"><div class="stats-card"><i class="fas fa-exclamation-triangle"></i><h3>${openFaults}</h3><p>????? ??????</p></div></div>
        </div>
        <div class="form-card"><h4>?????? ??</h4><p>???? ????? ????? ??? ????? ????? - ??? ????</p><small>??? ?????: ${new Date().toLocaleDateString('ar-EG')}</small></div>
    `;
}

// ==================== ???? ????? ?????? (HTML) ====================
function getPowerSourceHTML() {
    return `<div class="row">
        <div class="col-md-3"><input type="text" class="form-control" placeholder="???/??? ??????"></div>
        <div class="col-md-3"><select class="form-select source-type" onchange="toggleSourceFields(this)"><option>????</option><option>????</option></select></div>
        <div class="col-md-6 transformer-fields"><input type="text" class="form-control" placeholder="??? ?????? (V)"></div>
        <div class="col-md-6 transformer-fields"><input type="text" class="form-control" placeholder="??? ?????? (V)"></div>
        <div class="col-md-6 transformer-fields"><input type="text" class="form-control" placeholder="?????? (kVA)"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="??? ??????"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="???? ?????? (HP/kW)"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="???? ????????? ??? ????? (???/?)"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="???? ????????? ???? ??? (???/?)"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="??? ??????"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="???? ?????? (kVA)"></div>
        <div class="col-md-6 generator-fields" style="display:none"><input type="text" class="form-control" placeholder="???? ?????? (kW)"></div>
    </div>`;
}

function getMainPumpHTML() {
    return `<div class="row">
        <div class="col-md-3"><input type="text" class="form-control" placeholder="???/??? ???????"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="??? ?????? (????/?????)"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="???????"></div>
        <div class="col-md-3"><input type="number" class="form-control" placeholder="?????? m³/h"></div>
        <div class="col-md-3"><input type="number" class="form-control" placeholder="????? m"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="???? ?????/?????"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="???? ?????/?????"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="???? ??? ????"></div>
    </div>`;
}

function getDrainPumpHTML() {
    return `<div class="row">
        <div class="col-md-3"><input type="text" class="form-control" placeholder="???/??? ???????"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="?????"></div>
        <div class="col-md-3"><input type="number" class="form-control" placeholder="?????? m³/h"></div>
        <div class="col-md-3"><input type="number" class="form-control" placeholder="????? m"></div>
        <div class="col-md-3"><input type="number" class="form-control" placeholder="???? ?????? kW"></div>
    </div>`;
}

function getWinchHTML() {
    return `<div class="row">
        <div class="col-md-3"><input type="text" class="form-control" placeholder="???/??? ?????"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="??? ?????"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="?????? (??)"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="??? ??????? V"></div>
        <div class="col-md-3"><input type="number" class="form-control" placeholder="???? ?????? kW"></div>
    </div>`;
}

function getPanelHTML() {
    return `<div class="row">
        <div class="col-md-3"><input type="text" class="form-control" placeholder="???/??? ??????"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="??? ??????"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="??? ??????"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="????? ??????"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="???? ???????"></div>
        <div class="col-md-3"><input type="text" class="form-control" placeholder="??? ??????? V"></div>
        <div class="col-md-6"><input type="text" class="form-control" placeholder="??? ??????"></div>
    </div>`;
}

function getBuildingHTML() {
    return `<div class="row">
        <div class="col-md-6"><input type="text" class="form-control" placeholder="???/??? ??????"></div>
        <div class="col-md-6"><input type="text" class="form-control" placeholder="??? ??????"></div>
    </div>`;
}

function getSealPumpHTML() {
    return `<div class="row">
        <div class="col-md-4"><input type="text" class="form-control" placeholder="???/??? ???????"></div>
        <div class="col-md-4"><input type="text" class="form-control" placeholder="??? ????? ??? ??????"></div>
        <div class="col-md-4"><input type="number" class="form-control" placeholder="???? ???????"></div>
        <div class="col-md-4"><input type="number" class="form-control" placeholder="???? ?????? kW"></div>
    </div>`;
}

function getFanHTML() {
    return `<div class="row">
        <div class="col-md-4"><input type="text" class="form-control" placeholder="???/??? ???????"></div>
        <div class="col-md-4"><input type="text" class="form-control" placeholder="??? ???????"></div>
        <div class="col-md-4"><select class="form-select"><option>????</option><option>?? ????</option></select></div>
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
    removeBtn.innerHTML = '???';
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
            else if (input.className.includes('source-type')) data['?????'] = input.value;
            else data[input.id || 'field'] = input.value;
        });
        items.push(data);
    });
    return items;
}

window.toggleSourceFields = function(select) {
    const div = select.closest('.border');
    if (!div) return;
    const isGenerator = select.value === '????';
    div.querySelectorAll('.transformer-fields').forEach(el => el.style.display = isGenerator ? 'none' : '');
    div.querySelectorAll('.generator-fields').forEach(el => el.style.display = isGenerator ? '' : 'none');
};

// ==================== ????? ???? ====================
async function loadAddStation(container) {
    const stations = await apiCall('stations', 'select');
    let outfallOptions = '<option value="">????</option>';
    stations.forEach(s => { outfallOptions += `<option value="${s.name}">${s.name}</option>`; });

    container.innerHTML = `
        <div class="form-card">
            <h4>? ????? ???? ?????</h4>
            <form id="stationForm">
                <div class="row">
                    <div class="col-md-6 mb-3"><label>??? ??????</label><input type="text" id="stationName" class="form-control" required></div>
                    <div class="col-md-6 mb-3"><label>??? ??????</label><input type="text" id="stationCode" class="form-control" required></div>
                    <div class="col-md-4 mb-3"><label>?????</label><select id="stationType" class="form-control"><option>??????</option><option>?????</option><option>??????</option></select></div>
                    <div class="col-md-4 mb-3"><label>?????</label><select id="outfall" class="form-control">${outfallOptions}</select></div>
                    <div class="col-md-4 mb-3"><label>?????? (m³/h)</label><input type="number" id="capacity" class="form-control"></div>
                    <div class="col-md-12 mb-3"><label>?????? ????????</label><input type="text" id="location" class="form-control" placeholder="???????? ?? ?????"></div>
                </div>
                <div class="mt-3"><h5>????? ???????</h5><div id="powerSources"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addPowerSource()">+ ????? ????</button></div>
                <div class="mt-3"><h5>??????? ???????? (??????)</h5><div id="mainPumps"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addMainPump()">+ ????? ?????</button></div>
                <div class="mt-3"><h5>?????? ???</h5><div id="drainPumps"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addDrainPump()">+ ????? ????? ???</button></div>
                <div class="mt-3"><h5>?????</h5><div id="winches"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addWinch()">+ ????? ???</button></div>
                <div class="mt-3"><h5>????? ????????</h5><div id="panels"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addPanel()">+ ????? ????</button></div>
                <div class="mt-3"><h5>?????</h5><div id="buildings"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addBuilding()">+ ????? ????</button></div>
                <div class="mt-3"><h5>?????? ??? ??????</h5><div id="sealPumps"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addSealPump()">+ ????? ????? ??? ??????</button></div>
                <div class="mt-3"><h5>????? ?????</h5><div id="fans"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addFan()">+ ????? ?????</button></div>
                <button type="submit" class="btn btn-primary mt-4">?? ??? ??????</button>
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

    document.getElementById('stationForm').onsubmit = async function(e) {
        e.preventDefault();
        const newStation = {
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
        };
        try {
            await apiCall('stations', 'insert', newStation);
            alert('?? ??? ?????? ?????');
            loadPage('listStations');
        } catch (err) {
            alert('???: ' + err.message);
        }
    };
}

// ==================== ????? ??????? ====================
async function loadListStations(container) {
    const stations = await apiCall('stations', 'select');
    if (stations.length === 0) {
        container.innerHTML = '<div class="alert alert-info">?? ???? ????? ?????</div>';
        return;
    }
    let html = `<div class="search-bar"><input type="text" id="searchInput" class="form-control" placeholder="???..."></div>
                <div class="table-responsive"><table class="table table-bordered"><thead>??<th>?????</th><th>?????</th><th>?????</th><th>?????</th><th></th> </thead><tbody id="stationsTable">`;
    stations.forEach(s => {
        html += `??
            <td>${s.code}</td>
            <td>${s.name}</td>
            <td>${s.type}</td>
            <td>${s.outfall || '-'}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editStation(${s.id})">?? ?????</button>
                <button class="btn btn-sm btn-danger" onclick="deleteStationNow(${s.id})">??? ???</button>
                <button class="btn btn-sm btn-info" onclick="viewStation(${s.id})">???</button>
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
    window.deleteStationNow = async (id) => {
        if (confirm('?? ???? ??? ??? ?????? ????? ?????????')) {
            try {
                await apiCall('stations', 'delete', null, id);
                alert('?? ??? ??????');
                loadPage('listStations');
            } catch (err) { alert('???: ' + err.message); }
        }
    };
    window.viewStation = (id) => {
        const station = stations.find(s => s.id === id);
        container.innerHTML = `<div class="form-card"><h4>${station.name} (${station.code})</h4><pre>${JSON.stringify(station, null, 2)}</pre>
                               <button class="btn btn-secondary" onclick="loadPage('listStations')">????</button></div>`;
    };
}

// ==================== ????? ?????? ====================
async function loadEditStation(container, stationId) {
    const stations = await apiCall('stations', 'select');
    const station = stations.find(s => s.id == stationId);
    if (!station) return;

    let outfallOptions = '<option value="">????</option>';
    stations.forEach(s => { outfallOptions += `<option value="${s.name}" ${station.outfall == s.name ? 'selected' : ''}>${s.name}</option>`; });

    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ??????: ${station.name}</h4>
            <form id="editStationForm">
                <div class="row">
                    <div class="col-md-6 mb-3"><label>??? ??????</label><input type="text" id="stationName" class="form-control" value="${station.name}" required></div>
                    <div class="col-md-6 mb-3"><label>??? ??????</label><input type="text" id="stationCode" class="form-control" value="${station.code}" required></div>
                    <div class="col-md-4 mb-3"><label>?????</label><select id="stationType" class="form-control">
                        <option ${station.type == '??????' ? 'selected' : ''}>??????</option>
                        <option ${station.type == '?????' ? 'selected' : ''}>?????</option>
                        <option ${station.type == '??????' ? 'selected' : ''}>??????</option>
                    </select></div>
                    <div class="col-md-4 mb-3"><label>?????</label><select id="outfall" class="form-control">${outfallOptions}</select></div>
                    <div class="col-md-4 mb-3"><label>?????? (m³/h)</label><input type="number" id="capacity" class="form-control" value="${station.capacity || ''}"></div>
                    <div class="col-md-12 mb-3"><label>?????? ????????</label><input type="text" id="location" class="form-control" value="${station.location || ''}"></div>
                </div>
                <div class="mt-3"><h5>????? ???????</h5><div id="powerSourcesEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditPowerSource()">+ ????? ????</button></div>
                <div class="mt-3"><h5>??????? ???????? (??????)</h5><div id="mainPumpsEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditMainPump()">+ ????? ?????</button></div>
                <div class="mt-3"><h5>?????? ???</h5><div id="drainPumpsEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditDrainPump()">+ ????? ????? ???</button></div>
                <div class="mt-3"><h5>?????</h5><div id="winchesEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditWinch()">+ ????? ???</button></div>
                <div class="mt-3"><h5>????? ????????</h5><div id="panelsEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditPanel()">+ ????? ????</button></div>
                <div class="mt-3"><h5>?????</h5><div id="buildingsEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditBuilding()">+ ????? ????</button></div>
                <div class="mt-3"><h5>?????? ??? ??????</h5><div id="sealPumpsEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditSealPump()">+ ????? ????? ??? ??????</button></div>
                <div class="mt-3"><h5>????? ?????</h5><div id="fansEdit"></div><button type="button" class="btn btn-sm btn-success mt-2" onclick="addEditFan()">+ ????? ?????</button></div>
                <div class="mt-4">
                    <button type="submit" class="btn btn-primary">?? ??? ?????????</button>
                    <button type="button" class="btn btn-secondary" onclick="loadPage('listStations')">????</button>
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
                removeBtn.innerHTML = '???';
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

    document.getElementById('editStationForm').onsubmit = async function(e) {
        e.preventDefault();
        const updatedStation = {
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
        try {
            await apiCall('stations', 'update', updatedStation, stationId);
            alert('?? ??? ?????????');
            loadPage('listStations');
        } catch (err) {
            alert('???: ' + err.message);
        }
    };
}

// ==================== ??????? ??????? ====================
async function loadAddEmployee(container) {
    const stations = await apiCall('stations', 'select');
    let stationOptions = '<option value="">???? ????</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });

    container.innerHTML = `
        <div class="form-card">
            <h4>? ????? ???? ????</h4>
            <form id="empForm">
                <div class="row">
                    <div class="col-md-3 mb-3"><label>?????</label><input type="text" id="empCode" class="form-control" required></div>
                    <div class="col-md-3 mb-3"><label>?????</label><input type="text" id="empName" class="form-control" required></div>
                    <div class="col-md-3 mb-3"><label>??????</label><select id="empStation" class="form-control">${stationOptions}</select></div>
                    <div class="col-md-3 mb-3"><label>???????</label><select id="empRole" class="form-control"><option>???? ????</option><option>?????</option><option>???</option><option>????</option></select></div>
                    <div class="col-md-3 mb-3"><label>???????</label><select id="empShift" class="form-control"><option>????</option><option>?????</option><option>?????</option></select></div>
                    <div class="col-md-3 mb-3"><label>????????</label><input type="text" id="empPhone" class="form-control"></div>
                    <div class="col-md-3 mb-3"><label>??????</label><select id="empStatus" class="form-control"><option>????</option><option>?????</option></select></div>
                </div>
                <button type="submit" class="btn btn-primary">???</button>
                <button type="button" class="btn btn-info" onclick="loadPage('listEmployees')">??? ????</button>
            </form>
        </div>
    `;

    document.getElementById('empForm').onsubmit = async function(e) {
        e.preventDefault();
        const newEmployee = {
            id: Date.now(),
            code: document.getElementById('empCode').value,
            name: document.getElementById('empName').value,
            stationId: document.getElementById('empStation').value,
            role: document.getElementById('empRole').value,
            shift: document.getElementById('empShift').value,
            phone: document.getElementById('empPhone').value,
            status: document.getElementById('empStatus').value
        };
        try {
            await apiCall('employees', 'insert', newEmployee);
            alert('?? ??? ??????');
            loadPage('listEmployees');
        } catch (err) {
            alert('???: ' + err.message);
        }
    };
}

async function loadListEmployees(container) {
    const employees = await apiCall('employees', 'select');
    const stations = await apiCall('stations', 'select');
    const stationMap = {};
    stations.forEach(s => stationMap[s.id] = s.name);

    if (employees.length === 0) {
        container.innerHTML = '<div class="alert alert-info">?? ???? ??????</div>';
        return;
    }
    let html = `<div class="search-bar"><input type="text" id="searchEmpInput" class="form-control" placeholder="???..."></div>
                <div class="table-responsive"><table class="table table-bordered"><thead>??<th>?????</th><th>?????</th><th>??????</th><th>???????</th><th>???????</th><th>????????</th><th>??????</th><th></th> </thead><tbody id="empTable">`;
    employees.forEach(e => {
        html += `??
            <td>${e.code}</td>
            <td>${e.name}</td>
            <td>${stationMap[e.stationId] || '-'}</td>
            <td>${e.role}</td>
            <td>${e.shift || '-'}</td>
            <td>${e.phone || '-'}</td>
            <td>${e.status}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editEmployee(${e.id})">?? ?????</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEmployeeNow(${e.id})">??? ???</button>
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
    window.deleteEmployeeNow = async (id) => {
        if (confirm('?? ???? ??? ??? ???????')) {
            try {
                await apiCall('employees', 'delete', null, id);
                alert('?? ??? ??????');
                loadPage('listEmployees');
            } catch (err) { alert('???: ' + err.message); }
        }
    };
}

async function loadEditEmployee(container, employeeId) {
    const employees = await apiCall('employees', 'select');
    const employee = employees.find(e => e.id == employeeId);
    if (!employee) return;

    const stations = await apiCall('stations', 'select');
    let stationOptions = '<option value="">???? ????</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}" ${employee.stationId == s.id ? 'selected' : ''}>${s.name}</option>`; });

    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ?????? ??????</h4>
            <form id="editEmpForm">
                <div class="row">
                    <div class="col-md-3 mb-3"><label>?????</label><input type="text" id="empCode" class="form-control" value="${employee.code}" required></div>
                    <div class="col-md-3 mb-3"><label>?????</label><input type="text" id="empName" class="form-control" value="${employee.name}" required></div>
                    <div class="col-md-3 mb-3"><label>??????</label><select id="empStation" class="form-control">${stationOptions}</select></div>
                    <div class="col-md-3 mb-3"><label>???????</label><select id="empRole" class="form-control">
                        <option ${employee.role == '???? ????' ? 'selected' : ''}>???? ????</option>
                        <option ${employee.role == '?????' ? 'selected' : ''}>?????</option>
                        <option ${employee.role == '???' ? 'selected' : ''}>???</option>
                        <option ${employee.role == '????' ? 'selected' : ''}>????</option>
                    </select></div>
                    <div class="col-md-3 mb-3"><label>???????</label><select id="empShift" class="form-control">
                        <option ${employee.shift == '????' ? 'selected' : ''}>????</option>
                        <option ${employee.shift == '?????' ? 'selected' : ''}>?????</option>
                        <option ${employee.shift == '?????' ? 'selected' : ''}>?????</option>
                    </select></div>
                    <div class="col-md-3 mb-3"><label>????????</label><input type="text" id="empPhone" class="form-control" value="${employee.phone || ''}"></div>
                    <div class="col-md-3 mb-3"><label>??????</label><select id="empStatus" class="form-control">
                        <option ${employee.status == '????' ? 'selected' : ''}>????</option>
                        <option ${employee.status == '?????' ? 'selected' : ''}>?????</option>
                    </select></div>
                </div>
                <button type="submit" class="btn btn-primary">?? ??? ???????</button>
                <button type="button" class="btn btn-secondary" onclick="loadPage('listEmployees')">????</button>
            </form>
        </div>
    `;

    document.getElementById('editEmpForm').onsubmit = async function(e) {
        e.preventDefault();
        const updatedEmployee = {
            code: document.getElementById('empCode').value,
            name: document.getElementById('empName').value,
            stationId: document.getElementById('empStation').value,
            role: document.getElementById('empRole').value,
            shift: document.getElementById('empShift').value,
            phone: document.getElementById('empPhone').value,
            status: document.getElementById('empStatus').value
        };
        try {
            await apiCall('employees', 'update', updatedEmployee, employeeId);
            alert('?? ??? ???????');
            loadPage('listEmployees');
        } catch (err) { alert('???: ' + err.message); }
    };
}

// ==================== ??????? ====================
async function loadAddFault(container) {
    const stations = await apiCall('stations', 'select');
    const employees = await apiCall('employees', 'select');
    let stationOptions = '<option value="">???? ????</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    let empOptions = '<option value="">???? ????</option>';
    employees.forEach(e => { empOptions += `<option value="${e.id}">${e.name}</option>`; });

    container.innerHTML = `
        <div class="form-card">
            <h4>?? ???? ??? ????</h4>
            <form id="faultForm">
                <div class="row">
                    <div class="col-md-6 mb-3"><label>??????</label><select id="faultStation" class="form-control" required>${stationOptions}</select></div>
                    <div class="col-md-6 mb-3"><label>??? ??????</label><input type="text" id="stationCode" class="form-control" readonly></div>
                    <div class="col-md-6 mb-3"><label>????? ??????</label><select id="faultAsset" class="form-control"><option value="">???? ?????</option></select></div>
                    <div class="col-md-6 mb-3"><label>??? ?????</label><select id="faultType" class="form-control"><option>??????</option><option>????????</option></select></div>
                    <div class="col-md-6 mb-3"><label>???????</label><input type="date" id="faultDate" class="form-control" required></div>
                    <div class="col-md-6 mb-3"><label>??????</label><select id="faultReporter" class="form-control">${empOptions}</select></div>
                    <div class="col-12 mb-3"><label>??? ?????</label><textarea id="faultDesc" class="form-control" rows="3" required></textarea></div>
                    <div class="col-12 mb-3"><label>??????? ???????</label><textarea id="faultActions" class="form-control" rows="2"></textarea></div>
                    <div class="col-12 mb-3"><label>??? ??????</label><input type="text" id="faultParts" class="form-control"></div>
                </div>
                <button type="submit" class="btn btn-primary">??? ??????</button>
            </form>
        </div>
    `;

    document.getElementById('faultStation').addEventListener('change', async function() {
        const stationId = this.value;
        const station = stations.find(s => s.id == stationId);
        if (station) {
            document.getElementById('stationCode').value = station.code;
            const assets = [];
            if (station.mainPumps) station.mainPumps.forEach((p, i) => assets.push({ id: `pump_${i}`, name: p['???/??? ???????'] || `????? ?????? ${i+1}` }));
            if (station.drainPumps) station.drainPumps.forEach((p, i) => assets.push({ id: `drain_${i}`, name: p['???/??? ???????'] || `????? ??? ${i+1}` }));
            if (station.winches) station.winches.forEach((w, i) => assets.push({ id: `winch_${i}`, name: w['???/??? ?????'] || `??? ${i+1}` }));
            if (station.panels) station.panels.forEach((p, i) => assets.push({ id: `panel_${i}`, name: p['???/??? ??????'] || `???? ${i+1}` }));
            if (station.fans) station.fans.forEach((f, i) => assets.push({ id: `fan_${i}`, name: f['???/??? ???????'] || `????? ${i+1}` }));
            if (station.sealPumps) station.sealPumps.forEach((s, i) => assets.push({ id: `seal_${i}`, name: s['???/??? ???????'] || `????? ??? ?????? ${i+1}` }));
            const assetSelect = document.getElementById('faultAsset');
            assetSelect.innerHTML = '<option value="">???? ?????</option>' + assets.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
        }
    });

    document.getElementById('faultForm').onsubmit = async function(e) {
        e.preventDefault();
        const newFault = {
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
            status: 'open',
            createdAt: new Date().toISOString()
        };
        try {
            await apiCall('faults', 'insert', newFault);
            alert('?? ??? ??????');
            loadPage('listFaults');
        } catch (err) { alert('???: ' + err.message); }
    };
}

async function loadListFaults(container) {
    const faults = await apiCall('faults', 'select');
    const stations = await apiCall('stations', 'select');
    const stationMap = {};
    stations.forEach(s => stationMap[s.id] = s.name);

    let stationFilter = '<option value="">?? ???????</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    const html = `
        <div class="search-bar">
            <div class="row">
                <div class="col-md-4"><label>??????</label><select id="filterStation" class="form-control">${stationFilter}</select></div>
                <div class="col-md-4"><label>?? ?????</label><input type="date" id="filterDateFrom" class="form-control"></div>
                <div class="col-md-4"><label>??? ?????</label><input type="date" id="filterDateTo" class="form-control"></div>
                <div class="col-md-12 mt-2"><button class="btn btn-primary" onclick="filterFaults()">?????</button></div>
            </div>
        </div>
        <div id="faultsListContainer"></div>
    `;
    container.innerHTML = html;

    let currentFaults = faults;

    window.filterFaults = () => {
        const stationId = document.getElementById('filterStation').value;
        const from = document.getElementById('filterDateFrom').value;
        const to = document.getElementById('filterDateTo').value;
        let filtered = currentFaults;
        if (stationId) filtered = filtered.filter(f => f.stationId == stationId);
        if (from) filtered = filtered.filter(f => f.date >= from);
        if (to) filtered = filtered.filter(f => f.date <= to);
        displayFaultsList(filtered);
    };

    function displayFaultsList(list) {
        const containerDiv = document.getElementById('faultsListContainer');
        if (list.length === 0) {
            containerDiv.innerHTML = '<div class="alert alert-info">?? ???? ??????</div>';
            return;
        }
        let html = '<div class="table-responsive"><table class="table table-bordered"><thead>??<th>??????</th><th>?????</th><th>?????</th><th>???????</th><th>??????</th><th></th> </thead><tbody>';
        list.forEach(f => {
            html += `??
                <td>${f.stationName || stationMap[f.stationId]}</td>
                <td>${f.assetName || '-'}</td>
                <td>${f.type}</td>
                <td>${f.date}</td>
                <td>${f.status === 'open' ? '<span class="badge bg-danger">?????</span>' : '<span class="badge bg-success">????</span>'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editFault(${f.id})">?? ?????</button>
                    <button class="btn btn-sm btn-info" onclick="viewFaultDetail(${f.id})">???</button>
                </td>
            </tr>`;
        });
        html += '</tbody> </table></div>';
        containerDiv.innerHTML = html;
    }

    window.editFault = (id) => loadEditFault(document.getElementById('pageContent'), id);
    window.viewFaultDetail = async (id) => {
        const fault = currentFaults.find(f => f.id === id);
        const details = `
            <div class="form-card">
                <h4>?????? ??????</h4>
                <p><strong>??????:</strong> ${fault.stationName || stationMap[fault.stationId]}</p>
                <p><strong>?????:</strong> ${fault.assetName || '-'}</p>
                <p><strong>?????:</strong> ${fault.type}</p>
                <p><strong>???????:</strong> ${fault.date}</p>
                <p><strong>?????:</strong> ${fault.description}</p>
                <p><strong>??????? ???????:</strong> ${fault.actions || '-'}</p>
                <p><strong>??? ??????:</strong> ${fault.parts || '-'}</p>
                <p><strong>??????:</strong> ${fault.status === 'open' ? '?????' : '????'}</p>
                ${fault.status === 'open' ? '<button class="btn btn-success" onclick="closeFaultNow('+fault.id+')">????? ??????</button>' : ''}
                <button class="btn btn-secondary" onclick="loadPage(\'listFaults\')">????</button>
            </div>
        `;
        document.getElementById('pageContent').innerHTML = details;
    };
    window.closeFaultNow = async (id) => {
        try {
            await apiCall('faults', 'update', { status: 'closed' }, id);
            alert('?? ????? ??????');
            loadPage('listFaults');
        } catch (err) { alert('???: ' + err.message); }
    };

    displayFaultsList(currentFaults);
}

async function loadEditFault(container, faultId) {
    const faults = await apiCall('faults', 'select');
    const fault = faults.find(f => f.id == faultId);
    if (!fault) return;

    const stations = await apiCall('stations', 'select');
    let stationOptions = '<option value="">???? ????</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}" ${fault.stationId == s.id ? 'selected' : ''}>${s.name}</option>`; });

    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ??????</h4>
            <form id="editFaultForm">
                <div class="row">
                    <div class="col-md-6 mb-3"><label>??????</label><select id="faultStation" class="form-control">${stationOptions}</select></div>
                    <div class="col-md-6 mb-3"><label>????? ??????</label><input type="text" id="faultAsset" class="form-control" value="${fault.assetName || ''}"></div>
                    <div class="col-md-6 mb-3"><label>??? ?????</label><select id="faultType" class="form-control">
                        <option ${fault.type == '??????' ? 'selected' : ''}>??????</option>
                        <option ${fault.type == '????????' ? 'selected' : ''}>????????</option>
                    </select></div>
                    <div class="col-md-6 mb-3"><label>???????</label><input type="date" id="faultDate" class="form-control" value="${fault.date}"></div>
                    <div class="col-12 mb-3"><label>??? ?????</label><textarea id="faultDesc" class="form-control" rows="3">${fault.description || ''}</textarea></div>
                    <div class="col-12 mb-3"><label>??????? ???????</label><textarea id="faultActions" class="form-control" rows="2">${fault.actions || ''}</textarea></div>
                    <div class="col-12 mb-3"><label>??? ??????</label><input type="text" id="faultParts" class="form-control" value="${fault.parts || ''}"></div>
                </div>
                <button type="submit" class="btn btn-primary">?? ??? ???????</button>
                <button type="button" class="btn btn-danger" onclick="deleteFaultNow(${fault.id})">??? ??? ??????</button>
                <button type="button" class="btn btn-secondary" onclick="loadPage('listFaults')">????</button>
            </form>
        </div>
    `;

    document.getElementById('editFaultForm').onsubmit = async function(e) {
        e.preventDefault();
        const updatedFault = {
            stationId: document.getElementById('faultStation').value,
            stationName: document.getElementById('faultStation').selectedOptions[0]?.text,
            assetName: document.getElementById('faultAsset').value,
            type: document.getElementById('faultType').value,
            date: document.getElementById('faultDate').value,
            description: document.getElementById('faultDesc').value,
            actions: document.getElementById('faultActions').value,
            parts: document.getElementById('faultParts').value
        };
        try {
            await apiCall('faults', 'update', updatedFault, faultId);
            alert('?? ??? ???????');
            loadPage('listFaults');
        } catch (err) { alert('???: ' + err.message); }
    };
    window.deleteFaultNow = async (id) => {
        if (confirm('?? ???? ??? ??? ???????')) {
            try {
                await apiCall('faults', 'delete', null, id);
                alert('?? ??? ??????');
                loadPage('listFaults');
            } catch (err) { alert('???: ' + err.message); }
        }
    };
}

// ==================== ???????? ====================
async function loadTariffs(container) {
    let tariffs = { electricity: 1.2, water: 3.5 };
    try {
        const data = await apiCall('tariffs', 'select');
        if (data && data.length > 0) tariffs = data[0];
    } catch (e) { console.warn(e); }

    container.innerHTML = `
        <div class="form-card">
            <h4>?? ???????</h4>
            <form id="tariffsForm">
                <div class="mb-3"><label>?????? ???????? (????/???? ???)</label><input type="number" step="0.01" id="elecTariff" class="form-control" value="${tariffs.electricity}"></div>
                <div class="mb-3"><label>?????? ?????? (????/??? ????)</label><input type="number" step="0.01" id="waterTariff" class="form-control" value="${tariffs.water}"></div>
                <button type="submit" class="btn btn-primary">???</button>
            </form>
        </div>
    `;
    document.getElementById('tariffsForm').onsubmit = async function(e) {
        e.preventDefault();
        const newTariffs = {
            electricity: parseFloat(document.getElementById('elecTariff').value),
            water: parseFloat(document.getElementById('waterTariff').value),
            updated_at: new Date().toISOString()
        };
        try {
            const existing = await apiCall('tariffs', 'select');
            if (existing && existing.length > 0) {
                await apiCall('tariffs', 'update', newTariffs, existing[0].id);
            } else {
                await apiCall('tariffs', 'insert', { id: 1, ...newTariffs });
            }
            alert('?? ??? ?????????');
        } catch (err) { alert('???: ' + err.message); }
    };
}

// ==================== ??????? ?????? ====================
async function loadMonthlyCosts(container) {
    const stations = await apiCall('stations', 'select');
    let tariffs = { electricity: 1.2, water: 3.5 };
    try {
        const t = await apiCall('tariffs', 'select');
        if (t && t.length > 0) tariffs = t[0];
    } catch (e) {}
    const monthlyCosts = await apiCall('monthly_costs', 'select');

    let stationOptions = '<option value="">???? ????</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });

    container.innerHTML = `
        <div class="form-card">
            <h4>?? ??????? ??????</h4>
            <form id="monthlyForm">
                <div class="row">
                    <div class="col-md-4 mb-3"><label>??????</label><select id="monthStation" class="form-control" required>${stationOptions}</select></div>
                    <div class="col-md-4 mb-3"><label>??? ??????</label><input type="text" id="monthStationCode" class="form-control" readonly></div>
                    <div class="col-md-4 mb-3"><label>??? ????????</label><input type="month" id="monthPeriod" class="form-control" required></div>
                </div>
                <div class="mt-4 p-3 border rounded">
                    <h5>?? ???? ?????? ????????</h5>
                    <div class="row">
                        <div class="col-md-4"><label>????? ???????</label><input type="number" id="operatingHours" class="form-control" step="0.5"></div>
                        <div class="col-md-4"><label>???? ???? ??????</label><select id="pumpForFlow" class="form-control"></select></div>
                        <div class="col-md-4"><label>?????? ???????? (m³)</label><input type="text" id="waterPumped" class="form-control" readonly style="background:#e9ecef"></div>
                    </div>
                </div>
                <div class="mt-4 p-3 border rounded" id="transformersSection">
                    <h5>? ????????</h5>
                    <div id="transformersInputs"></div>
                </div>
                <div class="mt-4 p-3 border rounded" id="generatorsSection">
                    <h5>??? ????????</h5>
                    <div id="generatorsInputs"></div>
                </div>
                <div class="mt-4 p-3 border rounded">
                    <h5>?? ???? ??????</h5>
                    <div class="row">
                        <div class="col-md-4"><label>??????? ???????</label><input type="number" id="currentWater" class="form-control" step="0.1"></div>
                        <div class="col-md-4"><label>??????? ???????</label><input type="number" id="prevWater" class="form-control" step="0.1"></div>
                        <div class="col-md-4"><label>?????????</label><input type="text" id="waterConsumed" class="form-control" readonly style="background:#e9ecef"></div>
                        <div class="col-md-4"><label>????????</label><input type="text" id="waterTariff" class="form-control" value="${tariffs.water}" readonly></div>
                        <div class="col-md-4"><label>???? ?????????</label><input type="text" id="waterCost" class="form-control" readonly style="background:#e9ecef"></div>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary mt-3">?? ??? ???????</button>
                <button type="button" class="btn btn-info mt-3" onclick="showPreviousReports()">?? ???????? ???????</button>
            </form>
        </div>
        <div id="previousReportsList" class="mt-4" style="display:none"></div>
    `;

    window.showPreviousReports = () => {
        const stationId = document.getElementById('monthStation').value;
        if (!stationId) { alert('???? ???? ?????'); return; }
        const reports = monthlyCosts.filter(r => r.stationId == stationId).sort((a,b) => b.month.localeCompare(a.month));
        const listDiv = document.getElementById('previousReportsList');
        if (reports.length === 0) {
            listDiv.innerHTML = '<div class="alert alert-info">?? ???? ?????? ?????</div>';
        } else {
            let html = '<div class="form-card"><h5>???????? ???????</h5><table class="table"><thead>??<th>?????</th><th>?????? ????????</th><th>??????</th><th>?????</th><th></th> </thead><tbody>';
            reports.forEach(r => {
                html += `??
                    <td>${r.month}</td>
                    <td>${r.waterPumped || 0} m³</td>
                    <td>${r.totalElecCost || 0} ?</td>
                    <td>${r.totalDieselBalance || 0} ???</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editMonthlyReport(${r.id})">?????</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMonthlyReport(${r.id})">???</button>
                    </td>
                </tr>`;
            });
            html += '</tbody> </table></div>';
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
            pumpsSelect.innerHTML = '<option value="">???? ????</option>';
            if (station.mainPumps) {
                station.mainPumps.forEach((p, idx) => {
                    const flow = p['?????? m³/h'] || 0;
                    pumpsSelect.innerHTML += `<option value="${flow}">${p['???/??? ???????'] || '????? '+(idx+1)} (${flow} m³/h)</option>`;
                });
            }
            // transformers inputs
            const transformersDiv = document.getElementById('transformersInputs');
            if (station.powerSources) {
                const transformers = station.powerSources.filter(ps => ps['?????'] === '????');
                if (transformers.length) {
                    let html = '';
                    transformers.forEach((t, idx) => {
                        const name = t['???/??? ??????'] || `???? ${idx+1}`;
                        const lastReport = monthlyCosts.filter(r => r.stationId == stationId).sort((a,b)=>b.month.localeCompare(a.month))[0];
                        const prevReading = (lastReport && lastReport.transformers && lastReport.transformers[idx]) ? lastReport.transformers[idx].current : 0;
                        html += `<div class="border p-2 mb-2">
                            <strong>${name}</strong>
                            <div class="row mt-2">
                                <div class="col-md-4"><label>??????? ???????</label><input type="number" class="form-control transformer-current" data-idx="${idx}"></div>
                                <div class="col-md-4"><label>??????? ???????</label><input type="number" class="form-control transformer-prev" value="${prevReading}"></div>
                                <div class="col-md-2"><label>?????</label><input type="text" class="form-control transformer-diff" readonly></div>
                                <div class="col-md-2"><label>???????</label><input type="text" class="form-control transformer-cost" readonly></div>
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
                } else transformersDiv.innerHTML = '<div class="alert alert-warning">?? ???? ??????</div>';
            }
            // generators inputs
            const generatorsDiv = document.getElementById('generatorsInputs');
            if (station.powerSources) {
                const generators = station.powerSources.filter(ps => ps['?????'] === '????');
                if (generators.length) {
                    let html = '';
                    generators.forEach((g, idx) => {
                        const name = g['???/??? ??????'] || `???? ${idx+1}`;
                        const loadRate = g['???? ????????? ??? ????? (???/?)'] || 10;
                        const idleRate = g['???? ????????? ???? ??? (???/?)'] || 5;
                        const lastReport = monthlyCosts.filter(r => r.stationId == stationId).sort((a,b)=>b.month.localeCompare(a.month))[0];
                        const prevBalance = (lastReport && lastReport.generators && lastReport.generators[idx]) ? lastReport.generators[idx].balance : 0;
                        html += `<div class="border p-2 mb-2">
                            <strong>${name}</strong>
                            <div class="row mt-2">
                                <div class="col-md-3"><label>????? ????</label><input type="number" class="form-control gen-added" data-idx="${idx}"></div>
                                <div class="col-md-3"><label>???? ????</label><input type="number" class="form-control gen-prev" value="${prevBalance}"></div>
                                <div class="col-md-3"><label>????? ??? ???</label><input type="number" class="form-control gen-load-hours" step="0.5"></div>
                                <div class="col-md-3"><label>????? ???? ???</label><input type="number" class="form-control gen-idle-hours" step="0.5"></div>
                                <div class="col-md-3"><label>???? ???</label><input type="text" class="form-control" value="${loadRate}" readonly></div>
                                <div class="col-md-3"><label>???? ???? ???</label><input type="text" class="form-control" value="${idleRate}" readonly></div>
                                <div class="col-md-3"><label>?????????</label><input type="text" class="form-control gen-consumed" readonly></div>
                                <div class="col-md-3"><label>?????? ???????</label><input type="text" class="form-control gen-balance" readonly></div>
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
                } else generatorsDiv.innerHTML = '<div class="alert alert-warning">?? ???? ??????</div>';
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

    document.getElementById('monthlyForm').onsubmit = async function(e) {
        e.preventDefault();
        const stationId = document.getElementById('monthStation').value;
        const station = stations.find(s => s.id == stationId);
        const month = document.getElementById('monthPeriod').value;
        if (!stationId || !month) { alert('???? ?????? ??????'); return; }

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
            id: Date.now(),
            stationId: stationId,
            stationName: station.name,
            month: month,
            operatingHours: operatingHours,
            pumpFlow: pumpFlow,
            waterPumped: waterPumped,
            transformers: transformers,
            totalElecCost: totalElecCost,
            generators: generators,
            totalDieselBalance: totalDieselBalance,
            water: { current: currentWater, prev: prevWater, consumed: waterConsumed, cost: waterCost }
        };

        const existingReport = monthlyCosts.find(r => r.stationId == stationId && r.month == month);
        try {
            if (existingReport) {
                if (confirm('???? ????? ???? ?????. ?? ???? ???????')) {
                    await apiCall('monthly_costs', 'update', report, existingReport.id);
                    alert('?? ????? ???????');
                } else return;
            } else {
                await apiCall('monthly_costs', 'insert', report);
                alert('?? ??? ???????');
            }
            loadPage('home');
        } catch (err) { alert('???: ' + err.message); }
    };

    window.editMonthlyReport = async (id) => {
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
    window.deleteMonthlyReport = async (id) => {
        if (confirm('?? ???? ??? ??? ????????')) {
            try {
                await apiCall('monthly_costs', 'delete', null, id);
                alert('?? ??? ???????');
                showPreviousReports();
            } catch (err) { alert('???: ' + err.message); }
        }
    };
}

// ==================== ????? ???????? ??????? ====================
async function loadReportDaily(container) {
    const stations = await apiCall('stations', 'select');
    const dailyReports = await apiCall('daily_reports', 'select');
    let stationOptions = '<option value="">???? ????</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });

    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ???????? ???????</h4>
            <div class="row">
                <div class="col-md-4"><label>??????</label><select id="dailyStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4"><label>???????</label><input type="date" id="dailyDate" class="form-control"></div>
                <div class="col-md-4"><label>???????</label><input type="text" id="dailyInspector" class="form-control"></div>
            </div>
            <div id="assetsStatus" class="mt-3"></div>
            <button class="btn btn-primary mt-3" onclick="saveDailyReport()">?? ???</button>
            <button class="btn btn-info mt-3" onclick="showDailyReportsList()">?? ????? ????????</button>
        </div>
        <div id="dailyReportsList" class="mt-4" style="display:none"></div>
    `;

    document.getElementById('dailyStation').addEventListener('change', function() {
        const stationId = this.value;
        const station = stations.find(s => s.id == stationId);
        if (!station) return;
        let html = '<h5>???? ??????</h5>';
        const allAssets = [];
        if (station.mainPumps) station.mainPumps.forEach((p,i) => allAssets.push({ name: p['???/??? ???????'] || `????? ?????? ${i+1}`, type: 'main', idx: i }));
        if (station.drainPumps) station.drainPumps.forEach((p,i) => allAssets.push({ name: p['???/??? ???????'] || `????? ??? ${i+1}`, type: 'drain', idx: i }));
        if (station.winches) station.winches.forEach((w,i) => allAssets.push({ name: w['???/??? ?????'] || `??? ${i+1}`, type: 'winch', idx: i }));
        if (station.panels) station.panels.forEach((p,i) => allAssets.push({ name: p['???/??? ??????'] || `???? ${i+1}`, type: 'panel', idx: i }));
        if (station.fans) station.fans.forEach((f,i) => allAssets.push({ name: f['???/??? ???????'] || `????? ${i+1}`, type: 'fan', idx: i }));
        if (station.sealPumps) station.sealPumps.forEach((s,i) => allAssets.push({ name: s['???/??? ???????'] || `??? ?????? ${i+1}`, type: 'seal', idx: i }));
        if (station.buildings) station.buildings.forEach((b,i) => allAssets.push({ name: b['???/??? ??????'] || `???? ${i+1}`, type: 'building', idx: i }));

        allAssets.forEach(asset => {
            html += `<div class="border p-2 mb-2">
                <strong>${asset.name}</strong>
                <div class="row mt-2">
                    <div class="col-md-4"><label><input type="radio" name="status_${asset.type}_${asset.idx}" value="????"> ????</label> <label><input type="radio" name="status_${asset.type}_${asset.idx}" value="?? ????"> ?? ????</label></div>
                    <div class="col-md-4"><input type="text" class="form-control" placeholder="???????" id="notes_${asset.type}_${asset.idx}"></div>
                    <div class="col-md-4"><input type="text" class="form-control" placeholder="??? ??????" id="reason_${asset.type}_${asset.idx}"></div>
                </div>
            </div>`;
        });
        document.getElementById('assetsStatus').innerHTML = html;
    });

    window.saveDailyReport = async () => {
        const stationId = document.getElementById('dailyStation').value;
        const date = document.getElementById('dailyDate').value;
        const inspector = document.getElementById('dailyInspector').value;
        if (!stationId || !date) { alert('???? ?????? ????????'); return; }
        const assets = [];
        document.querySelectorAll('#assetsStatus .border').forEach(div => {
            const name = div.querySelector('strong').innerText;
            const statusRadio = div.querySelector('input[type="radio"]:checked');
            const status = statusRadio ? statusRadio.value : '';
            const notes = div.querySelector('input[placeholder="???????"]')?.value || '';
            const reason = div.querySelector('input[placeholder="??? ??????"]')?.value || '';
            assets.push({ name, status, notes, reason });
        });
        const newReport = {
            id: Date.now(),
            stationId: stationId,
            stationName: stations.find(s=>s.id==stationId)?.name,
            date: date,
            inspector: inspector,
            assets: assets
        };
        try {
            await apiCall('daily_reports', 'insert', newReport);
            alert('?? ??? ???????');
            loadPage('home');
        } catch (err) { alert('???: ' + err.message); }
    };

    window.showDailyReportsList = () => {
        const stationId = document.getElementById('dailyStation').value;
        const reports = dailyReports.filter(r => !stationId || r.stationId == stationId).sort((a,b)=>b.date.localeCompare(a.date));
        const listDiv = document.getElementById('dailyReportsList');
        if (reports.length === 0) listDiv.innerHTML = '<div class="alert alert-info">?? ???? ??????</div>';
        else {
            let html = '<div class="form-card"><h5>????? ????????</h5><table class="table"><thead>??<th>??????</th><th>???????</th><th>???????</th><th></th> </thead><tbody>';
            reports.forEach(r => {
                html += `??
                    <td>${r.stationName}</td>
                    <td>${r.date}</td>
                    <td>${r.inspector || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editDailyReport(${r.id})">?????</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDailyReport(${r.id})">???</button>
                        <button class="btn btn-sm btn-info" onclick="printDailyReport(${r.id})">?????</button>
                    </td>
                </tr>`;
            });
            html += '</tbody> </table></div>';
            listDiv.innerHTML = html;
        }
        listDiv.style.display = 'block';
    };

    window.editDailyReport = async (id) => {
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
                const notesInputs = document.querySelectorAll('input[placeholder="???????"]');
                if (notesInputs[idx]) notesInputs[idx].value = asset.notes;
                const reasonInputs = document.querySelectorAll('input[placeholder="??? ??????"]');
                if (reasonInputs[idx]) reasonInputs[idx].value = asset.reason;
            });
        }, 200);
        document.getElementById('dailyReportsList').style.display = 'none';
        alert('??? ???????? ?? ???? ??????? ??? ????');
    };

    window.deleteDailyReport = async (id) => {
        if (confirm('?? ???? ??? ??? ????????')) {
            try {
                await apiCall('daily_reports', 'delete', null, id);
                alert('?? ??? ???????');
                showDailyReportsList();
            } catch (err) { alert('???: ' + err.message); }
        }
    };

    window.printDailyReport = (id) => {
        const report = dailyReports.find(r => r.id == id);
        if (report) {
            const win = window.open('', '_blank');
            win.document.write(`<html dir="rtl"><head><title>????? ${report.stationName} - ${report.date}</title>
            <style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px}</style></head>
            <body><h2>????? ???????? ???????</h2><p><strong>??????:</strong> ${report.stationName}</p>
            <p><strong>???????:</strong> ${report.date}</p><p><strong>???????:</strong> ${report.inspector || '-'}</p>
            <table><thead><tr><th>?????</th><th>??????</th><th>???????</th><th>??? ??????</th></tr></thead><tbody>
            ${report.assets.map(a => `<tr><td>${a.name}</td><td>${a.status}</td><td>${a.notes}</td><td>${a.reason}</td></tr>`).join('')}
            </tbody></table></body></html>`);
            win.document.close();
            win.print();
        }
    };
}

// ==================== ???? ???????? (?????? ???????? ??? ???? ??????) ====================
async function loadReportFaults(container) {
    const stations = await apiCall('stations', 'select');
    const faults = await apiCall('faults', 'select');
    let stationOptions = '<option value="">?? ???????</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ???????</h4>
            <div class="row">
                <div class="col-md-4"><label>??????</label><select id="faultReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4"><label>?? ?????</label><input type="date" id="faultFrom" class="form-control"></div>
                <div class="col-md-4"><label>??? ?????</label><input type="date" id="faultTo" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-3" onclick="showFaultsReport()">???</button>
            <button class="btn btn-secondary mt-3" onclick="printFaultsReport()">?????</button>
            <div id="faultsReportResult" class="mt-4"></div>
        </div>
    `;
    window.showFaultsReport = () => {
        const stationId = document.getElementById('faultReportStation').value;
        const from = document.getElementById('faultFrom').value;
        const to = document.getElementById('faultTo').value;
        let filtered = faults;
        if (stationId) filtered = filtered.filter(f => f.stationId == stationId);
        if (from) filtered = filtered.filter(f => f.date >= from);
        if (to) filtered = filtered.filter(f => f.date <= to);
        const resultDiv = document.getElementById('faultsReportResult');
        if (filtered.length === 0) { resultDiv.innerHTML = '<div class="alert alert-info">?? ???? ?????</div>'; return; }
        let html = '<div class="table-responsive"><table class="table"><thead><tr><th>??????</th><th>?????</th><th>?????</th><th>???????</th><th>?????</th><th>???????</th><th>??????</th></tr></thead><tbody>';
        filtered.forEach(f => {
            const station = stations.find(s => s.id == f.stationId);
            html += `<tr><td>${station?.name || f.stationName || '-'}</td><td>${f.assetName || '-'}</td><td>${f.type}</td><td>${f.date}</td><td>${f.description}</td><td>${f.actions || '-'}</td><td>${f.status === 'open' ? '?????' : '????'}</td></tr>`;
        });
        html += '</tbody></table></div>';
        resultDiv.innerHTML = html;
    };
    window.printFaultsReport = () => window.print();
}

async function loadReportStation(container) {
    const stations = await apiCall('stations', 'select');
    const dailyReports = await apiCall('daily_reports', 'select');
    const faults = await apiCall('faults', 'select');
    const openFaults = faults.filter(f => f.status === 'open');
    let stationOptions = '<option value="">???? ????</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ?????? ????</h4>
            <div class="row"><div class="col-md-6"><select id="stationReportSelect" class="form-control">${stationOptions}</select></div>
            <div class="col-md-6"><button class="btn btn-primary" onclick="showStationFullReport()">???</button></div></div>
            <div id="stationFullReport" class="mt-4"></div>
            <button id="printStationBtn" class="btn btn-secondary mt-3" style="display:none" onclick="printStationReport()">?????</button>
        </div>
    `;
    window.showStationFullReport = () => {
        const stationId = document.getElementById('stationReportSelect').value;
        const station = stations.find(s => s.id == stationId);
        if (!station) { alert('???? ????'); return; }
        const lastDaily = dailyReports.filter(r => r.stationId == stationId).sort((a,b)=>b.date.localeCompare(a.date))[0];
        const dailyMap = {};
        if (lastDaily && lastDaily.assets) lastDaily.assets.forEach(a => { dailyMap[a.name] = { status: a.status, notes: a.notes, reason: a.reason }; });
        const stationOpenFaults = openFaults.filter(f => f.stationId == stationId);
        const faultMap = {};
        stationOpenFaults.forEach(f => { faultMap[f.assetName] = { reason: f.description, date: f.date }; });
        const allAssets = [];
        if (station.mainPumps) station.mainPumps.forEach((p,i) => allAssets.push(p['???/??? ???????'] || `????? ?????? ${i+1}`));
        if (station.drainPumps) station.drainPumps.forEach((p,i) => allAssets.push(p['???/??? ???????'] || `????? ??? ${i+1}`));
        if (station.winches) station.winches.forEach((w,i) => allAssets.push(w['???/??? ?????'] || `??? ${i+1}`));
        if (station.panels) station.panels.forEach((p,i) => allAssets.push(p['???/??? ??????'] || `???? ${i+1}`));
        if (station.fans) station.fans.forEach((f,i) => allAssets.push(f['???/??? ???????'] || `????? ${i+1}`));
        if (station.sealPumps) station.sealPumps.forEach((s,i) => allAssets.push(s['???/??? ???????'] || `??? ?????? ${i+1}`));
        let html = `<h5>${station.name} (${station.code})</h5><table class="table table-bordered"><thead><tr><th>?????</th><th>??????</th><th>??? ??????</th><th>??????</th></tr></thead><tbody>`;
        allAssets.forEach(name => {
            let status = '-', reason = '-', source = '';
            if (faultMap[name]) { status = '?? ????'; reason = faultMap[name].reason; source = `???? ??? (${faultMap[name].date})`; }
            else if (dailyMap[name]) { status = dailyMap[name].status; reason = dailyMap[name].reason; source = `????? ?????? (${lastDaily?.date})`; if(dailyMap[name].notes) source += ` - ???????: ${dailyMap[name].notes}`; }
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
        win.document.write(`<html dir="rtl"><head><title>????? ?????? ${stationName}</title><style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px}</style></head><body><h2>????? ?????? ???? ${stationName}</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

async function loadReportAsset(container) {
    const stations = await apiCall('stations', 'select');
    const dailyReports = await apiCall('daily_reports', 'select');
    const faults = await apiCall('faults', 'select');
    const openFaults = faults.filter(f => f.status === 'open');
    let stationOptions = '<option value="">???? ????</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ?????? ???</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>??????</label><select id="assetReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>???? ?????</label><select id="assetReportSelect" class="form-control"><option value="">???? ?????? ?????</option></select></div>
                <div class="col-md-4 mb-2"><button class="btn btn-primary mt-4" onclick="showAssetFullReport()">??? ???????</button></div>
            </div>
            <div id="assetFullReport" class="mt-4"></div>
            <button id="printAssetBtn" class="btn btn-secondary mt-3" style="display:none" onclick="printAssetReport()">??? ?????</button>
        </div>
    `;
    document.getElementById('assetReportStation').addEventListener('change', function() {
        const stationId = this.value;
        const station = stations.find(s => s.id == stationId);
        const assetSelect = document.getElementById('assetReportSelect');
        if (!station) { assetSelect.innerHTML = '<option value="">???? ?????? ?????</option>'; return; }
        const assets = [];
        if (station.mainPumps) station.mainPumps.forEach((p,i) => assets.push({ id: `main_${i}`, name: p['???/??? ???????'] || `????? ?????? ${i+1}` }));
        if (station.drainPumps) station.drainPumps.forEach((p,i) => assets.push({ id: `drain_${i}`, name: p['???/??? ???????'] || `????? ??? ${i+1}` }));
        if (station.winches) station.winches.forEach((w,i) => assets.push({ id: `winch_${i}`, name: w['???/??? ?????'] || `??? ${i+1}` }));
        if (station.panels) station.panels.forEach((p,i) => assets.push({ id: `panel_${i}`, name: p['???/??? ??????'] || `???? ${i+1}` }));
        if (station.fans) station.fans.forEach((f,i) => assets.push({ id: `fan_${i}`, name: f['???/??? ???????'] || `????? ${i+1}` }));
        if (station.sealPumps) station.sealPumps.forEach((s,i) => assets.push({ id: `seal_${i}`, name: s['???/??? ???????'] || `????? ??? ?????? ${i+1}` }));
        if (assets.length === 0) assetSelect.innerHTML = '<option value="">?? ???? ???? ?????</option>';
        else assetSelect.innerHTML = '<option value="">???? ?????</option>' + assets.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    });
    window.showAssetFullReport = () => {
        const stationId = document.getElementById('assetReportStation').value;
        const assetId = document.getElementById('assetReportSelect').value;
        const assetName = document.getElementById('assetReportSelect').selectedOptions[0]?.text;
        if (!stationId) { alert('???? ???? ?????'); return; }
        if (!assetId) { alert('???? ????? ?????'); return; }
        const station = stations.find(s => s.id == stationId);
        const lastDaily = dailyReports.filter(r => r.stationId == stationId).sort((a,b)=>b.date.localeCompare(a.date))[0];
        let assetStatus = '-', assetReason = '-', assetNotes = '', lastDate = '-';
        if (lastDaily && lastDaily.assets) {
            const assetDaily = lastDaily.assets.find(a => a.name === assetName);
            if (assetDaily) { assetStatus = assetDaily.status || '-'; assetReason = assetDaily.reason || '-'; assetNotes = assetDaily.notes || ''; lastDate = lastDaily.date; }
        }
        const assetFaults = openFaults.filter(f => f.stationId == stationId && f.assetName === assetName);
        let html = `<h5>????? ?????? ?????: ${assetName}</h5><p><strong>??????:</strong> ${station?.name} (${station?.code})</p>
                    <div class="table-responsive"><table class="table table-bordered"><thead><tr><th>??????</th><th>??????</th><th>??? ??????</th><th>??????? / ??????</th></tr></thead><tbody>
                    <tr><td>??? ????? ?????? ?????<br><small>${lastDate}</small></td><td><span class="badge ${assetStatus === '????' ? 'bg-success' : (assetStatus === '?? ????' ? 'bg-danger' : 'bg-secondary')}">${assetStatus || '-'}</span></td><td>${assetReason || '-'}</td><td>${assetNotes || '-'}</td></tr>`;
        if (assetFaults.length) {
            assetFaults.forEach(f => {
                html += `<tr style="background-color:#fff3cd"><td>???? ??? ?????<br><small>${f.date}</small></td><td><span class="badge bg-danger">?? ????</span></td><td>${f.description || '-'}</td><td><strong>???????:</strong> ${f.actions || '-'}<br><strong>??? ??????:</strong> ${f.parts || '-'}</td></tr>`;
            });
        } else {
            html += `<tr><td>?????? ???????</td><td colspan="3">?? ???? ?????? ?????? ???? ?????</td></tr>`;
        }
        html += `</tbody></table></div>`;
        document.getElementById('assetFullReport').innerHTML = html;
        document.getElementById('printAssetBtn').style.display = 'block';
    };
    window.printAssetReport = () => {
        const content = document.getElementById('assetFullReport').innerHTML;
        const assetName = document.getElementById('assetReportSelect').selectedOptions[0]?.text || '?????';
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>????? ?????? ??? ${assetName}</title><style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px}</style></head><body><h2>????? ?????? ???: ${assetName}</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

async function loadReportEmployees(container) {
    const stations = await apiCall('stations', 'select');
    const employees = await apiCall('employees', 'select');
    const stationMap = {};
    stations.forEach(s => stationMap[s.id] = s.name);
    let stationOptions = '<option value="">?? ???????</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ????????</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>??????</label><select id="empReportStationFilter" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>???????</label><select id="empReportRoleFilter" class="form-control"><option value="">????</option><option>???? ????</option><option>?????</option><option>???</option><option>????</option></select></div>
                <div class="col-md-4 mb-2"><label>??????</label><select id="empReportStatusFilter" class="form-control"><option value="">????</option><option>????</option><option>?????</option></select></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showEmployeesReport()">???</button>
            <button class="btn btn-secondary mt-2" onclick="printEmployeesReport()">??? ?????</button>
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
        if (filtered.length === 0) { resultDiv.innerHTML = '<div class="alert alert-info">?? ???? ?????? ??????</div>'; return; }
        let html = `<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>?????</th><th>?????</th><th>??????</th><th>???????</th><th>???????</th><th>????????</th><th>??????</th></tr></thead><tbody>`;
        filtered.forEach(e => {
            html += `<tr><td>${e.code}</td><td>${e.name}</td><td>${stationMap[e.stationId] || '-'}</td><td>${e.role}</td><td>${e.shift || '-'}</td><td>${e.phone || '-'}</td><td>${e.status}</td></tr>`;
        });
        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;
    };
    window.printEmployeesReport = () => {
        const content = document.getElementById('employeesReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>????? ????????</title><style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px}</style></head><body><h2>????? ????????</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

async function loadReportSpareParts(container) {
    const stations = await apiCall('stations', 'select');
    const faults = await apiCall('faults', 'select');
    const faultsWithParts = faults.filter(f => f.parts && f.parts.trim() !== '');
    let stationOptions = '<option value="">?? ???????</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ??? ?????? ?????????</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>??????</label><select id="spareReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>?? ?????</label><input type="date" id="spareFromDate" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>??? ?????</label><input type="date" id="spareToDate" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showSparePartsReport()">???</button>
            <button class="btn btn-secondary mt-2" onclick="printSparePartsReport()">??? ?????</button>
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
        if (filtered.length === 0) { resultDiv.innerHTML = '<div class="alert alert-info">?? ???? ??? ???? ?????</div>'; return; }
        let html = `<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>???????</th><th>??????</th><th>????? ??????</th><th>??? ?????? ?????????</th><th>??? ?????</th></tr></thead><tbody>`;
        filtered.forEach(f => {
            const station = stations.find(s => s.id == f.stationId);
            html += `<tr><td>${f.date}</td><td>${station?.name || '-'}</td><td>${f.assetName || '-'}</td><td>${f.parts}</td><td>${f.type}</td></tr>`;
        });
        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;
    };
    window.printSparePartsReport = () => {
        const content = document.getElementById('sparePartsReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>????? ??? ??????</title><style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px}</style></head><body><h2>????? ??? ?????? ?????????</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

async function loadArchive(container) {
    const stations = await apiCall('stations', 'select');
    let stationOptions = '<option value="">???? ????</option>';
    stations.forEach(s => { stationOptions += `<option value="${s.id}">${s.name}</option>`; });
    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ?????????</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>??????</label><select id="archiveStationSelect" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><input type="file" id="archiveFileInput" class="form-control" accept="image/*,application/pdf"></div>
                <div class="col-md-4 mb-2"><button class="btn btn-primary" onclick="uploadArchiveFile()">?? ??? ???</button></div>
            </div>
            <div id="archiveFilesContainer" class="mt-4 row"></div>
        </div>
    `;
    async function displayArchiveFiles() {
        const stationId = document.getElementById('archiveStationSelect').value;
        if (!stationId) {
            document.getElementById('archiveFilesContainer').innerHTML = '<div class="alert alert-info">???? ???? ???? ???????</div>';
            return;
        }
        const archiveData = await apiCall('archive', 'select');
        const files = archiveData.filter(f => f.stationId == stationId);
        const containerDiv = document.getElementById('archiveFilesContainer');
        containerDiv.innerHTML = '';
        if (files.length === 0) {
            containerDiv.innerHTML = '<div class="alert alert-info">?? ???? ????? ?????? ???? ??????</div>';
            return;
        }
        files.forEach((file, idx) => {
            const col = document.createElement('div');
            col.className = 'col-md-3 mb-3';
            const isImage = file.type === 'image';
            col.innerHTML = `
                <div class="card">
                    ${isImage ? `<img src="${file.data}" class="card-img-top" alt="${file.name}" style="height:150px;object-fit:cover">` : `<div class="card-header bg-secondary text-white">?? ${file.name}</div>`}
                    <div class="card-body">
                        <p class="card-text"><small>${new Date(file.date).toLocaleString('ar-EG')}</small></p>
                        <button class="btn btn-sm btn-info" onclick="viewArchiveFile('${stationId}', ${idx})">???</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteArchiveFile('${stationId}', ${idx})">???</button>
                    </div>
                </div>
            `;
            containerDiv.appendChild(col);
        });
    }
    window.uploadArchiveFile = () => {
        const stationId = document.getElementById('archiveStationSelect').value;
        const fileInput = document.getElementById('archiveFileInput');
        if (!stationId) { alert('???? ???? ?????'); return; }
        if (!fileInput.files.length) { alert('???? ??? ?????'); return; }
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = async function(e) {
            const newFile = {
                id: Date.now(),
                stationId: stationId,
                name: file.name,
                data: e.target.result,
                type: file.type.startsWith('image/') ? 'image' : 'file',
                date: new Date().toISOString()
            };
            try {
                await apiCall('archive', 'insert', newFile);
                alert('?? ??? ????? ?????');
                fileInput.value = '';
                displayArchiveFiles();
            } catch (err) { alert('???: ' + err.message); }
        };
        reader.readAsDataURL(file);
    };
    window.viewArchiveFile = (stationId, index) => {
        const archiveData = apiCall('archive', 'select').then(data => {
            const file = data.find(f => f.stationId == stationId && f.id == index);
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
        });
    };
    window.deleteArchiveFile = async (stationId, index) => {
        if (confirm('?? ???? ??? ??? ??????')) {
            const archiveData = await apiCall('archive', 'select');
            const file = archiveData.find(f => f.stationId == stationId && f.id == index);
            if (file) {
                try {
                    await apiCall('archive', 'delete', null, file.id);
                    alert('?? ??? ?????');
                    displayArchiveFiles();
                } catch (err) { alert('???: ' + err.message); }
            }
        }
    };
    document.getElementById('archiveStationSelect').addEventListener('change', displayArchiveFiles);
    displayArchiveFiles();
}

async function loadUsers(container) {
    const users = await apiCall('users', 'select');
    
    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ?????????? ??????????</h4>
            <div id="userMessage" class="alert alert-info d-none"></div>
            <form id="userForm">
                <div class="row">
                    <div class="col-md-3 mb-2"><input type="text" id="userCode" class="form-control" placeholder="??? ????????" required></div>
                    <div class="col-md-3 mb-2"><input type="text" id="userName" class="form-control" placeholder="?????" required></div>
                    <div class="col-md-3 mb-2"><input type="password" id="userPass" class="form-control" placeholder="???? ??????" required></div>
                    <div class="col-md-3 mb-2"><select id="userRole" class="form-control">
                        <option value="????">???? (?? ?????????)</option>
                        <option value="???? ?????">???? ????? (??????? ????? ??? ???????)</option>
                        <option value="???? ????">???? ???? (??????? ????? ????? ????)</option>
                    </select></div>
                </div>
                <button type="submit" class="btn btn-primary mt-2">? ????? ??????</button>
            </form>
        </div>
        <div class="table-responsive mt-4">
            <table class="table table-bordered">
                <thead>
                    <tr><th>?????</th><th>?????</th><th>????????</th><th>????? ???????</th><th></th></tr>
                </thead>
                <tbody id="usersTableBody"></tbody>
            </table>
        </div>
    `;

    function showMessage(msg, isError = false) {
        const msgDiv = document.getElementById('userMessage');
        msgDiv.textContent = msg;
        msgDiv.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
        msgDiv.classList.remove('d-none');
        setTimeout(() => msgDiv.classList.add('d-none'), 3000);
    }

    function renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        users.forEach(u => {
            const row = tbody.insertRow();
            row.insertCell(0).innerText = u.username;
            row.insertCell(1).innerText = u.name;
            row.insertCell(2).innerText = u.role;
            row.insertCell(3).innerText = u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '-';
            const delCell = row.insertCell(4);
            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-sm btn-danger';
            delBtn.innerHTML = '<i class="fas fa-trash"></i> ???';
            delBtn.onclick = async () => {
                if (u.username === 'admin') {
                    showMessage('?? ???? ??? ???????? admin', true);
                    return;
                }
                if (confirm(`??? ???????? ${u.name}?`)) {
                    try {
                        await apiCall('users', 'delete', null, u.id);
                        const index = users.findIndex(us => us.id === u.id);
                        if (index !== -1) users.splice(index, 1);
                        renderUsersTable();
                        showMessage('?? ??? ???????? ?????');
                    } catch (err) {
                        showMessage('???: ' + err.message, true);
                    }
                }
            };
            delCell.appendChild(delBtn);
        });
    }

    document.getElementById('userForm').onsubmit = async function(e) {
        e.preventDefault();
        const username = document.getElementById('userCode').value.trim();
        const name = document.getElementById('userName').value.trim();
        const password = document.getElementById('userPass').value;
        const role = document.getElementById('userRole').value;

        if (!username || !name || !password) {
            showMessage('???? ?????? ??????', true);
            return;
        }

        if (users.find(u => u.username === username)) {
            showMessage('??? ???????? ????? ??????', true);
            return;
        }

        const newUser = {
            id: Date.now(),
            username: username,
            name: name,
            password: password,
            role: role,
            createdAt: new Date().toISOString()
        };

        try {
            const result = await apiCall('users', 'insert', newUser);
            users.push(result);
            renderUsersTable();
            showMessage('?? ????? ???????? ?????');
            document.getElementById('userForm').reset();
        } catch (err) {
            console.error(err);
            showMessage('??? ?? ????? ????????: ' + err.message, true);
        }
    };

    renderUsersTable();
}
async function loadReportWaterPumped(container) {
    const stations = await apiCall('stations', 'select');
    const monthlyCosts = await apiCall('monthly_costs', 'select');
    let stationOptions = '<option value="">?? ???????</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ?????? ????????</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>??????</label><select id="waterReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>?? ???</label><input type="month" id="waterFromMonth" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>??? ???</label><input type="month" id="waterToMonth" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showWaterPumpedReport()">???</button>
            <button class="btn btn-secondary mt-2" onclick="printWaterPumpedReport()">??? ?????</button>
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
        if (filtered.length === 0) { resultDiv.innerHTML = '<div class="alert alert-info">?? ???? ??????</div>'; return; }
        let totalWater = 0;
        let html = `<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>?????</th><th>??????</th><th>????? ???????</th><th>?????? (m³/h)</th><th>?????? ???????? (m³)</th></tr></thead><tbody>`;
        filtered.forEach(c => {
            const station = stations.find(s => s.id == c.stationId);
            totalWater += (c.waterPumped || 0);
            html += `<tr><td>${c.month}</td><td>${station?.name || '-'}</td><td>${c.operatingHours || 0}</td><td>${c.pumpFlow || 0}</td><td><strong>${(c.waterPumped || 0).toLocaleString()} m³</strong></td></tr>`;
        });
        html += `<tr class="table-secondary"><td colspan="4" class="text-center">????????</td><td><strong>${totalWater.toLocaleString()} m³</strong></td></tr>`;
        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;
    };
    window.printWaterPumpedReport = () => {
        const content = document.getElementById('waterPumpedReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>????? ?????? ????????</title><style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px}</style></head><body><h2>????? ?????? ????????</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

async function loadReportElectricity(container) {
    const stations = await apiCall('stations', 'select');
    const monthlyCosts = await apiCall('monthly_costs', 'select');
    let stationOptions = '<option value="">?? ???????</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    container.innerHTML = `
        <div class="form-card">
            <h4>? ????? ??????? ????????</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>??????</label><select id="elecReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>??????</label><select id="elecReportTransformer" class="form-control"><option value="">?? ????????</option></select></div>
                <div class="col-md-4 mb-2"><label>?? ???</label><input type="month" id="elecFromMonth" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>??? ???</label><input type="month" id="elecToMonth" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showElectricityReport()">???</button>
            <button class="btn btn-secondary mt-2" onclick="printElectricityReport()">??? ?????</button>
            <div id="electricityReportResult" class="mt-4"></div>
        </div>
    `;
    document.getElementById('elecReportStation').addEventListener('change', function() {
        const stationId = this.value;
        const station = stations.find(s => s.id == stationId);
        const transformerSelect = document.getElementById('elecReportTransformer');
        if (!station || !station.powerSources) { transformerSelect.innerHTML = '<option value="">?? ???? ??????</option>'; return; }
        const transformers = station.powerSources.filter(ps => ps['?????'] === '????');
        if (transformers.length) {
            transformerSelect.innerHTML = '<option value="">?? ????????</option>' + transformers.map((t, idx) => `<option value="${idx}">${t['???/??? ??????'] || `???? ${idx+1}`}</option>`).join('');
        } else {
            transformerSelect.innerHTML = '<option value="">?? ???? ??????</option>';
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
        if (filtered.length === 0) { resultDiv.innerHTML = '<div class="alert alert-info">?? ???? ??????</div>'; return; }
        let totalKwh = 0, totalCost = 0;
        let html = `<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>?????</th><th>??????</th><th>??????</th><th>????????? (kWh)</th><th>??????? (????)</th></tr></thead><tbody>`;
        filtered.forEach(c => {
            const station = stations.find(s => s.id == c.stationId);
            if (c.transformers && c.transformers.length) {
                c.transformers.forEach((t, idx) => {
                    if (transformerIdx !== '' && transformerIdx != idx) return;
                    const transformerName = (station?.powerSources?.[idx]?.['???/??? ??????']) || `???? ${idx+1}`;
                    totalKwh += (t.diff || 0);
                    totalCost += (t.cost || 0);
                    html += `<tr><td>${c.month}</td><td>${station?.name || '-'}</td><td>${transformerName}</td><td>${(t.diff || 0).toLocaleString()}</td><td>${(t.cost || 0).toLocaleString()}</td></tr>`;
                });
            }
        });
        html += `<tr class="table-secondary"><td colspan="3" class="text-center">????????</td><td>${totalKwh.toLocaleString()} kWh</td><td>${totalCost.toLocaleString()} ????</td></tr>`;
        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;
    };
    window.printElectricityReport = () => {
        const content = document.getElementById('electricityReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>????? ??????? ????????</title><style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px}</style></head><body><h2>????? ??????? ????????</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

async function loadReportWaterConsumption(container) {
    const stations = await apiCall('stations', 'select');
    const monthlyCosts = await apiCall('monthly_costs', 'select');
    let tariffs = { water: 3.5 };
    try {
        const t = await apiCall('tariffs', 'select');
        if (t && t.length) tariffs = t[0];
    } catch(e) {}
    let stationOptions = '<option value="">?? ???????</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ??????? ?????? (??????)</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>??????</label><select id="waterConsumptionStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>?? ???</label><input type="month" id="waterConsumptionFrom" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>??? ???</label><input type="month" id="waterConsumptionTo" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showWaterConsumptionReport()">???</button>
            <button class="btn btn-secondary mt-2" onclick="printWaterConsumptionReport()">??? ?????</button>
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
        if (filtered.length === 0) { resultDiv.innerHTML = '<div class="alert alert-info">?? ???? ??????</div>'; return; }
        let totalConsumed = 0, totalCost = 0;
        let html = `<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>?????</th><th>??????</th><th>????????? (m³)</th><th>??????? (????)</th></tr></thead><tbody>`;
        filtered.forEach(c => {
            const station = stations.find(s => s.id == c.stationId);
            const consumed = c.water?.consumed || 0;
            const cost = c.water?.cost || 0;
            totalConsumed += consumed;
            totalCost += cost;
            html += `<tr><td>${c.month}</td><td>${station?.name || '-'}</td><td>${consumed.toLocaleString()} m³</td><td>${cost.toLocaleString()} ????</td></tr>`;
        });
        html += `<tr class="table-secondary"><td colspan="2" class="text-center">????????</td><td>${totalConsumed.toLocaleString()} m³</td><td>${totalCost.toLocaleString()} ????</td></tr>`;
        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;
    };
    window.printWaterConsumptionReport = () => {
        const content = document.getElementById('waterConsumptionResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>????? ??????? ??????</title><style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px}</style></head><body><h2>????? ??????? ??????</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

async function loadReportDiesel(container) {
    const stations = await apiCall('stations', 'select');
    const monthlyCosts = await apiCall('monthly_costs', 'select');
    let stationOptions = '<option value="">?? ???????</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    container.innerHTML = `
        <div class="form-card">
            <h4>??? ????? ??????? ???????</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>??????</label><select id="dieselReportStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>??????</label><select id="dieselReportGenerator" class="form-control"><option value="">?? ????????</option></select></div>
                <div class="col-md-4 mb-2"><label>?? ???</label><input type="month" id="dieselFromMonth" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>??? ???</label><input type="month" id="dieselToMonth" class="form-control"></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showDieselReport()">???</button>
            <button class="btn btn-secondary mt-2" onclick="printDieselReport()">??? ?????</button>
            <div id="dieselReportResult" class="mt-4"></div>
        </div>
    `;
    document.getElementById('dieselReportStation').addEventListener('change', function() {
        const stationId = this.value;
        const station = stations.find(s => s.id == stationId);
        const generatorSelect = document.getElementById('dieselReportGenerator');
        if (!station || !station.powerSources) { generatorSelect.innerHTML = '<option value="">?? ???? ??????</option>'; return; }
        const generators = station.powerSources.filter(ps => ps['?????'] === '????');
        if (generators.length) {
            generatorSelect.innerHTML = '<option value="">?? ????????</option>' + generators.map((g, idx) => `<option value="${idx}">${g['???/??? ??????'] || `???? ${idx+1}`}</option>`).join('');
        } else {
            generatorSelect.innerHTML = '<option value="">?? ???? ??????</option>';
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
        if (filtered.length === 0) { resultDiv.innerHTML = '<div class="alert alert-info">?? ???? ??????</div>'; return; }
        let totalConsumed = 0;
        let html = `<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>?????</th><th>??????</th><th>??????</th><th>????????? (???)</th><th>?????? ??????? (???)</th></tr></thead><tbody>`;
        filtered.forEach(c => {
            const station = stations.find(s => s.id == c.stationId);
            if (c.generators && c.generators.length) {
                c.generators.forEach((g, idx) => {
                    if (generatorIdx !== '' && generatorIdx != idx) return;
                    const generatorName = (station?.powerSources?.[idx]?.['???/??? ??????']) || `???? ${idx+1}`;
                    totalConsumed += (g.consumed || 0);
                    html += `<tr><td>${c.month}</td><td>${station?.name || '-'}</td><td>${generatorName}</td><td>${(g.consumed || 0).toLocaleString()} ???</td><td>${(g.balance || 0).toLocaleString()} ???</td></tr>`;
                });
            }
        });
        html += `<tr class="table-secondary"><td colspan="3" class="text-center">?????? ?????????</td><td>${totalConsumed.toLocaleString()} ???</td><td>-</td></tr>`;
        html += `</tbody></table></div>`;
        resultDiv.innerHTML = html;
    };
    window.printDieselReport = () => {
        const content = document.getElementById('dieselReportResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>????? ??????? ???????</title><style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px}</style></head><body><h2>????? ??????? ???????</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}

async function loadReportSparePartsAdvanced(container) {
    const stations = await apiCall('stations', 'select');
    const faults = await apiCall('faults', 'select');
    const faultsWithParts = faults.filter(f => f.parts && f.parts.trim() !== '');
    let stationOptions = '<option value="">?? ???????</option>' + stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    container.innerHTML = `
        <div class="form-card">
            <h4>?? ????? ??? ?????? ?????????</h4>
            <div class="row">
                <div class="col-md-4 mb-2"><label>??????</label><select id="spareAdvancedStation" class="form-control">${stationOptions}</select></div>
                <div class="col-md-4 mb-2"><label>?? ?????</label><input type="date" id="spareAdvancedFrom" class="form-control"></div>
                <div class="col-md-4 mb-2"><label>??? ?????</label><input type="date" id="spareAdvancedTo" class="form-control"></div>
                <div class="col-md-12 mb-2"><label>??? ?? ??? ??????</label><input type="text" id="spareAdvancedSearch" class="form-control" placeholder="???? ??? ???? ??????..."></div>
            </div>
            <button class="btn btn-primary mt-2" onclick="showSparePartsAdvancedReport()">???</button>
            <button class="btn btn-secondary mt-2" onclick="printSparePartsAdvancedReport()">??? ?????</button>
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
        if (filtered.length === 0) { resultDiv.innerHTML = '<div class="alert alert-info">?? ???? ??? ???? ??????</div>'; return; }
        let html = `<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>???????</th><th>??????</th><th>????? ??????</th><th>??? ?????? ?????????</th><th>??? ?????</th><th>??????? ???????</th></tr></thead><tbody>`;
        filtered.forEach(f => {
            const station = stations.find(s => s.id == f.stationId);
            html += `<tr><td>${f.date} <td>${station?.name || '-'} <td>${f.assetName || '-'} <td class="fw-bold text-primary">${f.parts} <td>${f.type} <td>${f.actions || '-'} `;
        });
        html += `</tbody> </div>`;
        resultDiv.innerHTML = html;
    };
    window.printSparePartsAdvancedReport = () => {
        const content = document.getElementById('sparePartsAdvancedResult').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`<html dir="rtl"><head><title>????? ??? ??????</title><style>body{font-family:Tahoma;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px}</style></head><body><h2>????? ??? ?????? ?????????</h2>${content}</body></html>`);
        win.document.close();
        win.print();
    };
}
// ==================== ?????? ???????? ====================
async function loadPage(page) {
    if (!checkAuth()) return;
    
    // ????? ??????? ???????? ?? ????????
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove('active');
    }
    
    const container = document.getElementById('pageContent');
    if (!container) return;
    
    if (page === 'home') await loadHome(container);
    else if (page === 'addStation') await loadAddStation(container);
    else if (page === 'listStations') await loadListStations(container);
    else if (page === 'addEmployee') await loadAddEmployee(container);
    else if (page === 'listEmployees') await loadListEmployees(container);
    else if (page === 'addFault') await loadAddFault(container);
    else if (page === 'listFaults') await loadListFaults(container);
    else if (page === 'tariffs') await loadTariffs(container);
    else if (page === 'monthlyCosts') await loadMonthlyCosts(container);
    else if (page === 'reportDaily') await loadReportDaily(container);
    else if (page === 'reportFaults') await loadReportFaults(container);
    else if (page === 'reportStation') await loadReportStation(container);
    else if (page === 'reportAsset') await loadReportAsset(container);
    else if (page === 'reportEmployees') await loadReportEmployees(container);
    else if (page === 'reportSpareParts') await loadReportSpareParts(container);
    else if (page === 'archive') await loadArchive(container);
    else if (page === 'users') await loadUsers(container);
    else if (page === 'reportWaterPumped') await loadReportWaterPumped(container);
    else if (page === 'reportElectricity') await loadReportElectricity(container);
    else if (page === 'reportWaterConsumption') await loadReportWaterConsumption(container);
    else if (page === 'reportDiesel') await loadReportDiesel(container);
    else if (page === 'reportSparePartsAdvanced') await loadReportSparePartsAdvanced(container);
    else container.innerHTML = '<div class="alert alert-danger">???? ??? ??????</div>';
}
// ==================== ????? ?????? ????????? ====================
window.loadPage = loadPage;
window.logout = logout;

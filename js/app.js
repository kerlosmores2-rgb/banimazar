// ============================================================
//  app.js - نظام إدارة محطات الصرف الصحي
//  تمت إعادة التنظيم مع الحفاظ على جميع الوظائف
// ============================================================

// ==================== إعدادات Supabase (نفس السابق) ====================
const SUPABASE_URL = 'https://pbzpumetrmirnsshjdoe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_O9BKPIjk5xXvbGNjvsBXVw_9V_TIoUu';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabaseClient = supabaseClient;

// ==================== دالة مساعدة للتواصل مع Supabase ====================
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
        console.error(`خطأ في apiCall (${table}, ${action}):`, err);
        throw err;
    }
}

// ==================== دوال المصادقة والجلسة ====================
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
// التحقق من صلاحية المستخدم
function canEdit() {
    const user = getCurrentUser();
    return user && user.role !== 'عرض فقط';
}

function canAdd() {
    const user = getCurrentUser();
    return user && user.role !== 'عرض فقط';
}

function canDelete() {
    const user = getCurrentUser();
    return user && user.role !== 'عرض فقط';
}

// ==================== دوال HTML المساعدة (لإضافة الأصول الديناميكية) ====================
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

// ==================== دوال المحطات ====================
async function loadHome(container) {
    const stations = await apiCall('stations', 'select');
    const employees = await apiCall('employees', 'select');
    const faults = await apiCall('faults', 'select');
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

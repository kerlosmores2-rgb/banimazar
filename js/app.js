// ==================== إعدادات Supabase ====================
const SUPABASE_URL = 'https://pbzpumetrmirnsshjdoe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_O9BKPIjk5xXvbGNjvsBXVw_9V_TIoUu';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabaseClient = supabaseClient;

// ==================== دوال المصادقة ====================
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

// ==================== دوال الصلاحيات ====================
function canAdd() {
    const user = getCurrentUser();
    return user && user.role !== 'عرض فقط';
}

function canEdit() {
    const user = getCurrentUser();
    return user && user.role !== 'عرض فقط';
}

function canDelete() {
    const user = getCurrentUser();
    return user && user.role !== 'عرض فقط';
}

// ==================== دالة مساعدة ====================
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
        return null;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// ==================== الصفحة الرئيسية ====================
async function loadHome(container) {
    const stations = await apiCall('stations', 'select');
    container.innerHTML = `
        <div class="row">
            <div class="col-md-12">
                <div class="form-card">
                    <h4>مرحباً بك</h4>
                    <p>نظام إدارة محطات رفع الصرف الصحي - بني مزار</p>
                    <p>عدد المحطات: ${stations.length}</p>
                    <small>آخر تحديث: ${new Date().toLocaleDateString('ar-EG')}</small>
                </div>
            </div>
        </div>
    `;
}

// ==================== الدالة الرئيسية ====================
async function loadPage(page) {
    console.log('loadPage called:', page);
    if (!checkAuth()) return;
    
    const container = document.getElementById('pageContent');
    if (!container) return;
    
    if (page === 'home') {
        await loadHome(container);
    } else {
        container.innerHTML = '<div class="alert alert-info">صفحة قيد التطوير: ' + page + '</div>';
    }
}

// ==================== دوال القائمة ====================
function toggleSubMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

// ==================== تصدير الدوال ====================
window.loadPage = loadPage;
window.logout = logout;
window.toggleSubMenu = toggleSubMenu;
window.canAdd = canAdd;
window.canEdit = canEdit;
window.canDelete = canDelete;

console.log('✅ app.js loaded successfully');

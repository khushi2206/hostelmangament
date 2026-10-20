const app = document.getElementById('app');
let user = null;
try {
  user = JSON.parse(localStorage.getItem('hostelhub_user') || 'null');
} catch {
  localStorage.removeItem('hostelhub_user');
  localStorage.removeItem('hostelhub_token');
}
let token = localStorage.getItem('hostelhub_token') || '';
let page = 'dashboard';
let editing = null;
let detail = null;

const studentNav = [
  ['dashboard','Dashboard'],['profile','Profile'],['room','My room'],['leaves','Leaves'],
  ['visitors','Visitors'],['complaints','Complaints'],['fees','Fees'],['notices','Notices'],
  ['mess','Mess'],['laundry','Laundry'],['lost-found','Lost and found']
];
const adminNav = [
  ['dashboard','Dashboard'],['students','Students'],['rooms','Rooms and allocation'],['leaves','Leaves'],
  ['visitors','Visitors'],['complaints','Complaints'],['fees','Fees'],['notices','Notices']
];

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

async function api(path, method = 'GET', data) {
  const response = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(data === undefined ? {} : { body: JSON.stringify(data) })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) logout(false);
    throw new Error(result.message || 'Request failed.');
  }
  return result;
}

function showLogin(message = '') {
  app.innerHTML = `<main class="login-wrap"><h1>HostelHub</h1><p>Sign in to your account</p>
    ${message ? `<p class="alert alert-danger">${esc(message)}</p>` : ''}
    <form data-form="login" class="record-form"><div class="form-field"><label for="login">Email or enrollment number</label>
      <input id="login" class="form-control" name="email" autocomplete="username" required></div>
      <div class="form-field"><label for="password">Password</label><input id="password" class="form-control" name="password" type="password" autocomplete="current-password" required></div>
      <button class="btn btn-primary">Sign in</button></form></main>`;
}

function logout(callApi = true) {
  if (callApi && token) fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + token } }).catch(() => {});
  token = ''; user = null; localStorage.removeItem('hostelhub_token'); localStorage.removeItem('hostelhub_user');
  showLogin();
}

function openPage(nextPage) {
  page = nextPage; editing = null; detail = null; drawShell(); loadPage();
}

function drawShell() {
  if (!user) return showLogin();
  const nav = user.role === 'admin' ? adminNav : studentNav;
  const initials = String(user.name || user.email || 'U').slice(0, 1).toUpperCase();
  app.innerHTML = `<div class="app-shell"><aside class="sidebar"><a class="brand" href="#" data-page="dashboard">HostelHub</a><nav class="nav-list" aria-label="Main navigation">${nav.map(([key,label]) => `<button class="nav-button ${page === key ? 'active' : ''}" data-page="${key}"><i class="bi ${navIcon(key)}"></i><span>${label}</span></button>`).join('')}</nav></aside>
    <section class="main-area"><header class="topbar"><h1>${esc(nav.find(item => item[0] === page)?.[1] || 'HostelHub')}</h1><div class="user-info"><span class="avatar">${esc(initials)}</span><span>${esc(user.email || user.name)}</span><button class="btn btn-sm btn-outline-secondary" data-action="logout">Sign out</button></div></header>
    <main id="content" class="content"><p>Loading…</p></main></section></div>`;
}

function navIcon(key) {
  return ({dashboard:'bi-house',profile:'bi-person',room:'bi-door-open',leaves:'bi-calendar-event',visitors:'bi-person-badge',complaints:'bi-tools',fees:'bi-cash-coin',notices:'bi-megaphone',mess:'bi-cup-hot',laundry:'bi-basket', 'lost-found':'bi-search',students:'bi-people',rooms:'bi-building'})[key] || 'bi-circle';
}

function panel(title, body) {
  return `<section class="panel"><h2 class="section-title">${title}</h2>${body}</section>`;
}

function field(name, label, type = 'text', value = '', required = true, options = null, hint = '') {
  const val = esc(value);
  const id = `field-${name}`;
  const labelText = `${esc(label)}${required ? '<span class="required-mark" aria-hidden="true"> *</span>' : ''}`;
  const helper = hint ? `<div class="form-text" id="hint-${name}">${esc(hint)}</div>` : '';
  const describedBy = hint ? `aria-describedby="hint-${name}"` : '';
  if (options) {
    const placeholder = `<option value="" disabled ${value === '' ? 'selected' : ''}>Select ${esc(label.toLowerCase())}</option>`;
    const choices = options.map(([optionValue, text]) => `<option value="${esc(optionValue)}" ${String(optionValue) === String(value) ? 'selected' : ''}>${esc(text)}</option>`).join('');
    return `<div class="form-field"><label class="form-label" for="${id}">${labelText}</label><select id="${id}" class="form-select" name="${name}" ${required ? 'required' : ''} ${describedBy}>${placeholder}${choices}</select>${helper}</div>`;
  }
  if (type === 'textarea') return `<div class="form-field"><label class="form-label" for="${id}">${labelText}</label><textarea id="${id}" class="form-control" name="${name}" ${required ? 'required' : ''} ${describedBy}>${val}</textarea>${helper}</div>`;
  const passwordRules = name === 'password' ? 'minlength="6" autocomplete="new-password"' : '';
  return `<div class="form-field"><label class="form-label" for="${id}">${labelText}</label><input id="${id}" class="form-control" name="${name}" type="${type}" value="${val}" ${required ? 'required' : ''} ${describedBy} ${passwordRules}>${helper}</div>`;
}

function formBox(title, key, fields, button, wide = false) {
  return panel(title, `<form data-form="${key}" class="record-form">${fields.join('')}<div><button class="btn btn-primary">${button}</button> ${editing ? '<button type="button" class="btn btn-outline-secondary" data-action="cancel-edit">Cancel</button>' : ''}</div></form>`);
}

function recordCards(headers, rows, renderRow) {
  if (!rows.length) return '<p class="text-secondary mb-0">No records found.</p>';
  const icon = ({Student:'bi-person-fill',Name:'bi-person-fill',Visitor:'bi-person-badge',Room:'bi-door-open-fill',Title:'bi-megaphone',Category:'bi-tools',Type:'bi-calendar-event',Amount:'bi-cash-coin',Day:'bi-calendar3'})[headers[0]] || 'bi-card-text';
  const cards = rows.map(row => {
    const template = document.createElement('template');
    template.innerHTML = renderRow(row);
    const cells = [...template.content.querySelectorAll('td')];
    if (!cells.length) return '';
    const values = cells.map(cell => ({html:cell.innerHTML, text:cell.textContent.trim()}));
    const statusIndex = values.findIndex(value => ['Pending','In Progress','Approved','Resolved','Rejected','Paid','Partial','Due','Active','Inactive','Open','Closed'].includes(value.text));
    const actionIndex = values.findIndex(value => /<button|<select/.test(value.html));
    const title = values[0].html;
    const details = values.map((value, index) => index === 0 || index === statusIndex || index === actionIndex ? '' : `<span><small>${esc(headers[index] || '')}</small>${value.html}</span>`).join('');
    const status = statusIndex < 0 ? '' : `<span class="badge ${statusClass(values[statusIndex].text)}">${esc(values[statusIndex].text)}</span>`;
    const actions = actionIndex < 0 ? '' : values[actionIndex].html;
    return `<article class="record-card"><div class="record-icon"><i class="bi ${icon}"></i></div><div class="record-info"><h3>${title}</h3><div class="record-details">${details}</div></div><div class="record-actions">${status}${actions}</div></article>`;
  }).join('');
  return `<div class="record-list">${cards}</div>`;
}

function statusClass(status) {
  if (status === 'Pending') return 'text-bg-warning';
  if (status === 'Rejected') return 'text-bg-danger';
  if (['Approved','Resolved','Paid','Active','Closed'].includes(status)) return 'text-bg-success';
  if (status === 'In Progress') return 'badge-teal';
  return 'text-bg-secondary';
}

function button(action, id, label, style = 'outline-primary') {
  const variant = style === 'success' ? 'success' : style.includes('danger') ? 'danger' : style.includes('secondary') ? 'outline-secondary' : 'outline-primary';
  return `<button class="btn btn-sm btn-${variant} me-1 mb-1" data-action="${action}" data-id="${esc(id)}">${label}</button>`;
}

function alertText(message, type = 'info') { return `<div class="alert alert-${type}">${esc(message)}</div>`; }
function dateText(value) { return value ? esc(String(value).slice(0, 10)) : '—'; }
function amount(value) { return '₹' + Number(value || 0).toLocaleString('en-IN'); }

async function loadPage() {
  const target = document.getElementById('content');
  if (!target) return;
  target.innerHTML = '<p class="text-secondary">Loading…</p>';
  try {
    const html = user.role === 'admin' ? await loadAdminPage() : await loadStudentPage();
    if (document.getElementById('content')) target.innerHTML = html;
  } catch (error) {
    if (document.getElementById('content')) target.innerHTML = alertText(error.message, 'danger');
  }
}

async function loadStudentPage() {
  if (page === 'dashboard') {
    const d = await api('/student/dashboard');
    return `<h1 class="h3">Welcome, ${esc(d.student?.name || user.email)}</h1><p class="text-secondary">Your hostel summary</p><div class="row g-3 mb-4">
      ${stat('Room', d.room ? `${d.room.block} ${d.room.room_number}` : 'Not allocated')}${stat('Latest leave', d.latestLeaveStatus || 'No requests')}${stat('Fee balance', d.feeStatus ? amount(d.feeStatus.remaining) : 'No fee record')}</div>
      ${panel('Recent notices', recordCards(['Title','Date','Notice'], d.recentNotices || [], n => `<tr><td>${esc(n.title)}</td><td>${dateText(n.created_at)}</td><td>${esc(n.description)}</td></tr>`))}`;
  }
  if (page === 'profile') {
    const p = await api('/student/profile');
    return `<h1 class="h3 mb-2">My profile</h1><p class="page-help">Complete your academic and contact details. Your email is managed by the hostel admin.</p>${formBox('Personal and academic details','profile',[
      field('name','Full name','text',p.name),field('enrollment_no','Enrollment number','text',p.enrollment_no || ''),field('email','Email','email',p.email,false),
      field('course','Course','text',p.course || ''),field('semester','Semester','number',p.semester || '',true),field('department','Department','text',p.department || ''),
      field('dob','Date of birth','date',p.dob ? String(p.dob).slice(0,10) : '',false),field('phone','Phone','tel',p.phone || '',false),field('address','Address','textarea',p.address || '',false),field('emergency_contact','Emergency contact','tel',p.emergency_contact || '',false)
    ],'Save profile')}`;
  }
  if (page === 'room') {
    const [data, changes] = await Promise.all([api('/student/room'), api('/student/room-change')]);
    const room = data.room;
    const roomInfo = room ? `<p><strong>Room:</strong> ${esc(room.block)}-${esc(room.room_number)} · Floor ${esc(room.floor)} · ${esc(room.occupied)}/${esc(room.capacity)} residents</p><h3 class="h6">Roommates</h3><div class="record-list">${(data.roommates || []).map(s => `<article class="record-card"><div class="record-icon"><i class="bi bi-person-fill"></i></div><div class="record-info"><h3>${esc(s.name)}</h3><div class="record-details"><span>${esc(s.enrollment_no)}</span></div></div></article>`).join('') || '<p>No roommates listed.</p>'}</div>` : '<p>You do not have a room allocation.</p>';
    return `<h1 class="h3 mb-3">My room</h1>${panel('Room details',roomInfo)}${formBox('Request a room change','room-change',[field('reason','Reason','textarea')],'Submit request')}${panel('Previous requests',recordCards(['Reason','Status','Date'],changes,r=>`<tr><td>${esc(r.reason)}</td><td>${esc(r.status)}</td><td>${dateText(r.created_at)}</td></tr>`))}`;
  }
  if (page === 'leaves') {
    const rows = await api('/student/leaves');
    return `<h1 class="h3 mb-3">Leave requests</h1>${formBox('New request','leave',[field('leave_type','Type','text','Outing',true,[['Outing','Outing'],['Home Leave','Home Leave']]),field('from_date','From','date'),field('to_date','To','date'),field('reason','Reason','textarea')],'Submit request')}${panel('My requests',recordCards(['Type','Dates','Reason','Status',''],rows,r=>`<tr><td>${esc(r.leave_type)}</td><td>${dateText(r.from_date)} – ${dateText(r.to_date)}</td><td>${esc(r.reason)}</td><td>${esc(r.status)}</td><td>${r.status === 'Pending' ? button('delete-leave',r.leave_id,'Cancel','outline-danger') : ''}</td></tr>`))}`;
  }
  if (page === 'visitors') {
    const rows = await api('/student/visitors');
    return `<h1 class="h3 mb-3">Visitors</h1>${formBox('Register a visitor','student-visitor',[field('visitor_name','Visitor name'),field('relation','Relation','text','',false),field('phone','Phone','tel','',false),field('visit_date','Visit date','date'),field('visit_time','Visit time','time')],'Register visitor')}${panel('My visitors',recordCards(['Name','Relation','Visit date','Time','Status'],rows,r=>`<tr><td>${esc(r.visitor_name)}</td><td>${esc(r.relation)}</td><td>${dateText(r.visit_date)}</td><td>${esc(r.visit_time)}</td><td>${esc(r.status)}</td></tr>`))}`;
  }
  if (page === 'complaints') {
    const rows = await api('/student/complaints');
    return `<h1 class="h3 mb-3">Complaints</h1>${formBox('Submit a complaint','student-complaint',[field('category','Category','text','Electrical',true,['Electrical','Plumbing','Cleaning','Wi-Fi','Furniture','Other'].map(x=>[x,x])),field('description','Description','textarea')],'Submit complaint')}${panel('My complaints',recordCards(['Category','Description','Status','Date'],rows,r=>`<tr><td>${esc(r.category)}</td><td>${esc(r.description)}</td><td>${esc(r.status)}</td><td>${dateText(r.created_date)}</td></tr>`))}`;
  }
  if (page === 'fees') {
    const rows = await api('/student/fees');
    return `<h1 class="h3 mb-3">Fees</h1>${panel('Fee records',recordCards(['Amount','Paid','Remaining','Status'],rows,r=>`<tr><td>${amount(r.amount)}</td><td>${amount(r.paid_amount)}</td><td>${amount(r.remaining_amount)}</td><td>${esc(r.status)}</td></tr>`))}`;
  }
  if (page === 'notices') {
    const rows = await api('/student/notices');
    return `<h1 class="h3 mb-3">Notices</h1>${panel('Hostel notices',recordCards(['Title','Date','Details'],rows,r=>`<tr><td>${esc(r.title)}</td><td>${dateText(r.created_at)}</td><td>${esc(r.description)}</td></tr>`))}`;
  }
  if (page === 'mess') {
    const [menu, outs] = await Promise.all([api('/student/mess/menu'),api('/student/mess/opt-out')]);
    return `<h1 class="h3 mb-3">Mess</h1>${panel('Weekly menu',recordCards(['Day','Meal','Menu'],menu,r=>`<tr><td>${esc(r.day_of_week)}</td><td>${esc(r.meal_type)}</td><td>${esc(r.items)}</td></tr>`))}${formBox('Opt out of a meal','opt-out',[field('opt_date','Date','date'),field('meal_type','Meal','text','',true,[['Breakfast','Breakfast'],['Lunch','Lunch'],['Dinner','Dinner']])],'Submit')}${panel('Meal opt-outs',recordCards(['Date','Meal'],outs,r=>`<tr><td>${dateText(r.opt_date)}</td><td>${esc(r.meal_type)}</td></tr>`))}`;
  }
  if (page === 'laundry') {
    const rows = await api('/student/laundry');
    return `<h1 class="h3 mb-3">Laundry</h1>${formBox('Request laundry','laundry',[field('clothes_count','Number of clothes','number')],'Submit request')}${panel('My requests',recordCards(['Count','Date','Status'],rows,r=>`<tr><td>${esc(r.clothes_count)}</td><td>${dateText(r.request_date)}</td><td>${esc(r.status)}</td></tr>`))}`;
  }
  if (page === 'lost-found') {
    const rows = await api('/student/lost-found');
    return `<h1 class="h3 mb-3">Lost and found</h1>${formBox('Report an item','lost-found',[field('type','Report type','text','Lost',true,[['Lost','Lost'],['Found','Found']]),field('item_name','Item name'),field('location','Location','text','',false),field('description','Description','textarea')],'Submit report')}${panel('Reported items',recordCards(['Type','Item','Details','Location','Reported by','Status'],rows,r=>`<tr><td>${esc(r.type)}</td><td>${esc(r.item_name)}</td><td>${esc(r.description)}</td><td>${esc(r.location)}</td><td>${esc(r.student_name)}</td><td>${esc(r.status)}</td></tr>`))}`;
  }
  return '<h1 class="h3">Hostel Hub</h1>';
}

function stat(title, value) { return `<div class="col-md-4"><div class="stat"><div class="small text-secondary">${title}</div><div class="h4 mb-0">${esc(value)}</div></div></div>`; }

async function loadAdminPage() {
  if (page === 'dashboard') {
    const response = await api('/admin/dashboard'); const d = response.data || {};
    return `<h1 class="h3 mb-3">Admin dashboard</h1><div class="row g-3">${stat('Students',d.students?.total || 0)}${stat('Rooms',d.rooms?.total || 0)}${stat('Available beds',d.rooms?.availableBeds || 0)}${stat('Pending leaves',d.leaves?.pending || 0)}${stat('Pending visitors',d.visitors?.pending || 0)}${stat('Open complaints',d.complaints?.pending || 0)}</div>`;
  }
  if (page === 'students') return adminStudents();
  if (page === 'rooms') return adminRooms();
  if (page === 'leaves') {
    const rows = await api('/admin/leaves');
    return `<h1 class="h3 mb-3">Leave requests</h1>${panel('Requests',recordCards(['Student','Type','Dates','Reason','Status',''],rows,r=>`<tr><td>${esc(r.student_name)}<br><small>${esc(r.enrollment_no)}</small></td><td>${esc(r.leave_type)}</td><td>${dateText(r.from_date)} – ${dateText(r.to_date)}</td><td>${esc(r.reason)}</td><td>${esc(r.status)}</td><td>${r.status === 'Pending' ? button('leave-status',r.leave_id,'Approve','success')+button('leave-reject',r.leave_id,'Reject','outline-danger') : ''}</td></tr>`))}`;
  }
  if (page === 'visitors') return adminVisitors();
  if (page === 'complaints') {
    const response = await api('/admin/complaints'); const rows = response.complaints || [];
    return `<h1 class="h3 mb-3">Complaints</h1>${panel('Requests',recordCards(['Student','Category','Description','Status','Update'],rows,r=>`<tr><td>${esc(r.student_name)}</td><td>${esc(r.category)}</td><td>${esc(r.description)}</td><td>${esc(r.status)}</td><td><select class="form-select form-select-sm" data-complaint="${r.complaint_id}">${['Pending','In Progress','Resolved'].map(status=>`<option ${status===r.status?'selected':''}>${status}</option>`).join('')}</select><button class="btn btn-sm btn-success mt-1" data-action="save-complaint" data-id="${r.complaint_id}">Save</button></td></tr>`))}`;
  }
  if (page === 'fees') {
    const response = await api('/admin/fees'); const rows = response.fees || [];
    return `<h1 class="h3 mb-3">Fees</h1>${panel('Fee records',recordCards(['Student','Enrollment','Amount','Paid','Remaining','Status'],rows,r=>`<tr><td>${esc(r.student_name)}</td><td>${esc(r.enrollment_no)}</td><td>${amount(r.total_amount)}</td><td>${amount(r.paid_amount)}</td><td>${amount(r.remaining_amount)}</td><td>${esc(r.fee_status)}</td></tr>`))}`;
  }
  if (page === 'notices') return adminNotices();
  return '<h1 class="h3">Admin portal</h1>';
}

async function adminStudents() {
  const rows = await api('/admin/students');
  const fields = [field('name','Student name'),field('email','Student email','email'),field('password','Initial password','password','',true,null,'Required. Use at least 6 characters.')];
  return `<h1 class="h3 mb-2">Students</h1>${formBox('Create student account','admin-student',fields,'Create account')}${detail ? panel('Student details',`<p>${esc(detail.name)} · ${esc(detail.enrollment_no || 'Profile incomplete')} · ${esc(detail.course || 'Course not entered')} · ${esc(detail.email)}</p>`) : ''}${panel('Student list',recordCards(['Name','Email','Enrollment','Course','Semester','Room','Actions'],rows,r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.email)}</td><td>${esc(r.enrollment_no || 'Profile pending')}</td><td>${esc(r.course || '—')}</td><td>${esc(r.semester || '—')}</td><td>${r.room_number ? `${esc(r.block)}-${esc(r.room_number)}` : 'Unallocated'}</td><td>${button('view-student',r.student_id,'View','outline-secondary')}${button('delete-student',r.student_id,'Delete','outline-danger')}</td></tr>`))}`;
}

async function adminRooms() {
  const [rooms, students, allocationStudents] = await Promise.all([api('/admin/rooms'),api('/admin/allocation/students'),api('/admin/allocation/rooms')]);
  const r = editing?.type === 'room' ? editing.row : {};
  const roomFields = [field('room_number','Room number','text',r.room_number),field('block','Block','text',r.block),field('floor','Floor','number',r.floor),field('capacity','Capacity','number',r.capacity)];
  const unassigned = students.filter(s => !s.room_id);
  const allocationFields = [field('student_id','Unassigned student','text','',true,unassigned.map(s=>[s.student_id,`${s.name} (${s.enrollment_no})`])),field('room_id','Room with available beds','text','',true,allocationStudents.map(room=>[room.room_id,`${room.block}-${room.room_number} (${room.available_beds} beds left)`])),field('bed_label','Bed label','text','',true,null,'Enter a free bed label, such as A1 or B2.')];
  const assigned = students.filter(s => s.room_id);
  const allocation = unassigned.length && allocationStudents.length
    ? formBox('Allocate a room','allocation',allocationFields,'Allocate')
    : panel('Allocate a room','<p class="text-secondary mb-0">Add a student and a room with available beds before creating an allocation.</p>');
  return `<h1 class="h3 mb-2">Rooms and allocation</h1><p class="page-help">Add rooms, then assign unallocated students to available beds. Create the student login from the Students page first.</p>${formBox(r.room_id ? 'Edit room' : 'Add room','admin-room',roomFields,r.room_id ? 'Save room' : 'Add room')}${allocation}${panel('Rooms',recordCards(['Room','Block','Floor','Capacity','Occupied','Actions'],rooms,row=>`<tr><td>${esc(row.room_number)}</td><td>${esc(row.block)}</td><td>${esc(row.floor)}</td><td>${esc(row.capacity)}</td><td>${esc(row.occupied)}</td><td>${button('edit-room',row.room_id,'Edit')}${button('delete-room',row.room_id,'Delete','outline-danger')}</td></tr>`))}${panel('Current allocations',recordCards(['Student','Enrollment','Room','Bed',''],assigned,s=>`<tr><td>${esc(s.name)}</td><td>${esc(s.enrollment_no)}</td><td>${esc(s.block)}-${esc(s.room_number)}</td><td>${esc(s.bed_label)}</td><td>${button('vacate-room',s.student_id,'Vacate','outline-danger')}</td></tr>`))}`;
}

async function adminVisitors() {
  const [rows, students] = await Promise.all([api('/admin/visitors'),api('/admin/students')]);
  return `<h1 class="h3 mb-3">Visitors</h1>${formBox('Register a visitor','admin-visitor',[field('student_id','Student','text','',true,students.map(s=>[s.student_id,`${s.name} (${s.enrollment_no})`])),field('visitor_name','Visitor name'),field('relation','Relation','text','',false),field('phone','Phone','tel','',false),field('visit_date','Visit date','date'),field('visit_time','Visit time','time')],'Register visitor')}${panel('Visitor list',recordCards(['Visitor','Student','Date','Time','Status',''],rows,r=>`<tr><td>${esc(r.visitor_name)}</td><td>${esc(r.student_name)}</td><td>${dateText(r.visit_date)}</td><td>${esc(r.visit_time)}</td><td>${esc(r.status)}</td><td>${r.status === 'Pending' ? button('approve-visitor',r.visitor_id,'Approve','success') : ''}</td></tr>`))}`;
}

async function adminNotices() {
  const response = await api('/admin/notices'); const rows = response.notices || [];
  const n = editing?.type === 'notice' ? editing.row : {};
  return `<h1 class="h3 mb-3">Notices</h1>${formBox(n.notice_id ? 'Edit notice' : 'Add notice','admin-notice',[field('title','Title','text',n.title),field('description','Description','textarea',n.description)],n.notice_id ? 'Save notice' : 'Publish notice')}${panel('Published notices',recordCards(['Title','Description','Date','Actions'],rows,r=>`<tr><td>${esc(r.title)}</td><td>${esc(r.description)}</td><td>${dateText(r.created_at)}</td><td>${button('edit-notice',r.notice_id,'Edit')}${button('delete-notice',r.notice_id,'Delete','outline-danger')}</td></tr>`))}`;
}

function formData(form) { return Object.fromEntries(new FormData(form).entries()); }

async function submitForm(form) {
  const data = formData(form); const kind = form.dataset.form;
  if (kind === 'login') {
    const result = await api('/auth/login','POST',data); token = result.token; user = result.user;
    localStorage.setItem('hostelhub_token',token); localStorage.setItem('hostelhub_user',JSON.stringify(user)); openPage('dashboard'); return;
  }
  if (kind === 'profile') await api('/student/profile','PUT',data);
  if (kind === 'room-change') await api('/student/room-change','POST',data);
  if (kind === 'leave') await api('/student/leaves','POST',data);
  if (kind === 'student-visitor') await api('/student/visitors','POST',data);
  if (kind === 'student-complaint') await api('/student/complaints','POST',data);
  if (kind === 'opt-out') await api('/student/mess/opt-out','POST',data);
  if (kind === 'laundry') await api('/student/laundry','POST',data);
  if (kind === 'lost-found') await api('/student/lost-found','POST',data);
  if (kind === 'admin-student') await api('/admin/students' + (editing?.type === 'student' ? '/' + editing.row.student_id : ''),editing?.type === 'student' ? 'PUT' : 'POST',data);
  if (kind === 'admin-room') await api('/admin/rooms' + (editing?.type === 'room' ? '/' + editing.row.room_id : ''),editing?.type === 'room' ? 'PUT' : 'POST',data);
  if (kind === 'allocation') await api('/admin/allocation','POST',data);
  if (kind === 'admin-visitor') await api('/admin/visitors','POST',data);
  if (kind === 'admin-notice') await api('/admin/notices' + (editing?.type === 'notice' ? '/' + editing.row.notice_id : ''),editing?.type === 'notice' ? 'PUT' : 'POST',data);
  editing = null; await loadPage();
}

app.addEventListener('submit', async event => {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  try { await submitForm(form); }
  catch (error) { const content = document.getElementById('content'); if (content) content.insertAdjacentHTML('afterbegin', alertText(error.message,'danger')); else showLogin(error.message); }
});

app.addEventListener('click', async event => {
  const nav = event.target.closest('[data-page]');
  if (nav) return openPage(nav.dataset.page);
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, id } = target.dataset;
  try {
    if (action === 'logout') return logout();
    if (action === 'cancel-edit') { editing = null; detail = null; return loadPage(); }
    if (action === 'view-student') { detail = await api('/admin/students/' + id); return loadPage(); }
    if (action === 'edit-student') { editing = {type:'student',row:await api('/admin/students/' + id)}; return loadPage(); }
    if (action === 'delete-student' && confirm('Delete this student?')) await api('/admin/students/' + id,'DELETE');
    if (action === 'edit-room') { editing = {type:'room',row:await api('/admin/rooms/' + id)}; return loadPage(); }
    if (action === 'delete-room' && confirm('Delete this room?')) await api('/admin/rooms/' + id,'DELETE');
    if (action === 'vacate-room' && confirm('Vacate this student from the room?')) await api('/admin/allocation/' + id,'DELETE');
    if (action === 'delete-leave' && confirm('Cancel this pending leave request?')) await api('/student/leaves/' + id,'DELETE');
    if (action === 'leave-status') await api('/admin/leaves/' + id + '/status','PUT',{status:'Approved'});
    if (action === 'leave-reject') { const comment = prompt('Reason (optional):',''); if (comment !== null) await api('/admin/leaves/' + id + '/status','PUT',{status:'Rejected',admin_comment:comment}); }
    if (action === 'approve-visitor') await api('/admin/visitors/' + id + '/status','PUT',{status:'Approved'});
    if (action === 'save-complaint') { const select = document.querySelector(`[data-complaint="${CSS.escape(id)}"]`); await api('/admin/complaints/' + id + '/status','PUT',{status:select.value}); }
    if (action === 'edit-notice') { const response = await api('/admin/notices/' + id); editing = {type:'notice',row:response.notice}; return loadPage(); }
    if (action === 'delete-notice' && confirm('Delete this notice?')) await api('/admin/notices/' + id,'DELETE');
    await loadPage();
  } catch (error) {
    const content = document.getElementById('content'); if (content) content.insertAdjacentHTML('afterbegin', alertText(error.message,'danger'));
  }
});

if (user && token) { drawShell(); loadPage(); } else showLogin();

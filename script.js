const $ = (id) => document.getElementById(id);
const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
const dayIndex = (new Date().getDay() + 6) % 7;
const todayName = DAYS[dayIndex];
// Parafrasa singkat ayat; referensi Alkitab dicantumkan agar dapat dibaca lengkap di Alkitab.
const dailyVerses = [
  {text:'Jangan takut, sebab Tuhan menyertai dan menguatkanmu.',ref:'Yesaya 41:10'},
  {text:'Serahkan rencanamu kepada Tuhan dan percayakan langkahmu kepada-Nya.',ref:'Amsal 16:3'},
  {text:'Mintalah hikmat kepada Tuhan; Dia memberi dengan murah hati.',ref:'Yakobus 1:5'},
  {text:'Kerjakan segala sesuatu dengan sungguh-sungguh seperti untuk Tuhan.',ref:'Kolose 3:23'},
  {text:'Tuhan adalah kekuatanmu; tetaplah berharap kepada-Nya.',ref:'Yesaya 40:31'},
  {text:'Jangan kuatir berlebihan; bawalah permohonanmu dalam doa.',ref:'Filipi 4:6-7'},
  {text:'Jangan jemu melakukan yang baik; pada waktunya akan ada hasil.',ref:'Galatia 6:9'}
];
function renderDailyVerse(){
  const start=new Date(new Date().getFullYear(),0,0);const day=Math.floor((new Date()-start)/86400000);
  const verse=dailyVerses[day%dailyVerses.length];
  const textEl=$('dailyVerseText'),refEl=$('dailyVerseRef');
  if(textEl)textEl.textContent='“'+verse.text+'”';
  if(refEl)refEl.textContent=verse.ref;
}
const todayISO = localDate(new Date());
const defaultSchedule = [
  {id:1,day:'Senin',time:'07:00',title:'Upacara & wali kelas',subject:'Sekolah',description:'Awali minggu dengan tertib'},
  {id:2,day:'Senin',time:'08:30',title:'Matematika',subject:'Matematika',description:'Fungsi dan latihan soal'},
  {id:3,day:'Senin',time:'10:15',title:'Bahasa Indonesia',subject:'Bahasa Indonesia',description:'Materi dan diskusi'},
  {id:4,day:'Senin',time:'13:00',title:'Fisika',subject:'Fisika',description:'Pembahasan konsep'},
  {id:5,day:'Selasa',time:'07:00',title:'Bahasa Inggris',subject:'Bahasa Inggris',description:'Reading & vocabulary'},
  {id:6,day:'Selasa',time:'09:15',title:'Kimia',subject:'Kimia',description:'Konsep dan latihan'},
  {id:7,day:'Rabu',time:'07:00',title:'Biologi',subject:'Biologi',description:'Materi pembelajaran'},
  {id:8,day:'Rabu',time:'10:15',title:'Matematika',subject:'Matematika',description:'Latihan soal'},
  {id:9,day:'Kamis',time:'08:30',title:'Sejarah',subject:'Sejarah',description:'Diskusi kelas'},
  {id:10,day:'Kamis',time:'11:00',title:'Informatika',subject:'Informatika',description:'Praktik komputer'},
  {id:11,day:'Jumat',time:'07:00',title:'Pendidikan Jasmani',subject:'PJOK',description:'Kegiatan olahraga'},
  {id:12,day:'Jumat',time:'09:15',title:'Bahasa Indonesia',subject:'Bahasa Indonesia',description:'Literasi'}
];
const initialTasks = [
  {id:101,title:'Mengerjakan latihan matematika',subject:'Matematika',due:addDays(1),description:'Selesaikan soal latihan yang diberikan guru.',done:false},
  {id:102,title:'Membaca materi untuk pelajaran fisika',subject:'Fisika',due:addDays(2),description:'Buat catatan singkat tentang konsep utama.',done:false},
  {id:103,title:'Menyusun rangkuman sejarah',subject:'Sejarah',due:addDays(3),description:'Ambil poin penting dari buku catatan.',done:true}
];
const initialReminders = [
  {id:201,title:'Siapkan perlengkapan sekolah',date:todayISO,time:'19:30',description:'Cek buku, alat tulis, dan tugas untuk besok.'},
  {id:202,title:'Istirahat dari layar',date:todayISO,time:'21:00',description:'Beri waktu mata dan pikiran untuk beristirahat.'},
  {id:203,title:'Isi botol minum',date:addDays(1),time:'06:30',description:'Jangan lupa bawa air minum.'}
];
function addDays(n){const d=new Date();d.setDate(d.getDate()+n);return localDate(d)}
function localDate(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function load(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return Array.isArray(v)?v:fallback}catch{return fallback}}
let tasks=load('ruangsiswa_tasks',initialTasks), schedule=load('ruangsiswa_schedule',defaultSchedule), reminders=load('ruangsiswa_reminders',initialReminders);
let selectedDay=todayName, taskFilter='all', timerSeconds=1500, timerRunning=false, timerInterval=null;
let calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1), calendarSelected=localDate(new Date());
function save(){localStorage.setItem('ruangsiswa_tasks',JSON.stringify(tasks));localStorage.setItem('ruangsiswa_schedule',JSON.stringify(schedule));localStorage.setItem('ruangsiswa_reminders',JSON.stringify(reminders))}
function fmtDate(iso){if(!iso)return 'Tanpa tenggat';const d=new Date(iso+'T00:00:00');return d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}
function shortDate(iso){if(!iso)return 'Tanpa tenggat';if(iso===todayISO)return 'Hari ini';if(iso===addDays(1))return 'Besok';return fmtDate(iso)}
function escapeHTML(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>el.classList.remove('show'),2400)}
function sortedSchedule(day){return schedule.filter(x=>x.day===day).sort((a,b)=>a.time.localeCompare(b.time))}
function timelineHTML(items,withDelete=false){if(!items.length)return '<div class="empty-state"><b>☼</b>Belum ada agenda di sini.<br>Tambahkan kegiatan agar harimu lebih terarah.</div>';return items.map(item=>`<div class="timeline-item"><div class="timeline-time">${escapeHTML(item.time)}</div><div class="timeline-rail"><span class="timeline-dot"></span></div><div class="timeline-card"><strong>${escapeHTML(item.title)}${withDelete?`<button class="delete-entry" data-delete-schedule="${item.id}" title="Hapus jadwal">×</button>`:''}</strong><span>${escapeHTML(item.description||'Kegiatan sekolah')} <span class="subject-pill">${escapeHTML(item.subject||'Umum')}</span></span></div></div>`).join('')}
function renderOverview(){
 const done=tasks.filter(t=>t.done).length, pct=tasks.length?Math.round(done/tasks.length*100):0;
 $('progressPercent').textContent=pct+'%';$('progressFraction').textContent=`${done} dari ${tasks.length} selesai`;$('progressFill').style.width=pct+'%';
 $('todayScheduleCount').textContent=sortedSchedule(todayName).length;
 $('upcomingCount').textContent=tasks.filter(t=>!t.done).length;
 $('taskNavCount').textContent=tasks.filter(t=>!t.done).length;
 $('scheduleDayLabel').textContent=`${todayName}, ${new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long'})}`;
 $('todayTimeline').innerHTML=timelineHTML(sortedSchedule(todayName).slice(0,5));
 const pending=tasks.filter(t=>!t.done).sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')).slice(0,4);
 $('priorityTasks').innerHTML=pending.length?pending.map(t=>`<div class="priority-item"><input class="task-check" type="checkbox" data-task-check="${t.id}" aria-label="Tandai selesai"><div class="priority-copy"><strong>${escapeHTML(t.title)}</strong><span>${escapeHTML(t.subject)} · ${shortDate(t.due)}</span></div><span class="due-tag">${t.due&&t.due<todayISO?'Terlambat':shortDate(t.due)}</span></div>`).join(''):'<div class="empty-state"><b>✓</b>Semua tugas sudah beres.<br>Waktunya menikmati jeda.</div>';
 const todays=reminders.filter(r=>r.date===todayISO).slice(0,3);
 $('reminderPreview').innerHTML=todays.length?todays.map(r=>`<div class="reminder-line"><span class="reminder-bullet"></span><div><strong>${escapeHTML(r.title)}</strong><span>${r.time? r.time+' · ':''}${escapeHTML(r.description||'Pengingat pribadi')}</span></div></div>`).join(''):'<div class="empty-state">Tidak ada pengingat untuk hari ini.</div>';
}
function renderSchedule(){ $('weekTabs').innerHTML=DAYS.map(d=>`<button class="week-tab ${d===selectedDay?'active':''}" data-day="${d}">${d}</button>`).join('');$('selectedDayTitle').textContent=selectedDay;$('dayTotal').textContent=`${sortedSchedule(selectedDay).length} kegiatan`;$('fullTimeline').innerHTML=timelineHTML(sortedSchedule(selectedDay),true)}
function renderTasks(){const filtered=tasks.filter(t=>taskFilter==='all'?true:taskFilter==='active'?!t.done:t.done).sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));$('taskTotalLabel').textContent=`${filtered.length} tugas ditampilkan`;$('taskBoard').innerHTML=filtered.length?filtered.map(t=>`<article class="task-card ${t.done?'completed':''}"><div class="task-card-top"><span class="subject-label">${escapeHTML(t.subject)}</span><button class="delete-entry" data-delete-task="${t.id}" title="Hapus tugas">×</button></div><h3>${escapeHTML(t.title)}</h3><p>${escapeHTML(t.description||'Tidak ada catatan tambahan.')}</p><div class="task-card-bottom"><span class="task-due">⌁ ${fmtDate(t.due)}</span><label class="${t.done?'task-done-label':''}"><input class="task-check" type="checkbox" data-task-check="${t.id}" ${t.done?'checked':''}> ${t.done?'Selesai':'Tandai selesai'}</label></div></article>`).join(''):'<div class="panel empty-state" style="grid-column:1/-1"><b>✳</b>Belum ada tugas di kategori ini.</div>'}
function renderReminders(){$('reminderGrid').innerHTML=reminders.slice().sort((a,b)=>(a.date||'').localeCompare(b.date||'')).map(r=>`<article class="reminder-card"><button class="delete-entry" data-delete-reminder="${r.id}" title="Hapus pengingat">×</button><span class="reminder-date">${fmtDate(r.date)}${r.time?' · '+r.time:''}</span><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.description||'Pengingat pribadi')}</p></article>`).join('')||'<div class="panel empty-state" style="grid-column:1/-1"><b>◷</b>Belum ada pengingat. Tambahkan hal yang perlu kamu ingat.</div>'}
function renderAll(){renderOverview();renderSchedule();renderTasks();renderReminders();renderCalendar()}
function isoFromParts(y,m,d){return localDate(new Date(y,m,d))}
function calendarItems(iso){
 const date=new Date(iso+'T00:00:00'),dayName=DAYS[(date.getDay()+6)%7];
 return [
  ...tasks.filter(t=>t.due===iso).map(t=>({kind:'Tugas',time:'',title:t.title,detail:t.subject||'Umum',dot:'task-dot'})),
  ...reminders.filter(r=>r.date===iso).map(r=>({kind:'Pengingat',time:r.time||'',title:r.title,detail:r.description||'Pengingat pribadi',dot:'reminder-dot'})),
  ...schedule.filter(x=>x.day===dayName).map(x=>({kind:'Jadwal',time:x.time||'',title:x.title,detail:x.subject||'Kegiatan',dot:'schedule-dot'}))
 ].sort((a,b)=>(a.time||'').localeCompare(b.time||''));
}
function renderCalendar(){
 const y=calendarMonth.getFullYear(),m=calendarMonth.getMonth();
 $('calendarMonthLabel').textContent=calendarMonth.toLocaleDateString('id-ID',{month:'long',year:'numeric'});
 const first=new Date(y,m,1).getDay(),count=new Date(y,m+1,0).getDate();
 const cells=[];
 for(let i=0;i<first;i++)cells.push('<span class="calendar-empty"></span>');
 for(let d=1;d<=count;d++){
  const iso=isoFromParts(y,m,d),items=calendarItems(iso),classes=['calendar-day'];
  if(iso===todayISO)classes.push('is-today');if(iso===calendarSelected)classes.push('is-selected');
  cells.push(`<button class="${classes.join(' ')}" data-calendar-date="${iso}"><span>${d}</span><i class="calendar-markers">${items.slice(0,3).map(x=>`<b class="${x.dot}"></b>`).join('')}</i></button>`);
 }
 $('calendarDays').innerHTML=cells.join('');
 $('calendarSelectedLabel').textContent=new Date(calendarSelected+'T00:00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 const items=calendarItems(calendarSelected);
 $('calendarAgendaList').innerHTML=items.length?items.map(x=>`<div class="calendar-agenda-item"><i class="legend-dot ${x.dot}"></i><div><strong>${escapeHTML(x.title)}</strong><span>${escapeHTML(x.kind)}${x.time?' · '+escapeHTML(x.time):''} · ${escapeHTML(x.detail)}</span></div></div>`).join(''):'<div class="empty-state">Belum ada agenda pada tanggal ini.</div>';
}
function showView(name){document.querySelectorAll('.page-view').forEach(v=>v.classList.remove('active'));$(name+'View').classList.add('active');document.querySelectorAll('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$('crumbTitle').textContent=({overview:'Ringkasan',calendar:'Kalender',schedule:'Jadwal',tasks:'Daftar tugas',reminders:'Pengingat',notes:'Catatan belajar',settings:'Kustomisasi'})[name];$('sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'smooth'})}
function openModal(type){$('entryType').value=type;$('entryForm').reset();$('entryTitle').value='';$('entryDescription').value='';$('taskFields').hidden=type!=='task';$('scheduleFields').hidden=type!=='schedule';$('reminderFields').hidden=type!=='reminder';$('modalTitle').textContent=type==='task'?'Tambah tugas':type==='schedule'?'Tambah jadwal':'Buat pengingat';$('entryDue').value=addDays(1);$('entryReminderDate').value=todayISO;$('entryDay').value=selectedDay;$('modalBackdrop').classList.add('open');$('modalBackdrop').setAttribute('aria-hidden','false');setTimeout(()=>$('entryTitle').focus(),50)}
function closeModal(){$('modalBackdrop').classList.remove('open');$('modalBackdrop').setAttribute('aria-hidden','true')}
$('entryForm').addEventListener('submit',e=>{e.preventDefault();const type=$('entryType').value,title=$('entryTitle').value.trim(),description=$('entryDescription').value.trim(),id=Date.now();if(!title)return;if(type==='task'){tasks.push({id,title,subject:$('entrySubject').value,due:$('entryDue').value,description,done:false});toast('Tugas berhasil ditambahkan.')}else if(type==='schedule'){schedule.push({id,title,day:$('entryDay').value,time:$('entryTime').value,subject:'Kegiatan',description});selectedDay=$('entryDay').value;toast('Jadwal berhasil ditambahkan.')}else{reminders.push({id,title,date:$('entryReminderDate').value,time:$('entryReminderTime').value,description});toast('Pengingat berhasil dibuat.')}save();renderAll();closeModal()});
document.addEventListener('click',e=>{const check=e.target.closest('[data-task-check]');if(check){const task=tasks.find(t=>t.id===Number(check.dataset.taskCheck));if(task){task.done=check.checked;save();renderAll();toast(task.done?'Tugas ditandai selesai.':'Status tugas diperbarui.')}}const day=e.target.closest('[data-day]');if(day){selectedDay=day.dataset.day;renderSchedule()}const delTask=e.target.closest('[data-delete-task]');if(delTask){tasks=tasks.filter(t=>t.id!==Number(delTask.dataset.deleteTask));save();renderAll();toast('Tugas dihapus.')}const delSchedule=e.target.closest('[data-delete-schedule]');if(delSchedule){schedule=schedule.filter(t=>t.id!==Number(delSchedule.dataset.deleteSchedule));save();renderAll();toast('Jadwal dihapus.')}const delReminder=e.target.closest('[data-delete-reminder]');if(delReminder){reminders=reminders.filter(t=>t.id!==Number(delReminder.dataset.deleteReminder));save();renderAll();toast('Pengingat dihapus.')}const go=e.target.closest('[data-go]');if(go)showView(go.dataset.go);const cal=e.target.closest('[data-calendar-date]');if(cal){calendarSelected=cal.dataset.calendarDate;renderCalendar()}
const nav=e.target.closest('[data-view]');if(nav)showView(nav.dataset.view);const filter=e.target.closest('[data-filter]');if(filter){taskFilter=filter.dataset.filter;document.querySelectorAll('.filter-tab').forEach(b=>b.classList.toggle('active',b===filter));renderTasks()}});
$('quickAddBtn').onclick=$('addTaskInline').onclick=$('addTaskPage').onclick=()=>openModal('task');
$('calendarPrev').onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1);renderCalendar()};
$('calendarNext').onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);renderCalendar()};
$('calendarToday').onclick=()=>{calendarMonth=new Date();calendarMonth.setDate(1);calendarSelected=todayISO;renderCalendar()};
$('calendarAddBtn').onclick=()=>{openModal('reminder');$('entryReminderDate').value=calendarSelected};
$('addScheduleBtn').onclick=()=>openModal('schedule');$('addReminderBtn').onclick=$('addReminderPage').onclick=()=>openModal('reminder');
$('closeModal').onclick=$('cancelModal').onclick=closeModal;$('modalBackdrop').addEventListener('click',e=>{if(e.target===$('modalBackdrop'))closeModal()});
$('mobileMenu').onclick=()=>$('sidebar').classList.toggle('open');
$('todayDate').textContent=new Date().toLocaleDateString('id-ID',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
const hour=new Date().getHours();$('greetingName').textContent=hour<11?'selamat pagi!':hour<15?'selamat siang!':hour<18?'selamat sore!':'selamat malam!';$('welcomeMessage').textContent=hour<11?'Mulai hari dengan rencana yang sederhana.': 'Atur harimu, selesaikan satu hal dalam satu waktu.';
const savedTitle=localStorage.getItem('ruangsiswa_note_title')||'',savedBody=localStorage.getItem('ruangsiswa_note_body')||'';$('noteTitle').value=savedTitle;$('noteBody').value=savedBody;
function saveNote() {localStorage.setItem('ruangsiswa_note_title',$('noteTitle').value);localStorage.setItem('ruangsiswa_note_body',$('noteBody').value);$('notesSaved').textContent='Tersimpan';clearTimeout(saveNote.t);saveNote.t=setTimeout(()=>$('notesSaved').textContent='Tersimpan otomatis',1200)}
$('noteTitle').addEventListener('input',saveNote);$('noteBody').addEventListener('input',saveNote);$('clearNote').onclick=()=>{if(confirm('Hapus seluruh isi catatan?')){$('noteTitle').value='';$('noteBody').value='';saveNote();toast('Catatan dibersihkan.')}};
function updateTimer(){$('timerDisplay').textContent=String(Math.floor(timerSeconds/60)).padStart(2,'0')+':'+String(timerSeconds%60).padStart(2,'0')}
$('timerButton').onclick=()=>{if(timerRunning){clearInterval(timerInterval);timerRunning=false;$('timerButton').innerHTML='Lanjutkan <span>→</span>'}else{if(timerSeconds===0)timerSeconds=1500;timerRunning=true;$('timerButton').innerHTML='Jeda timer <span>Ⅱ</span>';timerInterval=setInterval(()=>{timerSeconds--;updateTimer();if(timerSeconds<=0){clearInterval(timerInterval);timerRunning=false;$('timerButton').innerHTML='Mulai lagi <span>→</span>';toast('Sesi fokus selesai. Ambil jeda sebentar!')}},1000)}};

// Preferences are kept separately from school data, so resetting the look won't erase tasks.
const themePresets = {
  sage:{accent:'#426d54',dark:'#294b38',soft:'#e8f0e8'},
  ocean:{accent:'#36758a',dark:'#245365',soft:'#e6f1f4'},
  lavender:{accent:'#8271a8',dark:'#5e507f',soft:'#efebf6'},
  sunset:{accent:'#b66c4e',dark:'#814b37',soft:'#f7ece6'}
};
function readPrefs(){try{return JSON.parse(localStorage.getItem('ruangsiswa_prefs'))||{}}catch{return {}}}
let prefs=readPrefs();
function applyPrefs(){
 const preset=themePresets[prefs.theme||'sage']||themePresets.sage;
 const accent=prefs.customAccent||preset.accent;
 document.documentElement.style.setProperty('--green',accent);
 document.documentElement.style.setProperty('--green-dark',prefs.customAccent?shadeColor(accent,-28):preset.dark);
 document.documentElement.style.setProperty('--mint',preset.soft);
 document.documentElement.style.setProperty('--accent-custom',accent);
 document.body.classList.toggle('large-text',prefs.fontScale==='large');
 const name=prefs.name||'pejuang belajar.';
 $('greetingName').textContent=name;
 if(prefs.subtitle)$('welcomeMessage').textContent=prefs.subtitle;
 document.querySelectorAll('.setting-toggle').forEach(el=>{const key=el.dataset.widget;const target={schedule:'.schedule-panel',tasks:'.tasks-panel',reminders:'.reminder-panel',focus:'.focus-card'}[key];if(target){const panel=document.querySelector(target);if(panel)panel.classList.toggle('widget-hidden',prefs.widgets?.[key]===false)}});
 document.querySelectorAll('.theme-choice').forEach(b=>b.classList.toggle('active',b.dataset.theme===(prefs.theme||'sage')&&!prefs.customAccent));
}
function shadeColor(hex,percent){const num=parseInt(hex.slice(1),16),r=Math.max(0,Math.min(255,(num>>16)+Math.round(2.55*percent))),g=Math.max(0,Math.min(255,((num>>8)&255)+Math.round(2.55*percent))),b=Math.max(0,Math.min(255,(num&255)+Math.round(2.55*percent)));return '#'+(0x1000000+r*0x10000+g*0x100+b).toString(16).slice(1)}
function loadSettingsForm(){
 $('customName').value=prefs.name||'';
 $('customSubtitle').value=prefs.subtitle||'';
 $('customAccent').value=prefs.customAccent||themePresets[prefs.theme||'sage'].accent;
 $('customAccentLabel').textContent=$('customAccent').value.toUpperCase();
 $('fontScale').value=prefs.fontScale||'normal';
 document.querySelectorAll('.setting-toggle').forEach(input=>input.checked=prefs.widgets?.[input.dataset.widget]!==false);
 applyPrefs();
}
document.querySelectorAll('.theme-choice').forEach(btn=>btn.addEventListener('click',()=>{
 prefs.theme=btn.dataset.theme;prefs.customAccent='';$('customAccent').value=themePresets[prefs.theme].accent;$('customAccentLabel').textContent=$('customAccent').value.toUpperCase();applyPrefs();
}));
$('customAccent').addEventListener('input',e=>{prefs.customAccent=e.target.value;$('customAccentLabel').textContent=e.target.value.toUpperCase();applyPrefs()});
$('fontScale').addEventListener('change',e=>{prefs.fontScale=e.target.value;applyPrefs()});
document.querySelectorAll('.setting-toggle').forEach(input=>input.addEventListener('change',()=>{prefs.widgets=prefs.widgets||{};prefs.widgets[input.dataset.widget]=input.checked;applyPrefs()}));
$('saveSettingsBtn').addEventListener('click',()=>{
 prefs.name=$('customName').value.trim()||'pejuang belajar.';
 prefs.subtitle=$('customSubtitle').value.trim();
 prefs.fontScale=$('fontScale').value;
 prefs.widgets=prefs.widgets||{};
 document.querySelectorAll('.setting-toggle').forEach(input=>prefs.widgets[input.dataset.widget]=input.checked);
 localStorage.setItem('ruangsiswa_prefs',JSON.stringify(prefs));applyPrefs();toast('Kustomisasi berhasil disimpan.');
});
$('resetSettingsBtn').addEventListener('click',()=>{
 if(confirm('Kembalikan tampilan dan preferensi ke pengaturan awal? Data tugas, jadwal, dan pengingat tidak akan dihapus.')){
  prefs={};localStorage.removeItem('ruangsiswa_prefs');loadSettingsForm();toast('Pengaturan awal dipulihkan.');
 }
});

loadSettingsForm();
renderDailyVerse();
renderAll();updateTimer();


// Installable hybrid app support (PWA).
let deferredInstallPrompt=null;
const installButton=$('installAppBtn');
window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();deferredInstallPrompt=event;
  if(installButton)installButton.hidden=false;
});
if(installButton)installButton.addEventListener('click',async()=>{
  if(!deferredInstallPrompt)return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt=null;installButton.hidden=true;
});
window.addEventListener('appinstalled',()=>{if(installButton)installButton.hidden=true;toast('RuangSiswa berhasil dipasang.');});
if('serviceWorker' in navigator && location.protocol!=='file:'){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>console.info('Service worker belum aktif:',err)));
}

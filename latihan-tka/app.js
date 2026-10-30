const BANK = window.TKA_QUESTION_BANK || [];
const STORAGE = { profile: 'tka_lab_profile_v1', results: 'tka_lab_results_v1' };
const CATEGORY = {
  verbal: { title: 'Verbal', subtitle: 'Penalaran bahasa', icon: 'Aa', color: '#eee9ff', text: '#6b4cc2', time: 25*60, perQuestion: 50, description: 'Kosakata · bacaan · logika bahasa' },
  quant: { title: 'Kuantitatif', subtitle: 'Logika matematika', icon: '∑', color: '#e8f7f2', text: '#18805e', time: 35*60, perQuestion: 70, description: 'Angka · aritmetika · pola' },
  spatial: { title: 'Spasial', subtitle: 'Visual dan gambar', icon: '◈', color: '#fff1e6', text: '#b56a2b', time: 25*60, perQuestion: 25, description: 'Rotasi · pola · ruang' }
};
const SIMULATION_COUNTS = { verbal: 30, quant: 30, spatial: 60 };
const SOURCES = {
  bappenas: { url: 'https://rekrutmen.bappenas.go.id/file/news/lampiran-iii-petunjuk-teknis-instalasi-dan-tata-tertib-skbt-tpa.pdf' },
  jobstreet: { url: 'https://id.jobstreet.com/id/career-advice/article/contoh-soal-tpa-pembahasan-tips-mengerjakan' },
  spatial: { url: 'https://cognitivetesting.org/practice-tests/spatial-reasoning' }
};
let profile = load(STORAGE.profile, null);
let history = load(STORAGE.results, []);
let currentView = 'home';
let attempt = null;
let timerInterval = null;
let resultToShow = null;
let reviewFilter = 'all';

function load(key, fallback) { try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch(e) { return fallback; } }
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) { toast('Penyimpanan browser penuh. Unduh hasil agar tidak hilang.'); } }
function escapeHTML(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function formatText(v) { return escapeHTML(v).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>'); }
function formatDate(iso) { try { return new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(new Date(iso)); } catch(e) { return iso; } }
function fmtTime(sec) { const s=Math.max(0,Math.floor(sec)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
function shuffle(array) { const a=[...array]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; }
function toast(message) { const el=document.createElement('div');el.className='toast';el.textContent=message;document.body.appendChild(el);setTimeout(()=>el.remove(),2400); }
function initials(name) { return (name||'P').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase(); }
function categoryCount(key) { return BANK.filter(q=>q.category===key).length; }
function render() {
  clearInterval(timerInterval);
  if (attempt) { renderExam(); startTimer(); return; }
  if (!profile || !profile.name) { renderWelcome(); return; }
  if (currentView==='result' && resultToShow) { renderResult(resultToShow); return; }
  if (currentView==='history') { renderHistory(); return; }
  if (currentView==='profile') { renderProfile(); return; }
  renderHome();
}
function brandMarkup(){return `<div class="brand"><span class="brand-mark" aria-hidden="true"><span class="brand-pi">π</span></span><span class="brand-name">latihan <b>doπ</b></span></div>`;}
function renderWelcome() {
 document.getElementById('app').innerHTML=`<main class="welcome-wrap"><section class="welcome-card"><div class="welcome-top">${brandMarkup()}<span class="edition-tag">RUANG LATIHAN</span></div><div class="welcome-grid"><div class="welcome-copy"><div class="eyebrow">MULAI LATIHAN</div><h1>Asah cara berpikirmu.</h1><p>Verbal, kuantitatif, dan spasial dalam satu tempat.</p><form id="nameForm"><label class="field-label" for="candidateName">Nama peserta</label><input class="text-input" id="candidateName" name="name" maxlength="70" autocomplete="name" placeholder="Nama lengkap" required><button class="btn btn-primary" type="submit">Masuk <span>→</span></button></form><div class="welcome-foot">Hasil tersimpan di browser ini.</div></div><div class="welcome-art" aria-hidden="true"><span class="welcome-glyph">π</span><span class="welcome-orbit-dot"></span><div class="welcome-mini"><strong>120</strong>SOAL SIMULASI</div></div></div></section></main>`;
 document.getElementById('nameForm').addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('candidateName').value.trim();if(!name){toast('Nama peserta perlu diisi.');return;}profile={name,createdAt:new Date().toISOString()};save(STORAGE.profile,profile);currentView='home';render();});
}
function shell(content, active='home') {
 document.getElementById('app').innerHTML=`<div class="app-shell"><header class="topbar">${brandMarkup()}<div class="top-actions"><button class="user-pill" onclick="go('profile')"><span class="avatar">${escapeHTML(initials(profile.name))}</span><span class="name-text">${escapeHTML(profile.name)}</span></button></div></header><div class="layout"><aside class="sidebar"><div class="side-label">MENU</div><button class="nav-btn ${active==='home'?'active':''}" onclick="go('home')"><span class="nav-icon">⌂</span>Beranda</button><button class="nav-btn ${active==='history'?'active':''}" onclick="go('history')"><span class="nav-icon">◷</span>Riwayat</button><button class="nav-btn ${active==='profile'?'active':''}" onclick="go('profile')"><span class="nav-icon">⚙</span>Pengaturan</button></aside><main class="main">${content}</main></div><div class="footer-note">Data tersimpan secara lokal.</div></div>`;
}
function go(view) { currentView=view; resultToShow=null; render(); window.scrollTo(0,0); }
function renderHome() {
 const totalAttempts=history.length;const best=history.length?Math.max(...history.map(x=>x.score)):0;
 const stats=`<div class="stats-grid"><div class="stat-card"><div class="stat-icon">▤</div><div><div class="stat-value">${BANK.length}</div><div class="stat-label">Bank soal</div></div></div><div class="stat-card"><div class="stat-icon">◷</div><div><div class="stat-value">${totalAttempts}</div><div class="stat-label">Sesi selesai</div></div></div><div class="stat-card"><div class="stat-icon">↗</div><div><div class="stat-value">${totalAttempts?best:'—'}</div><div class="stat-label">Skor terbaik</div></div></div></div>`;
 const cats=Object.keys(CATEGORY).map(key=>{const c=CATEGORY[key];return `<article class="category-card"><div class="cat-top"><div class="cat-icon" style="background:${c.color};color:${c.text}">${c.icon}</div><span class="cat-count">${categoryCount(key)} soal</span></div><h3>${c.title}</h3><p>${c.description}</p><div class="cat-meta"><span>◷ ${key==='verbal'?'25':key==='quant'?'35':'25'} menit</span><span>· ${SIMULATION_COUNTS[key]} soal tes</span></div><div class="cat-actions"><button class="mini-action" onclick="startPractice('${key}',10,false)">10 soal</button><button class="mini-action" onclick="startPractice('${key}',20,false)">20 soal</button><button class="mini-action" onclick="startPractice('${key}',0,false)">Semua</button></div></article>`;}).join('');
 const content=`<section class="dashboard-intro"><div class="intro-copy"><div class="eyebrow">RUANG LATIHAN</div><h1>Halo, ${escapeHTML(profile.name.split(' ')[0])}.</h1><p>Pilih kategori untuk mulai berlatih.</p></div><div class="intro-art" aria-hidden="true"><span class="art-pi">π</span><span class="art-orbit"></span><span class="art-dot"></span></div></section>${stats}<div class="section-head"><div><h2>Latihan kategori</h2><p>Pilih jumlah soal.</p></div></div><section class="category-grid">${cats}</section><section class="full-sim"><div class="full-sim-copy"><div class="eyebrow">MODE CBT</div><h3>Simulasi lengkap</h3><p>120 soal <span>·</span> 85 menit <span>·</span> 3 subtes</p></div><button class="btn btn-primary" onclick="startSimulation()">Mulai simulasi <span>→</span></button></section>`;
 shell(content,'home');
}
function startPractice(key,count,withTimer=false) {
 const pool=shuffle(BANK.filter(q=>q.category===key));const chosen=count===0?pool:pool.slice(0,Math.min(count,pool.length));
 attempt={id:'P-'+Date.now(),mode:'practice',startedAt:new Date().toISOString(),sections:[{key,questions:chosen,duration:withTimer?chosen.length*CATEGORY[key].perQuestion:0}],sectionIndex:0,qIndex:0,answers:{},flagged:[],expiresAt:withTimer?Date.now()+chosen.length*CATEGORY[key].perQuestion*1000:null};
 render();
}
function startSimulation() {
 const sections=Object.keys(CATEGORY).map(key=>({key,questions:shuffle(BANK.filter(q=>q.category===key)).slice(0,SIMULATION_COUNTS[key]),duration:CATEGORY[key].time}));
 attempt={id:'S-'+Date.now(),mode:'simulation',startedAt:new Date().toISOString(),sections,sectionIndex:0,qIndex:0,answers:{},flagged:[],expiresAt:Date.now()+sections[0].duration*1000};
 render();
}
function currentSection(){return attempt.sections[attempt.sectionIndex];}
function currentQuestion(){return currentSection().questions[attempt.qIndex];}
function answeredCount(section=currentSection()){return section.questions.filter(q=>attempt.answers[q.id]!==undefined && attempt.answers[q.id]!==null).length;}
function renderVisual(v) {
 if(!v)return '';
 if(v.kind==='sequence')return `<div class="visual-sequence">${v.items.map((x,i)=>`<span class="visual-symbol ${x==='?'?'question':''}">${escapeHTML(x)}</span>${i<v.items.length-1?'<span class="visual-arrow">›</span>':''}`).join('')}</div>`;
 if(v.kind==='mirror')return `<div class="mirror-visual"><span class="visual-symbol">${escapeHTML(v.items[0])}</span><span class="axis"></span><span class="visual-symbol question">?</span></div>`;
 if(v.kind==='matrix')return `<div class="matrix">${v.rows.flat().map(x=>`<div class="matrix-cell ${x==='?'?'missing':''}">${escapeHTML(x)}</div>`).join('')}</div>`;
 if(v.kind==='net')return `<pre class="net-diagram">${escapeHTML(v.rows.join('\n'))}</pre>`;
 if(v.kind==='heights')return `<div class="height-grid">${v.rows.flat().map(x=>`<div class="height-cell">${escapeHTML(x)}</div>`).join('')}</div>`;
 return '';
}
function renderExam() {
 const sec=currentSection(),key=sec.key,c=CATEGORY[key],q=currentQuestion(),total=sec.questions.length;
 const overallIndex=attempt.sections.slice(0,attempt.sectionIndex).reduce((s,x)=>s+x.questions.length,0)+attempt.qIndex;
 const overallTotal=attempt.sections.reduce((s,x)=>s+x.questions.length,0);
 const progress=100*(overallIndex+1)/overallTotal;
 const isFlagged=attempt.flagged.includes(q.id),selected=attempt.answers[q.id];
 const remain=attempt.expiresAt?Math.max(0,Math.ceil((attempt.expiresAt-Date.now())/1000)):null;
 const nav=sec.questions.map((item,i)=>`<button class="q-jump ${i===attempt.qIndex?'current':''} ${attempt.answers[item.id]!==undefined&&attempt.answers[item.id]!==null?'answered':''} ${attempt.flagged.includes(item.id)?'flagged':''}" onclick="jumpQuestion(${i})">${i+1}</button>`).join('');
 const isLast=attempt.qIndex===total-1;
 const sourceLine=`Sumber tipe soal: <a href="${escapeHTML(q.source.url)}" target="_blank" rel="noopener">${escapeHTML(q.source.label)} ↗</a>`;
 document.getElementById('app').innerHTML=`<div class="exam-wrap"><header class="exam-head"><div class="exam-ident"><div class="brand-mark"><span class="brand-pi">π</span></div><div><strong>${attempt.mode==='simulation'?'Simulasi CBT':'Latihan kategori'} · ${c.title}</strong><span>Peserta: ${escapeHTML(profile.name)} · ${attempt.mode==='simulation'?`Subtes ${attempt.sectionIndex+1} dari 3`:'Mode latihan mandiri'}</span></div></div><div class="timer-box"><small>${attempt.expiresAt?'Sisa waktu':'Tanpa batas waktu'}</small><div class="timer ${remain!==null&&remain<=300?'warning':''}" id="timerValue">${remain===null?'∞':fmtTime(remain)}</div></div></header><div class="exam-progress"><span style="width:${progress}%"></span></div><div class="exam-meta"><span><strong>${c.title}</strong> · ${c.subtitle}</span><span>Soal ${attempt.qIndex+1} / ${total} <b style="color:#c4bfce">|</b> Terjawab ${answeredCount()}</span></div>${remain!==null&&remain<=300&&remain>0?'<div class="warning-strip">⏳ Waktu tersisa 5 menit atau kurang. Pastikan seluruh jawaban sudah diperiksa.</div>':''}<div class="exam-layout"><section class="question-card"><div class="question-eyebrow"><span class="q-number">SOAL ${String(attempt.qIndex+1).padStart(2,'0')}</span><span class="q-type">${escapeHTML(q.type)}</span><span class="difficulty">${escapeHTML(q.difficulty)}</span></div><p class="question-prompt">${formatText(q.prompt)}</p>${q.visual?`<div class="visual-box">${renderVisual(q.visual)}</div>`:''}<div class="options">${q.options.map((opt,i)=>`<button class="option ${selected===i?'selected':''}" onclick="chooseAnswer(${i})"><span class="option-letter">${'ABCDE'[i]}</span><span class="option-text ${/^[↑→↓←↗↖↘↙◀▶●○▲■◆★◇△□✚]+$/.test(opt)?'glyph':''}">${escapeHTML(opt)}</span></button>`).join('')}</div><div class="question-source">${sourceLine}</div><div class="answer-hint">Pilih satu jawaban. Tandai soal untuk ditinjau kembali.</div></section><aside class="question-side"><div class="side-title"><strong>Nomor soal</strong><span>${answeredCount()} / ${total} dijawab</span></div><div class="q-grid">${nav}</div><div class="legend"><span><i></i> Belum dijawab</span><span><i style="background:#eee9ff"></i> Terjawab</span><span><i class="flag"></i> Ditandai</span></div><button class="btn btn-ghost btn-small" onclick="toggleFlag()">${isFlagged?'★ Hapus tanda':'☆ Tandai soal'}</button>${attempt.mode==='simulation'?`<button class="btn btn-outline btn-small" onclick="confirmFinishSection()">Akhiri subtes</button>`:`<button class="btn btn-outline btn-small" onclick="confirmFinishSection()">Selesaikan latihan</button>`}</aside></div><footer class="exam-bottom"><div class="exam-bottom-left"><button class="btn btn-outline" onclick="previousQuestion()" ${attempt.qIndex===0?'disabled':''}>← Sebelumnya</button></div><div class="exam-bottom-right"><button class="btn btn-primary" onclick="nextQuestion()">${isLast?'Lihat ringkasan →':'Selanjutnya →'}</button></div></footer></div>`;
}
function startTimer(){
 clearInterval(timerInterval);if(!attempt||!attempt.expiresAt)return;
 timerInterval=setInterval(()=>{
  if(!attempt||!attempt.expiresAt)return;
  const remain=Math.max(0,Math.ceil((attempt.expiresAt-Date.now())/1000));
  const el=document.getElementById('timerValue');if(el){el.textContent=fmtTime(remain);el.classList.toggle('warning',remain<=300);}
  if(remain===300)toast('Waktu tersisa 5 menit.');
  if(remain<=0){clearInterval(timerInterval);if(attempt.mode==='simulation')advanceSection(true);else finishAttempt(true);}
 },500);
}
function chooseAnswer(i){const q=currentQuestion();attempt.answers[q.id]=i;renderExam();startTimer();}
function jumpQuestion(i){attempt.qIndex=i;renderExam();startTimer();}
function previousQuestion(){if(attempt.qIndex>0){attempt.qIndex--;renderExam();startTimer();}}
function nextQuestion(){if(attempt.qIndex<currentSection().questions.length-1){attempt.qIndex++;renderExam();startTimer();}else if(attempt.mode==='practice'){confirmFinishSection();}else{toast('Ini soal terakhir subtes. Pilih Akhiri subtes untuk melanjutkan.');}}
function toggleFlag(){const id=currentQuestion().id;if(attempt.flagged.includes(id))attempt.flagged=attempt.flagged.filter(x=>x!==id);else attempt.flagged.push(id);renderExam();startTimer();}
function confirmFinishSection(){
 const sec=currentSection(),unanswered=sec.questions.length-answeredCount();
 const title=attempt.mode==='simulation'?(attempt.sectionIndex===2?'Kumpulkan seluruh simulasi?':'Akhiri subtes ini?'):'Selesaikan latihan?';
 const msg=unanswered?`Masih ada ${unanswered} soal yang belum dijawab. Jawaban kosong tetap bernilai 0 dan tidak mengurangi nilai.`:'Semua soal telah dijawab. Hasil akan langsung ditampilkan setelah sesi selesai.';
 showConfirm(title,msg,attempt.mode==='simulation'?'Akhiri & lanjutkan':'Lihat hasil',()=>{if(attempt.mode==='simulation')advanceSection(false);else finishAttempt(false);});
}
function showConfirm(title,message,ok,action){
 const overlay=document.createElement('div');overlay.className='confirm-overlay';overlay.innerHTML=`<div class="confirm-box"><h3>${escapeHTML(title)}</h3><p>${escapeHTML(message)}</p><div class="confirm-actions"><button class="btn btn-outline btn-small" id="cancelConfirm">Kembali</button><button class="btn btn-primary btn-small" id="okConfirm">${escapeHTML(ok)}</button></div></div>`;document.body.appendChild(overlay);overlay.querySelector('#cancelConfirm').onclick=()=>overlay.remove();overlay.querySelector('#okConfirm').onclick=()=>{overlay.remove();action();};
}
function advanceSection(auto){
 clearInterval(timerInterval);
 if(attempt.sectionIndex<attempt.sections.length-1){attempt.sectionIndex++;attempt.qIndex=0;attempt.expiresAt=Date.now()+currentSection().duration*1000;render();if(auto)toast(`Waktu habis. Subtes ${CATEGORY[currentSection().key].title} telah dikunci; berpindah ke subtes berikutnya.`);}
 else finishAttempt(auto);
}
function finishAttempt(auto){
 clearInterval(timerInterval);if(!attempt)return;
 const completed=attempt;attempt=null;
 const flat=completed.sections.flatMap(s=>s.questions.map(q=>({...q,sectionKey:s.key,selected:completed.answers[q.id]??null,correct:q.answer===completed.answers[q.id]})));
 const correct=flat.filter(q=>q.correct).length,wrong=flat.filter(q=>q.selected!==null&&!q.correct).length,blank=flat.filter(q=>q.selected===null).length,total=flat.length;
 const score=Math.round(200+(correct/total)*600);
 const result={id:completed.id,name:profile.name,mode:completed.mode,startedAt:completed.startedAt,finishedAt:new Date().toISOString(),correct,wrong,blank,total,score,sections:completed.sections.map(s=>{const items=flat.filter(q=>q.sectionKey===s.key);return{key:s.key,total:items.length,correct:items.filter(x=>x.correct).length,wrong:items.filter(x=>x.selected!==null&&!x.correct).length,blank:items.filter(x=>x.selected===null).length,questions:items};})};
 history.unshift(result);history=history.slice(0,20);save(STORAGE.results,history);resultToShow=result;currentView='result';reviewFilter='all';render();window.scrollTo(0,0);if(auto)toast('Waktu habis. Hasil sesi telah disimpan di perangkat ini.');
}
function renderResult(res){
 const total=res.total||0;const isFull=res.mode==='simulation'&&total===120;
 const sectionCards=res.sections.map(s=>{const c=CATEGORY[s.key];const pct=s.total?Math.round(s.correct/s.total*100):0;return `<article class="section-result"><h3>${c.title}</h3><div class="section-score">${s.correct}<small style="font-size:10px;color:#8d8999;font-weight:500"> / ${s.total} benar</small></div><p>${s.wrong} salah · ${s.blank} kosong</p><div class="mini-bar"><span style="width:${pct}%"></span></div></article>`;}).join('');
 const interpretation=`<div class="note-box" style="margin-top:15px"><strong>Catatan:</strong> Skor merupakan estimasi linear skala 200–800, bukan formula resmi PIP UNPAD.</div>`;
 const content=`<div class="result-topbar">${brandMarkup()}<button class="btn btn-outline btn-small" onclick="go('home')">Beranda</button></div><header class="result-head"><div><h1>Hasil ${res.mode==='simulation'?'simulasi CBT':'latihan kategori'}</h1><p>${escapeHTML(res.name)} · ${formatDate(res.finishedAt)} · ${res.total} soal</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-outline btn-small" onclick="downloadResult('${res.id}','json')">↓ JSON</button><button class="btn btn-outline btn-small" onclick="downloadResult('${res.id}','csv')">↓ CSV</button><button class="btn btn-primary btn-small" onclick="window.print()">Cetak / PDF</button></div></header><section class="score-hero"><div class="score-main"><small>SKOR ESTIMASI</small><div class="score-number">${res.score}</div><div class="score-scale">Skala 200–800 · linear</div></div><div class="score-detail"><div class="result-name">${escapeHTML(res.name)}</div><div class="result-date">${res.mode==='simulation'?'Simulasi penuh':'Latihan per kategori'} · ${formatDate(res.finishedAt)}</div><div class="result-counts"><div class="result-count"><strong>${res.correct}</strong><span>Benar · +1</span></div><div class="result-count"><strong>${res.wrong}</strong><span>Salah · 0</span></div><div class="result-count"><strong>${res.blank}</strong><span>Kosong · 0</span></div></div></div></section><section class="result-sections">${sectionCards}</section>${interpretation}<div class="result-toolbar"><h2>Review jawaban per soal</h2><div class="filter-row"><button class="filter-btn ${reviewFilter==='all'?'active':''}" onclick="setReviewFilter('all')">Semua</button><button class="filter-btn ${reviewFilter==='wrong'?'active':''}" onclick="setReviewFilter('wrong')">Salah</button><button class="filter-btn ${reviewFilter==='blank'?'active':''}" onclick="setReviewFilter('blank')">Kosong</button><button class="filter-btn ${reviewFilter==='correct'?'active':''}" onclick="setReviewFilter('correct')">Benar</button></div></div><div class="review-list" id="reviewList">${renderReviews(res)}</div><div style="display:flex;gap:9px;justify-content:center;margin-top:22px;flex-wrap:wrap"><button class="btn btn-outline" onclick="go('home')">Kembali ke beranda</button><button class="btn btn-primary" onclick="startSimulation()">Ulangi simulasi</button></div>`;
 document.getElementById('app').innerHTML=`<div class="result-wrap">${content}</div>`;
}
function renderReviews(res){
 return res.sections.flatMap(s=>s.questions).filter(q=>reviewFilter==='all'||(reviewFilter==='wrong'&&q.selected!==null&&!q.correct)||(reviewFilter==='blank'&&q.selected===null)||(reviewFilter==='correct'&&q.correct)).map(q=>{
  const status=q.correct?'correct':q.selected===null?'blank':'wrong';const mark=q.correct?'✓':q.selected===null?'–':'×';
  return `<details class="review-item"><summary><span class="review-status ${status}">${mark}</span><span class="review-summary"><strong>${q.id} · ${CATEGORY[q.category].title} · ${escapeHTML(q.type)}</strong><small>${q.selected===null?'Belum dijawab':q.correct?'Jawaban benar':`Jawaban Anda: ${'ABCDE'[q.selected]}`} · Kunci: ${'ABCDE'[q.answer]}</small></span><span class="review-chevron">⌄</span></summary><div class="review-content"><div class="review-prompt">${formatText(q.prompt)}</div>${q.visual?`<div class="visual-box">${renderVisual(q.visual)}</div>`:''}<div class="review-options">${q.options.map((o,i)=>`<div class="review-option ${i===q.answer?'correct-answer':''} ${i===q.selected?'user-answer':''}"><strong>${'ABCDE'[i]}.</strong><span>${escapeHTML(o)} ${i===q.answer?'· Kunci jawaban':i===q.selected?'· Jawaban Anda':''}</span></div>`).join('')}</div><div class="review-explanation"><strong>Pembahasan:</strong> ${escapeHTML(q.explanation)}</div><div class="review-source">Sumber tipe soal: <a href="${escapeHTML(q.source.url)}" target="_blank" rel="noopener">${escapeHTML(q.source.label)} ↗</a></div></div></details>`;
 }).join('')||'<div class="empty-state"><strong>Tidak ada soal pada filter ini.</strong>Pilih filter lain untuk melihat review.</div>';
}
function setReviewFilter(filter){reviewFilter=filter;const res=resultToShow;renderResult(res);}
function findResult(id){return history.find(x=>x.id===id)||resultToShow;}
function downloadResult(id,format){const res=findResult(id);if(!res){toast('Hasil tidak ditemukan.');return;}let data,filename,type;
 if(format==='json'){data=JSON.stringify(res,null,2);filename=`hasil-dopi-${slug(res.name)}-${res.id}.json`;type='application/json';}
 else{const rows=[['Nama','Mode','Tanggal','ID Soal','Kategori','Tipe','Pertanyaan','Pilihan A','Pilihan B','Pilihan C','Pilihan D','Pilihan E','Jawaban Peserta','Kunci','Status','Pembahasan','Sumber']];res.sections.flatMap(s=>s.questions).forEach(q=>rows.push([res.name,res.mode,res.finishedAt,q.id,CATEGORY[q.category].title,q.type,q.prompt,...q.options,q.selected===null?'':('ABCDE'[q.selected]),'ABCDE'[q.answer],q.correct?'Benar':q.selected===null?'Kosong':'Salah',q.explanation,q.source.url]));data='\ufeff'+rows.map(row=>row.map(cell=>'"'+String(cell??'').replace(/"/g,'""').replace(/\n/g,' ')+'"').join(';')).join('\r\n');filename=`hasil-dopi-${slug(res.name)}-${res.id}.csv`;type='text/csv;charset=utf-8';}
 const blob=new Blob([data],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast(`File ${format.toUpperCase()} berhasil disiapkan.`);
}
function slug(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function renderHistory(){
 const cards=history.length?history.map(r=>`<article class="history-card"><div class="history-score">${r.score}</div><div class="history-body"><strong>${escapeHTML(r.name)} · ${r.mode==='simulation'?'Simulasi penuh':'Latihan kategori'}</strong><span>${formatDate(r.finishedAt)} · ${r.correct}/${r.total} benar · ${r.wrong} salah · ${r.blank} kosong</span></div><button class="btn btn-outline btn-small" onclick="openResult('${r.id}')">Detail</button></article>`).join(''):'<div class="empty-state"><strong>Belum ada riwayat latihan.</strong>Setelah menyelesaikan sesi, hasil akan tersimpan di browser ini.</div>';
 shell(`<div class="section-head" style="margin-top:4px"><div><h2>Riwayat hasil</h2><p>Riwayat disimpan secara lokal pada perangkat ini.</p></div><button class="btn btn-outline btn-small" onclick="go('home')">← Beranda</button></div><div class="history-list">${cards}</div>`, 'history');
}
function openResult(id){resultToShow=findResult(id);reviewFilter='all';currentView='result';render();window.scrollTo(0,0);}
function renderProfile(){
 shell(`<div class="section-head" style="margin-top:4px"><div><h2>Profil & penyimpanan</h2><p>Atur nama peserta dan data lokal.</p></div></div><div class="profile-grid"><section class="panel"><h3>Identitas peserta</h3><form id="profileForm"><label class="field-label" for="profileName">Nama yang ditampilkan pada hasil</label><input class="text-input" id="profileName" maxlength="70" value="${escapeHTML(profile.name)}" required><button class="btn btn-primary" style="margin-top:13px" type="submit">Simpan nama</button></form></section><section class="panel"><h3>Data pada perangkat ini</h3><div class="note-box">Tersimpan: profil peserta dan maksimal 20 hasil latihan. Aplikasi tidak mengirim jawaban ke server. Menghapus data browser atau berpindah perangkat dapat menghilangkan riwayat.</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:13px"><button class="btn btn-outline btn-small" onclick="exportAllData()">↓ Backup semua data</button><button class="btn btn-danger btn-small" onclick="confirmClearData()">Hapus semua data</button></div></section></div><section class="panel" style="margin-top:15px"><h3>Ketentuan skor</h3><div class="rule-list"><div class="rule-row"><span class="rule-check">1</span><span>Benar mendapat +1 poin. Salah dan kosong mendapat 0 poin.</span></div><div class="rule-row"><span class="rule-check">2</span><span>Skor 200–800 ditampilkan sebagai estimasi linear agar mudah memantau perkembangan latihan.</span></div><div class="rule-row"><span class="rule-check">3</span><span>Konversi dan ambang target pada aplikasi bukan skor resmi atau prediksi kelulusan PIP UNPAD.</span></div></div></section>`, 'profile');
 document.getElementById('profileForm').addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('profileName').value.trim();if(!name)return;profile.name=name;save(STORAGE.profile,profile);toast('Nama peserta diperbarui.');renderProfile();});
}
function exportAllData(){const data={app:'latihan doπ',exportedAt:new Date().toISOString(),profile,history};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`backup-dopi-${slug(profile.name)}.json`;a.click();URL.revokeObjectURL(url);}
function confirmClearData(){showConfirm('Hapus semua data lokal?','Profil nama dan seluruh riwayat hasil akan dihapus dari browser ini. Tindakan ini tidak dapat dibatalkan.', 'Hapus data',()=>{localStorage.removeItem(STORAGE.profile);localStorage.removeItem(STORAGE.results);profile=null;history=[];currentView='home';render();});}
window.addEventListener('keydown',e=>{if(!attempt)return;if(['1','2','3','4','5'].includes(e.key)){chooseAnswer(Number(e.key)-1);}else if(e.key==='ArrowRight')nextQuestion();else if(e.key==='ArrowLeft')previousQuestion();});
render();

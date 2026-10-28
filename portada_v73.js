(()=>{'use strict';
const $=id=>document.getElementById(id), all=q=>Array.from(document.querySelectorAll(q));
const today=()=>new Date().toLocaleDateString('sv-SE');
const safeGet=(key, fallback)=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch(e){return fallback}};
const safeSet=(key, value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}};
const on=(id,ev,fn)=>{const el=$(id);if(el)el.addEventListener(ev,fn);return el};
const keys={avatar:'EDUMIND_V78_AVATAR',played:'EDUMIND_V78_PLAYED'};
const gameCards=all('.game-card');
const gameMap=gameCards.map(a=>({a,cat:a.dataset.cat||'',title:(a.dataset.title||a.textContent||'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'')}));
let avatar=safeGet(keys.avatar,'🦊');
let played=safeGet(keys.played,[]); if(!Array.isArray(played)) played=[];
if($('heroAvatar')) $('heroAvatar').textContent=avatar;
function toast(message){const el=$('notification'); if(!el) return; el.textContent=message; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),3200)}
function stats(){const total=gameCards.length; const playedCount=played.length; const areas=all('[data-section]').length || 11; if($('statTotalGames')) $('statTotalGames').textContent=String(total); if($('statPlayedGames')) $('statPlayedGames').textContent=String(playedCount); if($('statCustomGames')) $('statCustomGames').textContent=String(areas);}
function play(href,cat,name){played.push({href,cat,name,date:today()}); if(played.length>500) played=played.slice(-500); safeSet(keys.played,played); stats();}
gameCards.forEach(a=>a.addEventListener('click',()=>play(a.getAttribute('href'),a.dataset.cat||'',a.textContent.trim())));
let active='all';
function filter(){const input=$('searchInput'); const needle=((input?.value)||'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); let shown=0; const per={}; for(const x of gameMap){const match=(active==='all'||active===x.cat)&&(!needle||x.title.includes(needle)||x.cat.includes(needle)); x.a.classList.toggle('hidden',!match); if(match){shown++; per[x.cat]=(per[x.cat]||0)+1;}} all('[data-section]').forEach(sec=>sec.classList.toggle('hidden', !(per[sec.dataset.section]>0))); if($('resultCount')) $('resultCount').textContent=shown+' actividades encontradas.'; if($('noResults')) $('noResults').classList.toggle('show',shown===0);}
on('searchInput','input',()=>{active='all'; all('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all')); filter(); if(($('searchInput')?.value||'').trim()) $('filtros')?.scrollIntoView({behavior:'smooth',block:'start'})});
all('[data-filter]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter; all('[data-filter]').forEach(x=>x.classList.toggle('active',x===b)); filter();}));
on('randomGameBtn','click',()=>{const visible=gameCards.filter(c=>!c.classList.contains('hidden')); const pool=visible.length?visible:gameCards; const a=pool[Math.floor(Math.random()*pool.length)]; if(!a) return; play(a.getAttribute('href'),a.dataset.cat||'',a.textContent.trim()); window.location.assign(a.getAttribute('href'));});
function open(id){$(id)?.classList.add('open');}
function close(id){$(id)?.classList.remove('open');}
on('avatarOpenBtn','click',()=>open('avatarModal'));
on('closeAvatar','click',()=>close('avatarModal'));
all('[data-avatar]').forEach(b=>b.addEventListener('click',()=>{avatar=b.dataset.avatar; all('[data-avatar]').forEach(x=>x.classList.toggle('selected',x===b));}));
on('avatarConfirm','click',()=>{safeSet(keys.avatar,avatar); if($('heroAvatar')) $('heroAvatar').textContent=avatar; close('avatarModal'); toast('¡Personaje elegido! '+avatar);});
all('.modal-backdrop').forEach(mod=>mod.addEventListener('click',ev=>{if(ev.target===mod)mod.classList.remove('open');}));
window.addEventListener('keydown',ev=>{if(ev.key==='Escape') close('avatarModal');});

let selectedDonationAmount='50';
all('[data-amount]').forEach(button=>button.addEventListener('click',()=>{selectedDonationAmount=button.dataset.amount;all('[data-amount]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
async function copyDonation(value,message){let ok=false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);ok=true}}catch(e){}if(!ok){try{const t=document.createElement('textarea');t.value=value;t.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(t);t.select();ok=document.execCommand('copy');t.remove()}catch(e){}}const status=$('donationCopyStatus');if(status)status.textContent=ok?message:'No se pudo copiar automáticamente; selecciona y copia el número de transferencia.';}
on('donationCopyClabe','click',()=>copyDonation('072075006745874477','CLABE copiada. Verifica el destinatario antes de transferir.'));
on('donationCopyDetails','click',()=>copyDonation('EDUMIND PRIME\nTitular: David Contreras Terrazas\nCLABE: 072075006745874477\nAportación sugerida: $'+selectedDonationAmount+' MXN','Datos de transferencia copiados.'));
stats(); filter();
})();

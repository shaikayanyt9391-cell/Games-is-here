import {G,world,setTimeOfDay} from '../core/engine.js';
import {spawnVehicle} from '../entities/vehicles.js';
import {clearWanted} from '../world/police_ai.js';
const $=id=>document.getElementById(id);
const sp=(id,n)=>()=>spawnVehicle(id)?n+' DELIVERED':'YOU ARE ALREADY DRIVING IT';
const tg=(k,n)=>()=>{G[k]=!G[k];return n+(G[k]?' ON':' OFF');};
export const CHEATS={
 '9999':['Royal Bullet 350',sp('royal_bullet','ROYAL BULLET 350')],'5000':['Hayabusa 1300 Superbike',sp('hayabusa_1300','HAYABUSA 1300')],
 '9191':['Modified Thar 4x4',sp('thar_4x4','MODIFIED THAR')],'3333':['Lamborghini V12',sp('lambo_v12','LAMBORGHINI V12')],
 '101':['Police Interceptor',sp('police_interceptor','POLICE INTERCEPTOR')],'1212':['Monster Truck',sp('monster_truck','MONSTER TRUCK')],
 '7112':['Moon Gravity',()=>{G.moon=!G.moon;world.gravity.set(0,G.moon?-2.5:-9.82,0);return 'MOON GRAVITY '+(G.moon?'ON':'OFF');}],
 '1216':['Super Jump',tg('superJump','SUPER JUMP')],
 '1112':['Slow-Motion Matrix',()=>{G.timeScale=G.timeScale<1?1:.35;return 'MATRIX MODE '+(G.timeScale<1?'ON':'OFF');}],
 '9129':['God Mode',tg('god','GOD MODE')],'0000':['Clear Wanted Stars',()=>{clearWanted();return 'WANTED LEVEL CLEARED';}],
 '9':['Cycle Time of Day',()=>setTimeOfDay((G.tod+1)%3)]};
let n='',mt;
const show=()=>{$('pdisp').textContent=n||'—';};
const msg=t=>{const e=$('cmsg');e.textContent=t;e.style.display='block';clearTimeout(mt);mt=setTimeout(()=>e.style.display='none',2200);};
export function closePhone(){G.phone=false;$('phone').style.display='none';}
function openPhone(){if(G.missionActive){msg('📵 NO SIGNAL — PHONE LOCKED DURING MISSION');return;}G.phone=true;n='';show();$('phone').style.display='block';}
const toggle=()=>G.phone?closePhone():openPhone();
const add=k=>{if(n.length<5){n+=k;show();}};
const clr=()=>{n='';show();};
function call(){const c=CHEATS[n];if(c){closePhone();msg('📞 '+c[1]());}else msg('📵 NUMBER NOT IN SERVICE');clr();}
export function initPhone(){
 $('pkeys').innerHTML=[...'123456789*0#'].map(k=>`<button data-n="${k}">${k}</button>`).join('');
 $('plist').innerHTML=Object.entries(CHEATS).map(([c,v])=>`<div><b>${c}</b> ${v[0]}</div>`).join('');
 $('pkeys').onclick=e=>{const k=e.target.dataset.n;if(k)add(k);};
 $('phoneBtn').onclick=toggle;$('pclose').onclick=closePhone;$('pclr').onclick=clr;$('pcall').onclick=call;
 $('ptabs').onclick=e=>{const t=e.target.dataset.t;if(!t)return;$('pdial').style.display=t==='d'?'block':'none';$('plist').style.display=t==='c'?'block':'none';
  document.querySelectorAll('#ptabs b').forEach(b=>b.classList.toggle('on',b.dataset.t===t));};
 addEventListener('keydown',e=>{
  if(e.code==='KeyP'&&!e.repeat&&(G.GAME_STATE==='STORY'||G.GAME_STATE==='SANDBOX')){toggle();return;}
  if(!G.phone)return;let h=true;
  if(/^(Digit|Numpad)\d$/.test(e.code))add(e.code.slice(-1));else if(e.code==='Enter'||e.code==='NumpadEnter')call();
  else if(e.code==='Backspace')clr();else if(e.code==='Escape')closePhone();else h=false;
  if(h){e.stopImmediatePropagation();e.preventDefault();}},true);
}

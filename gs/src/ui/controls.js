import * as THREE from 'three';
export const input={up:0,down:0,left:0,right:0,sprint:0,jump:0,fire:0,brake:0};
const KM={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',ShiftLeft:'sprint',ShiftRight:'sprint',Space:'jump',KeyE:'fire',Enter:'fire',KeyX:'brake'};
const $=id=>document.getElementById(id);
export function initControls(cb){
 addEventListener('keydown',e=>{const k=KM[e.code];if(k){input[k]=1;e.preventDefault();}
  if(!e.repeat){if(e.code==='KeyF')cb.ride();if(e.code==='Digit1')cb.weapon();}});
 addEventListener('keyup',e=>{const k=KM[e.code];if(k)input[k]=0;});
 document.querySelectorAll('#hud [data-k]').forEach(b=>{const k=b.dataset.k;
  b.addEventListener('pointerdown',e=>{input[k]=1;e.preventDefault();});
  ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>input[k]=0));});
 $('ride').onclick=cb.ride;$('wbtn').onclick=cb.weapon;
 addEventListener('contextmenu',e=>e.preventDefault());
}
const want=new THREE.Vector3(),tgt=new THREE.Vector3(),look=new THREE.Vector3();
export function chaseCam(camera,dt,p){
 const a=p.active,bike=a&&a.type==='bike',h=a?a.heading:p.heading,d=a?(bike?6.5:9.5):5.5,hh=a?(bike?2.6:3.8):2.4;
 tgt.copy((a?a.body:p.body).position);tgt.y+=a?1:.8;
 want.set(tgt.x-Math.sin(h)*d,tgt.y+hh,tgt.z-Math.cos(h)*d);want.y=Math.max(want.y,1.2);
 if(p.snap){camera.position.copy(want);look.copy(tgt);p.snap=false;}
 else{const k=1-Math.pow(.002,dt);camera.position.lerp(want,k);look.lerp(tgt,Math.min(1,k*1.5));}
 camera.lookAt(look);
}
export function updateHUD(p,near,kmh,wname){
 $('hpf').style.width=Math.max(0,p.hp)+'%';$('cash').textContent='₹'+p.cash;$('spd').textContent=Math.round(kmh)+' km/h';
 $('wname').textContent=wname;$('ride').textContent=p.active?'🚗 EXIT':'🚗 RIDE';$('ride').style.opacity=(p.active||near)?1:.4;
}
let tt;export function toast(t){const e=document.getElementById('cmsg');e.textContent=t;e.style.display='block';clearTimeout(tt);tt=setTimeout(()=>e.style.display='none',2200);}

import * as THREE from 'three';
import {resetPlayer,player as pState} from '../entities/player.js';
import {G,scene,camera,setGraphics,QUALITY} from '../core/engine.js';
const L=c=>new THREE.MeshLambertMaterial({color:c});
const add=(p,g,c,x,y,z,rx=0,rz=0)=>{const m=new THREE.Mesh(g,L(c));m.position.set(x,y,z);m.rotation.set(rx,0,rz);m.castShadow=true;p.add(m);return m;};
const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d),Cy=(r,h)=>new THREE.CylinderGeometry(r,r,h,12);
function bike(){const g=new THREE.Group();
 for(const z of[-.6,.6])add(g,Cy(.33,.14),0x111111,0,.33,z,0,Math.PI/2);
 add(g,B(.3,.35,1),0xd81b60,0,.7,0);add(g,B(.28,.2,.5),0x222222,0,.95,-.2);add(g,B(.4,.4,.35),0xd81b60,0,.9,.45);
 add(g,B(.7,.06,.06),0x999999,0,1.1,.5);add(g,B(.06,.5,.06),0x999999,0,.65,.62);return g;}
function thar(){const g=new THREE.Group();
 add(g,B(1.8,.9,3.8),0x9c2020,0,.9,0);add(g,B(1.7,.8,1.7),0x2b2b2b,0,1.7,-.5);add(g,B(1.6,.05,1.7),0x111111,0,2.12,-.5);
 for(const x of[-.95,.95])for(const z of[-1.2,1.2])add(g,Cy(.45,.35),0x111111,x,.45,z,0,Math.PI/2);
 add(g,B(1.2,.1,.1),0xffffff,0,1,1.92);return g;}
function player(){const g=new THREE.Group();
 add(g,B(.5,.85,.3),0x1b1b1b,0,.43,0);add(g,B(.6,.7,.35),0x2e4a7d,0,1.2,0);add(g,new THREE.SphereGeometry(.2,10,8),0xc68642,0,1.75,0);
 add(g,B(.14,.6,.14),0x2e4a7d,-.38,1.2,0);add(g,B(.14,.6,.14),0x2e4a7d,.38,1.2,0);return g;}
const showroomGroup=new THREE.Group();
const items=[new THREE.Vector3(0,1,0)];
let ang=0,rad=9,h=3,idx=0;const f=new THREE.Vector3(0,1,0);
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
function mode(m){G.GAME_STATE=m;const menu=m==='HOME_MENU';
 $('#menu').style.display=menu?'flex':'none';$('#title').style.display=menu?'block':'none';
 $('#bar').style.display=m==='GARAGE'?'flex':'none';$('#back').style.display=menu?'none':'block';
 idx=m==='GARAGE'?1:0;const pl=m==='STORY'||m==='SANDBOX';
 showroomGroup.visible=(G.GAME_STATE==='HOME_MENU'||G.GAME_STATE==='GARAGE');
 $('#hud').style.display=pl?'block':'none';if(pl)resetPlayer();const gi=$('#ginfo');gi.style.display=m==='GARAGE'?'block':'none';
 if(m==='GARAGE')gi.innerHTML='💰 ₹'+pState.cash.toLocaleString('en-IN')+'<br>🏁 MISSIONS '+G.completed.length+'/5<br>🔓 '+[...G.unlocked].join(', ');}
function gfx(){all('.g').forEach(e=>e.classList.toggle('on',e.dataset.q===G.quality));}
export function initMenu(){
 const b=bike(),t=thar(),p=player();b.position.set(-3,0,0);b.rotation.y=.6;t.position.set(4,0,0);t.rotation.y=-.5;p.position.set(-1.6,0,.8);
 showroomGroup.add(b,t,p);scene.add(showroomGroup);items.push(new THREE.Vector3(-3,.8,0),new THREE.Vector3(4,1,0),new THREE.Vector3(-1.6,1,.8));
 setGraphics('LOW');gfx();
 document.addEventListener('click',e=>{const c=e.target.closest('[data-a]');if(!c)return;const a=c.dataset.a;
  if(a==='story')mode('STORY');else if(a==='sandbox')mode('SANDBOX');else if(a==='garage')mode('GARAGE');
  else if(a==='gfx'){const k=Object.keys(QUALITY);setGraphics(k[(k.indexOf(G.quality)+1)%k.length]);gfx();}
  else if(a==='next')idx=idx%3+1;else if(a==='prev')idx=(idx+1)%3+1;});
 $('#back').onclick=()=>mode('HOME_MENU');
}
export function updateMenu(dt){
 const garage=G.GAME_STATE==='GARAGE';
 ang+=dt*(garage?.5:.22);rad+=((garage?5:9)-rad)*.05;h+=((garage?2:3)-h)*.05;f.lerp(items[garage?idx:0],.06);
 camera.position.set(f.x+Math.sin(ang)*rad,f.y+h,f.z+Math.cos(ang)*rad);camera.lookAt(f.x,f.y+.4,f.z);
}

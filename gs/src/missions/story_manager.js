import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {G} from '../core/engine.js';
import {player} from '../entities/player.js';
import {vehicles,makeVehicle,specById,drive,box,wheel} from '../entities/vehicles.js';
import {setWanted,getStars,clearWanted} from '../world/police_ai.js';
import {sfx,saveGame} from '../core/audio_save.js';
const $=id=>document.getElementById(id),cl=(x,a,b)=>Math.max(a,Math.min(b,x));
const NAMES=['THE FIRST SCORE','ROOFTOP STUNTMAN','HIGHWAY HEIST','SYNDICATE AMBUSH','THE GRAND HEIST'];
const REWARD=[5000,10000,18000,30000,100000],UNLOCK=['royal_bullet','lambo_v12','police_interceptor','monster_truck',null];
const START=[-20,-8],SAFE=[-180,120],HIDE=[-240,-240],ENEMY=[[63,-57],[123,-57],[123,-117],[183,-117],[183,-57]];
const RINGS=[[140,10,120,Math.PI/2],[110,10,140,0],[170,10,198,0]],WP=[[280,280],[-280,280],[-280,-280],[280,-280]];
export const storyGroup=new THREE.Group();
const mat=c=>new THREE.MeshLambertMaterial({color:c,emissive:c,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false});
const MY=mat(0xffd800),MG=mat(0x22dd44),MR=mat(0xff2222),CYL=new THREE.CylinderGeometry(2.2,2.2,40,14,1,true);
const mk=m=>{const o=new THREE.Mesh(CYL,m);o.visible=false;storyGroup.add(o);return o;};
let mY,mG,mR=[],allM=[],ringM=[],enemies=[],truck,tv,thar,hay;
const S={cur:-1,stage:0,t:0,ring:0,wi:0,deaths:0},Zv=new CANNON.Vec3(0,0,1),F=new CANNON.Vec3(),inp={up:1,down:0,left:0,right:0,jump:0,brake:0};
const pos=()=>(player.active?player.active.body:player.body).position,d2=(a,x,z)=>Math.hypot(a.x-x,a.z-z);
const put=(m,x,z)=>{m.position.set(x,20,z);m.visible=true;},obj=t=>{$('obj').textContent=t;};
function banner(t,s,cls=''){const b=$('banner');b.innerHTML=`<h1>${t}</h1><p>${s}</p>`;b.className='show '+cls;clearTimeout(banner.t);banner.t=setTimeout(()=>b.className='',3200);}
function placeV(v,x,y,z,yaw){const b=v.body;b.wakeUp();b.position.set(x,y,z);b.quaternion.setFromEuler(0,yaw,0);b.velocity.set(0,0,0);b.angularVelocity.set(0,0,0);}
const parkV=v=>{v.body.position.set(900,-200,900);v.body.sleep();};
function truckBuild(){const g=new THREE.Group();box(g,2.4,2,2.2,0xc0392b,0,.3,2.5);box(g,2.2,.7,.1,0x222222,0,.8,3.62);box(g,2.6,2.8,6.2,0x1f6f9f,0,1,-1.2);
 for(const z of[-3.2,-1.8,2.6])for(const x of[-1,1])wheel(g,.6,.45,x*1.25,-.6,z);return g;}
export function initStory(scene,world){scene.add(storyGroup);mY=mk(MY);mG=mk(MG);for(let i=0;i<5;i++)mR.push(mk(MR));allM=[mY,mG,...mR];
 RINGS.forEach(r=>{const m=new THREE.Mesh(new THREE.TorusGeometry(6,.55,8,24),new THREE.MeshLambertMaterial({color:0x22dd44,emissive:0x22dd44}));m.position.set(r[0],r[1],r[2]);m.rotation.y=r[3];m.visible=false;storyGroup.add(m);ringM.push(m);});
 for(let i=0;i<5;i++){const m=new THREE.Group(),a=new THREE.Mesh(new THREE.BoxGeometry(.5,.9,.3),new THREE.MeshLambertMaterial({color:0xaa1111})),h=new THREE.Mesh(new THREE.BoxGeometry(.28,.28,.28),new THREE.MeshLambertMaterial({color:0xc68642}));
  h.position.y=.7;m.add(a,h);m.visible=false;storyGroup.add(m);
  const body=new CANNON.Body({mass:0,type:CANNON.Body.KINEMATIC,shape:new CANNON.Sphere(.45),collisionFilterGroup:1,collisionFilterMask:0,position:new CANNON.Vec3(900,.5,900)});
  world.addBody(body);enemies.push({m,body,hp:50,on:false});}
 thar=vehicles.find(v=>v.id==='thar_4x4');hay=vehicles.find(v=>v.id==='hayabusa_1300');
 truck=makeVehicle({id:'container_truck',type:'car',speed:22,mass:5000,half:[1.3,1.2,3.5],pos:[900,900],free:true,build:truckBuild},true);parkV(truck);
 tv=makeVehicle(specById('lambo_v12'),false);parkV(tv);}
const offE=e=>{e.on=false;e.m.visible=false;e.body.collisionFilterMask=0;e.body.position.set(900,.5,900);};
function killE(e){offE(e);sfx.ding();}
export function storyHit(b,d){const e=enemies.find(k=>k.on&&k.body===b);if(e){e.hp-=d;if(e.hp<=0)killE(e);}}
export function storyBlast(p){for(const e of enemies)if(e.on&&Math.hypot(e.body.position.x-p.x,e.body.position.z-p.z)<8)killE(e);}
export function storyPunch(x,z){for(const e of enemies)if(e.on&&Math.hypot(e.body.position.x-x,e.body.position.z-z)<1.8){e.hp-=20;if(e.hp<=0)killE(e);}}
const MIS=[
 ()=>{if(S.stage===0){put(mG,thar.body.position.x,thar.body.position.z);obj('Steal the Thar SUV in Downtown');if(player.active===thar){S.stage=1;S.t=0;}}
  if(S.stage===1){const left=60-S.t;put(mG,SAFE[0],SAFE[1]);obj(`Deliver the Thar to the Safe House — ${left.toFixed(0)}s`);
   if(left<=0)return 'fail';if(player.active===thar&&d2(thar.body.position,SAFE[0],SAFE[1])<7)return 'pass';}},
 ()=>{const a=player.active,bike=a&&a.type==='bike';
  if(S.stage===0){put(mG,hay.body.position.x,hay.body.position.z);obj('Get on a Superbike');if(bike)S.stage=1;}
  if(S.stage===1){put(mG,80,120);obj('Ride to the Stunt Park');if(bike&&d2(a.body.position,80,120)<9)S.stage=2;}
  if(S.stage===2){mG.visible=false;ringM.forEach((m,i)=>{m.visible=i>=S.ring;m.material.color.setHex(i===S.ring?0x22dd44:0x888844);m.material.emissive.setHex(i===S.ring?0x22dd44:0x222200);});
   obj(`Fly through the aerial rings ${S.ring}/3 (ramp up!)`);
   if(bike){const R=RINGS[S.ring],b=a.body.position;if(Math.hypot(b.x-R[0],b.y-R[1],b.z-R[2])<8){S.ring++;sfx.ding();if(S.ring>=3)return 'pass';}}}},
 dt=>{tv.body.quaternion.vmult(Zv,F);tv.heading=Math.atan2(F.x,F.z);const b=tv.body.position,w=WP[S.wi];
  if(d2(b,w[0],w[1])<30)S.wi=(S.wi+1)%4;
  let d=Math.atan2(w[0]-b.x,w[1]-b.z)-tv.heading;d=Math.atan2(Math.sin(d),Math.cos(d));inp.left=cl(d*1.5,0,1);inp.right=cl(-d*1.5,0,1);
  tv.speed=27;drive(tv,dt,inp);tv.mesh.position.copy(b);tv.mesh.quaternion.copy(tv.body.quaternion);
  put(mR[0],b.x,b.z);const left=120-S.t;obj(`Intercept the target on the Ring Road — ${d2(pos(),b.x,b.z).toFixed(0)}m — ${left.toFixed(0)}s`);
  if(left<=0)return 'fail';if(player.active&&d2(player.active.body.position,b.x,b.z)<6)return 'pass';},
 dt=>{if(S.stage===0){let alive=0;const p=pos();
   enemies.forEach((e,i)=>{if(!e.on){mR[i].visible=false;return;}alive++;const b=e.body.position;put(mR[i],b.x,b.z);e.m.position.set(b.x,b.y,b.z);
    e.m.rotation.y=Math.atan2(p.x-b.x,p.z-b.z);if(d2(p,b.x,b.z)<16)player.hp-=6*dt;});
   obj(`Eliminate the rival targets ${5-alive}/5`);if(!alive){S.stage=1;S.t=0;setWanted(Math.max(2,getStars()));}}
  if(S.stage===1){mR.forEach(m=>m.visible=false);obj('Escape the police chase — lose the cops!');if(S.t>2&&getStars()===0)return 'pass';}},
 ()=>{if(S.stage===0){put(mG,truck.body.position.x,truck.body.position.z);obj('Grab the container truck at the Airport');if(player.active===truck){S.stage=1;S.t=0;setWanted(4);}}
  if(S.stage===1){put(mG,HIDE[0],HIDE[1]);if(getStars()<4)setWanted(4);obj('Survive the 4★ swarm — reach the hideout');
   if(player.active===truck&&d2(truck.body.position,HIDE[0],HIDE[1])<9)return 'pass';}}];
function begin(i){S.cur=i;S.stage=0;S.t=0;S.ring=0;S.wi=0;S.deaths=player.deaths;G.missionActive=true;clearWanted();banner(NAMES[i],'MISSION '+(i+1)+' / 5');
 if(i===0){thar.owned=false;if(player.active!==thar)placeV(thar,-120,.8,-60,0);}
 if(i===2)placeV(tv,280,.8,-100,0);
 if(i===3)enemies.forEach((e,k)=>{e.hp=50;e.on=true;e.m.visible=true;e.body.collisionFilterMask=-1;e.body.position.set(ENEMY[k][0],.5,ENEMY[k][1]);});
 if(i===4&&player.active!==truck)placeV(truck,230,1.4,100,0);}
function end(){S.cur=-1;G.missionActive=false;allM.forEach(m=>m.visible=false);ringM.forEach(m=>m.visible=false);enemies.forEach(offE);parkV(tv);obj('');}
function pass(){const i=S.cur;player.cash+=REWARD[i];if(!G.completed.includes(i))G.completed.push(i);if(UNLOCK[i])G.unlocked.add(UNLOCK[i]);
 banner('MISSION PASSED','RESPECT +  ₹'+REWARD[i].toLocaleString('en-IN')+(UNLOCK[i]?'<br>🔓 '+UNLOCK[i].toUpperCase():''),'pass');sfx.pass();clearWanted();end();saveGame();}
function fail(m){banner('MISSION FAILED',m,'fail');sfx.fail();end();}
export function abortMission(){if(S.cur>=0)end();obj('');}
export function updateStory(dt){const p=pos();
 if(S.cur<0){const i=G.completed.length;mG.visible=false;
  if(i<5){put(mY,START[0],START[1]);obj('Go to the yellow marker: '+NAMES[i]);if(d2(p,START[0],START[1])<4)begin(i);}
  else{mY.visible=false;obj('🏆 CAMPAIGN COMPLETE');}return;}
 mY.visible=false;S.t+=dt;if(player.deaths!==S.deaths)return fail('WASTED');
 const r=MIS[S.cur](dt);if(r==='pass')pass();else if(r==='fail')fail('TIME UP');
 MY.opacity=MG.opacity=MR.opacity=.35+.15*Math.sin(performance.now()/200);}
const blips=[];
export function getBlips(){blips.length=0;for(const m of allM)if(m.visible)blips.push({x:m.position.x,z:m.position.z,c:m===mY?'#ffd800':m===mG?'#22dd44':'#ff3333'});return blips;}

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {player} from '../entities/player.js';
export const trafficGroup=new THREE.Group();
const RD=[-240,-180,-120,-60,0,60,120,180,240],cars=[],peds=[],all=[],byBody=new Map();
const nr=v=>RD.reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a),cl=(x,a,b)=>Math.max(a,Math.min(b,x));
const COL=[0x2980b9,0xecf0f1,0x27ae60,0x8e44ad,0xf39c12,0x7f8c8d,0xc0392b,0x16a085,0xf1c40f,0x34495e];
const CG=new THREE.BoxGeometry(1.8,.8,4),CC=new THREE.BoxGeometry(1.6,.6,2),PG=new THREE.BoxGeometry(.5,.9,.3),PH=new THREE.BoxGeometry(.28,.28,.28);
const L=c=>new THREE.MeshLambertMaterial({color:c});
const face=e=>e.body.quaternion.setFromEuler(0,e.z?(e.dir>0?0:Math.PI):(e.dir>0?Math.PI/2:-Math.PI/2),0);
function put(e,init){const p=player.body.position,h=player.heading,z=Math.random()<.5,r=nr(z?p.x:p.z),base=z?p.z:p.x,ah=Math.sign(z?Math.cos(h):Math.sin(h))||1;
 const dir=Math.random()<.5?1:-1,off=e.ped?(Math.random()<.5?8.2:-8.2):-3*dir;
 let t=cl(base+ah*(init?Math.random()*160-80:70+Math.random()*50),-275,275);
 const pos=()=>z?[r+off,t]:[t,r+off];let[x,zz]=pos();
 if(Math.hypot(x-p.x,zz-p.z)<22){t=cl(t+ah*45,-275,275);[x,zz]=pos();}
 e.z=z;e.dir=dir;e.flee=0;e.hit=0;e.sp=e.ped?1.4:8+Math.random()*4;
 e.body.position.set(x,e.ped?.5:.6,zz);face(e);e.m.visible=true;}
function react(e){e.flee=4;if(e.ped){const b=e.body.position;e.dir=Math.sign((e.z?b.z-player.body.position.z:b.x-player.body.position.x))||1;face(e);}}
function kill(e){if(e.hit>0)return;e.hit=3;e.body.velocity.set(0,0,0);if(player.onCrime)player.onCrime(.8);}
export function initTraffic(scene,world){scene.add(trafficGroup);
 for(let i=0;i<22;i++){const ped=i>=10,m=new THREE.Group();
  if(!ped){const a=new THREE.Mesh(CG,L(COL[i]));a.position.y=-.1;const c=new THREE.Mesh(CC,L(0x222222));c.position.set(0,.5,-.2);m.add(a,c);}
  else{const a=new THREE.Mesh(PG,L(COL[i%10]));const h=new THREE.Mesh(PH,L(0xc68642));h.position.y=.7;m.add(a,h);}
  trafficGroup.add(m);
  const body=new CANNON.Body({mass:0,type:CANNON.Body.KINEMATIC,shape:ped?new CANNON.Sphere(.4):new CANNON.Box(new CANNON.Vec3(.9,.7,2)),collisionFilterGroup:1,collisionFilterMask:-1});
  world.addBody(body);const e={m,body,ped,flee:0,hit:0,dir:1,z:true,sp:8};(ped?peds:cars).push(e);all.push(e);byBody.set(body,e);
  body.addEventListener('collide',ev=>{const o=ev.body,a=player.active,fast=a&&o===a.body&&Math.hypot(a.body.velocity.x,a.body.velocity.z)>3;
   if(o===player.body||(a&&o===a.body)){if(ped&&fast)kill(e);else if(e.flee<=0){react(e);if(!ped&&player.onCrime)player.onCrime(.5);}}});}}
export function resetTraffic(){for(const e of all)put(e,true);}
export function trafficHit(b){const e=byBody.get(b);if(!e)return;if(e.ped)kill(e);else react(e);}
export function trafficPunch(x,z){for(const e of peds)if(Math.hypot(e.body.position.x-x,e.body.position.z-z)<1.8){react(e);kill(e);}}
export function trafficBlast(pos){for(const e of all)if(Math.hypot(e.body.position.x-pos.x,e.body.position.z-pos.z)<10){if(e.ped)kill(e);else react(e);}}
export function updateTraffic(dt){const p=player.body.position;
 for(const e of all){const b=e.body;if(e.flee>0)e.flee-=dt;
  if(e.hit>0){e.hit-=dt;b.velocity.set(0,0,0);if(e.hit<=0){put(e,false);continue;}}
  else{if(e.ped&&player.weapon>0&&e.flee<=0&&Math.hypot(b.position.x-p.x,b.position.z-p.z)<12)react(e);
   const sp=e.flee>0?(e.ped?5:e.sp*1.7):e.sp;b.velocity.set(e.z?0:e.dir*sp,0,e.z?e.dir*sp:0);}
  e.m.position.copy(b.position);e.m.quaternion.copy(b.quaternion);if(e.hit>0){e.m.rotateX(-Math.PI/2);e.m.position.y=.2;}
  if(Math.hypot(b.position.x-p.x,b.position.z-p.z)>130||Math.abs(b.position.x)>285||Math.abs(b.position.z)>285)put(e,false);}}

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
export const G={GAME_STATE:'HOME_MENU',quality:'LOW',timeScale:1,moon:false,superJump:false,god:false,phone:false,tod:0,completed:[],unlocked:new Set(['hayabusa_1300','thar_4x4']),missionActive:false};
export const QUALITY={LOW:140,MEDIUM:250,ULTRA:400};
export const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.25));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
document.body.prepend(renderer.domElement);
export const scene=new THREE.Scene();
scene.background=new THREE.Color(0x87b5e0);scene.fog=new THREE.Fog(0x87b5e0,56,133);
export const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.1,QUALITY.LOW);
export const hemi=new THREE.HemisphereLight(0xffffff,0x444444,1.4);scene.add(hemi);
export const sun=new THREE.DirectionalLight(0xfff2d6,1.2);sun.position.set(60,100,40);sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);const sc=sun.shadow.camera;sc.left=sc.bottom=-80;sc.right=sc.top=80;sc.near=1;sc.far=250;
scene.add(sun,sun.target);
export const world=new CANNON.World({gravity:new CANNON.Vec3(0,-9.82,0)});
world.broadphase=new CANNON.SAPBroadphase(world);world.allowSleep=true;
export function setGraphics(q){G.quality=q;const f=QUALITY[q];camera.far=f;camera.updateProjectionMatrix();scene.fog.near=f*0.4;scene.fog.far=f*0.95;}
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
const el=document.getElementById('fps');let last=performance.now(),acc=0,fr=0;
export function tick(){const n=performance.now(),dt=Math.min((n-last)/1000,0.1);last=n;acc+=dt;fr++;
 if(acc>=0.5){const m=performance.memory?(performance.memory.usedJSHeapSize/1048576).toFixed(0)+' MB':'n/a';
  el.textContent=`FPS ${Math.round(fr/acc)}\nRAM ${m}\nDraw ${renderer.info.render.calls}`;acc=0;fr=0;}
 return dt;}
const TOD=[['SUNNY NOON',0x87b5e0,0xfff2d6,1.2,[60,100,40],0xffffff,0x444444,1.4],['GOLDEN SUNSET',0xff9a5a,0xff7a30,1.1,[100,35,40],0xffd2a0,0x553322,1.2],['NEON MIDNIGHT',0x0b0b2e,0x7a5cff,.5,[-60,80,-40],0x8f8fff,0x3a1a5a,1.0]];
export function setTimeOfDay(i){G.tod=i;const t=TOD[i];scene.background.set(t[1]);scene.fog.color.set(t[1]);sun.color.set(t[2]);sun.intensity=t[3];sun.position.set(...t[4]);
 hemi.color.set(t[5]);hemi.groundColor.set(t[6]);hemi.intensity=t[7];return t[0];}

import {G} from './engine.js';
import {player} from '../entities/player.js';
import {input} from '../ui/controls.js';
let ac,master,noise,eo,eg,sg,sgn;
const cl=(x,a,b)=>Math.max(a,Math.min(b,x));
function init(){if(ac)return;try{ac=new(window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
 master=ac.createGain();master.gain.value=.55;master.connect(ac.destination);
 noise=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 eo=ac.createOscillator();eo.type='sawtooth';const ef=ac.createBiquadFilter();ef.type='lowpass';ef.frequency.value=420;eg=ac.createGain();eg.gain.value=0;
 eo.connect(ef).connect(eg).connect(master);eo.start();
 const ns=ac.createBufferSource();ns.buffer=noise;ns.loop=true;const bf=ac.createBiquadFilter();bf.type='bandpass';bf.frequency.value=1800;bf.Q.value=9;
 sg=ac.createGain();sg.gain.value=0;ns.connect(bf).connect(sg).connect(master);ns.start();
 const so=ac.createOscillator();so.type='triangle';so.frequency.value=850;const lf=ac.createOscillator();lf.frequency.value=.8;const lg=ac.createGain();lg.gain.value=280;
 lf.connect(lg).connect(so.frequency);sgn=ac.createGain();sgn.gain.value=0;so.connect(sgn).connect(master);so.start();lf.start();}
['pointerdown','keydown','touchstart'].forEach(e=>addEventListener(e,()=>{init();if(ac&&ac.state==='suspended')ac.resume();}));
function burst(dur,f0,f1,vol){if(!ac)return;const t=ac.currentTime,s=ac.createBufferSource();s.buffer=noise;const f=ac.createBiquadFilter();f.type='lowpass';
 f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);const g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
 s.connect(f).connect(g).connect(master);s.start(t);s.stop(t+dur+.05);}
function tone(f0,f1,dur,vol,type='sine',delay=0){if(!ac)return;const t=ac.currentTime+delay,o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);
 o.frequency.exponentialRampToValueAtTime(f1,t+dur);const g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(master);o.start(t);o.stop(t+dur+.05);}
export const sfx={
 shot(w){if(w===1){burst(.2,5000,300,.6);tone(180,50,.12,.4);}else if(w===2){burst(.12,4500,500,.45);tone(150,60,.08,.3);}else{burst(.5,1500,150,.5);tone(120,40,.4,.4,'sawtooth');}},
 explosion(){burst(1.4,2500,60,1);tone(70,28,1.2,.8);},
 ding(){tone(880,1320,.25,.3,'square');},
 pass(){[523,659,784,1047].forEach((f,i)=>tone(f,f,.3,.25,'triangle',i*.14));},
 fail(){tone(300,90,.8,.35,'sawtooth');}};
export function audioUpdate(p,copDist){if(!ac)return;const t=ac.currentTime,a=p&&p.active;
 const sp=a?Math.hypot(a.body.velocity.x,a.body.velocity.z):0,r=a?Math.min(1,sp/a.speed):0;
 const base=a?(a.type==='bike'?60:(a.id==='monster_truck'||a.id==='container_truck')?32:42):0;
 eo.frequency.setTargetAtTime(base*(1+r*3.2)+(a&&input.up?15:0),t,.08);
 eg.gain.setTargetAtTime(a?.05+.05*r+(input.up?.03:0):0,t,.1);
 sg.gain.setTargetAtTime(a&&a.grounded?cl((a.slip-2.5)/8,0,.2):0,t,.05);
 sgn.gain.setTargetAtTime(p&&copDist<130?.1*(1-copDist/130):0,t,.2);}
const KEY='gs_save_v1';
export function saveGame(){try{localStorage.setItem(KEY,JSON.stringify({cash:player.cash,done:G.completed,unlocked:[...G.unlocked]}));}catch(e){}}
export function loadGame(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(!d)return;player.cash=d.cash|0;G.completed=d.done||[];
 G.unlocked=new Set([...G.unlocked,...(d.unlocked||[])]);}catch(e){}}
let acc=0;export function autosave(dt){acc+=dt;if(acc>10){acc=0;saveGame();}}
addEventListener('pagehide',saveGame);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame();});

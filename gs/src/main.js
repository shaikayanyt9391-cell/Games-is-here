import {G,renderer,scene,camera,world,tick} from './core/engine.js';
import {buildCity} from './world/city.js';
import {initMenu,updateMenu} from './ui/home_menu.js';
import {initPlayer,updatePlayer,player,nextWeapon,WEAPONS} from './entities/player.js';
import {initVehicles,updateVehicles,enterOrExitVehicle,nearestVehicle,vehicleGroup} from './entities/vehicles.js';
import {initControls,chaseCam,updateHUD} from './ui/controls.js';
import {initTraffic,updateTraffic,resetTraffic,trafficGroup,trafficHit,trafficPunch,trafficBlast} from './world/traffic_ai.js';
import {initPolice,updatePolice,resetPolice,policeGroup,policeHit,policeBlast,nearestCop,copList} from './world/police_ai.js';
import {initPhone,closePhone} from './ui/smartphone.js';
import {initStory,updateStory,storyGroup,getBlips,abortMission,storyHit,storyBlast,storyPunch} from './missions/story_manager.js';
import {drawRadar} from './ui/minimap.js';
import {audioUpdate,sfx,loadGame,autosave} from './core/audio_save.js';
addEventListener('error',e=>{document.getElementById('fps').textContent+='\nERR: '+e.message;});
loadGame();
buildCity(scene,world);initMenu();initPlayer(scene,world);initVehicles(scene,world);initTraffic(scene,world);initPolice(scene,world);initStory(scene,world);initPhone();
player.onHit=(b,d)=>{trafficHit(b);policeHit(b,d);storyHit(b,d);};
player.onExplode=p=>{trafficBlast(p);policeBlast(p);storyBlast(p);sfx.explosion();};
player.onPunch=(x,z)=>{trafficPunch(x,z);storyPunch(x,z);};
player.onShot=w=>sfx.shot(w);
const playing=()=>G.GAME_STATE==='STORY'||G.GAME_STATE==='SANDBOX';
initControls({ride:()=>playing()&&!G.phone&&enterOrExitVehicle(),weapon:()=>playing()&&!G.phone&&nextWeapon()});
let was=false,fr=0;
renderer.setAnimationLoop(()=>{const dtr=tick(),play=playing(),story=G.GAME_STATE==='STORY',dt=dtr*G.timeScale;
 vehicleGroup.visible=trafficGroup.visible=policeGroup.visible=play;storyGroup.visible=play&&story;
 if(play&&!was){resetTraffic();resetPolice();}
 if(!play&&was)abortMission();
 was=play;
 if(play){updateVehicles(dt);updatePlayer(dt);updateTraffic(dt);updatePolice(dt);if(story)updateStory(dt);
  if(G.god)player.hp=100;if(G.missionActive&&G.phone)closePhone();autosave(dtr);}
 else{player.mesh.visible=false;if(G.phone)closePhone();}
 world.step(1/60,dt,3);
 if(play){chaseCam(camera,dtr,player);const a=player.active;
  updateHUD(player,nearestVehicle(),(a?Math.hypot(a.body.velocity.x,a.body.velocity.z):player.speed)*3.6,WEAPONS[player.weapon]);
  if(fr++&1)drawRadar(player,story?getBlips():[],copList(),performance.now());}
 else if(G.GAME_STATE==='HOME_MENU'||G.GAME_STATE==='GARAGE')updateMenu(dtr);
 audioUpdate(play?player:null,play?nearestCop():999);
 renderer.render(scene,camera);});

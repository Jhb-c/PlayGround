import * as THREE from 'three';

const mount = document.querySelector('#game-view');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#bfeaf0');
scene.fog = new THREE.Fog('#bfeaf0', 23, 85);
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, .1, 120);
camera.position.set(0, 5.5, 10.5);
camera.lookAt(0, 1, -8);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight('#e8ffff', '#579c8e', 2.1));
const sun = new THREE.DirectionalLight('#fff4d3', 3.2);
sun.position.set(-5, 11, 6); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -12; sun.shadow.camera.right = 12; sun.shadow.camera.top = 15; sun.shadow.camera.bottom = -12;
scene.add(sun);
const mat = (color, roughness=.72, metalness=0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const mats = {
  grass:mat('#5ab7a0'), track:mat('#dfc78d'), trackLight:mat('#f3dda2'), edge:mat('#f7f0cc'), water:mat('#70cbd0'),
  white:mat('#fff9dc'), orange:mat('#f28c4c'), dark:mat('#294a54'), brown:mat('#a96843'), gold:mat('#ffc94d',.32,.2),
  crate:mat('#dc8650'), crateLight:mat('#f5b879'), lilypad:mat('#3caa89'), flower:mat('#ffecae'),
};
function mesh(geo, material, parent=scene, x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}

// Soft pond and its winding, buttery running path.
mesh(new THREE.PlaneGeometry(200,200),mats.water,scene,0,-.7,-35).rotation.x=-Math.PI/2;
mesh(new THREE.BoxGeometry(8.5,.28,110),mats.track,scene,0,-.27,-42);
mesh(new THREE.BoxGeometry(8,.09,110),mats.trackLight,scene,0,-.095,-42);
for(const x of [-4.18,4.18]) mesh(new THREE.BoxGeometry(.2,.48,110),mats.edge,scene,x,-.02,-42);
for(let z=8;z>-95;z-=5){mesh(new THREE.BoxGeometry(.12,.025,1.15),mat('#d6b66e'),scene,0,-.035,z);}
// Little banks, reeds, and lily pads give the course a pond-world horizon.
const rand=(a,b)=>a+Math.random()*(b-a);
for(let i=0;i<30;i++){
 const side=i%2?1:-1,z=rand(-88,7),x=side*rand(6.7,13),scale=rand(.55,1.6);
 const island=mesh(new THREE.SphereGeometry(1,12,8),i%3?mats.grass:mat('#86c99d'),scene,x,-.45,z); island.scale.set(scale*.95,.22,scale*1.3);
 if(i%2===0){const pad=mesh(new THREE.CircleGeometry(rand(.35,.8),16),mats.lilypad,scene,x,-.08,z);pad.rotation.x=-Math.PI/2;pad.rotation.z=rand(0,6);}
}
function makeCloud(x,y,z,s){const g=new THREE.Group();scene.add(g);for(let i=0;i<4;i++){const c=mesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshBasicMaterial({color:'#f4ffff',transparent:true,opacity:.72}),g,(i-1.5)*.8,Math.sin(i*2)*.14,0);c.scale.set(s*(.55+Math.sin(i+3)*.1),s*.32,s*.22);}g.position.set(x,y,z);}
makeCloud(-8,9,-28,2.1);makeCloud(8,7,-46,1.6);makeCloud(-4,8,-70,1.3);
// A big, striped loop-gate at the far end of each run.
const loop = new THREE.Group();loop.position.set(0,1.4,-45);scene.add(loop);
const gate=mesh(new THREE.TorusGeometry(3.2,.22,12,48),mat('#f4a36a'),loop,0,0,0);gate.rotation.x=.15;
const gateInner=mesh(new THREE.TorusGeometry(2.84,.12,10,48),mat('#fff0be'),loop,0,0,.03);gateInner.rotation.x=.15;

// The star of the show: a tiny, round, fully procedural duck.
const duck = new THREE.Group(); scene.add(duck); duck.position.set(0,.1,1.45);
const yellow = mat('#ffd54f'); const yellowLight=mat('#ffe37b'); const beakMat=mat('#f28b46'); const black=mat('#273a43',.25); const blush=mat('#f5a46f'); const footMat=mat('#ed8b48');
const body=mesh(new THREE.SphereGeometry(.68,24,20),yellow,duck,0,.84,0); body.scale.set(.82,.85,1.05);
const headGroup=new THREE.Group();duck.add(headGroup);headGroup.position.set(0,1.42,-.34);
mesh(new THREE.SphereGeometry(.48,24,20),yellowLight,headGroup,0,0,0);
const bill=mesh(new THREE.SphereGeometry(.25,16,12),beakMat,headGroup,0,-.12,-.49);bill.scale.set(.9,.38,.72);
for(const sign of [-1,1]){
 const eye=mesh(new THREE.SphereGeometry(.075,12,10),black,headGroup,sign*.205,.09,-.39);eye.scale.set(.85,1.1,.55);
 const shine=mesh(new THREE.SphereGeometry(.022,8,8),mats.white,headGroup,sign*.22,.12,-.424);
 const cheek=mesh(new THREE.SphereGeometry(.09,12,10),blush,headGroup,sign*.35,-.12,-.30);cheek.scale.set(1,.55,.3);
 const wing=mesh(new THREE.SphereGeometry(.3,16,12),yellowLight,duck,sign*.54,.83,-.02);wing.scale.set(.48,.28,.75);wing.rotation.z=sign*.13;
}
const feet=[];
for(const sign of [-1,1]){const foot=new THREE.Group();duck.add(foot);foot.position.set(sign*.26,.24,.35);const leg=mesh(new THREE.CylinderGeometry(.055,.07,.29,8),footMat,foot,0,-.12,0);const toe=mesh(new THREE.SphereGeometry(.16,12,8),footMat,foot,0,-.27,-.12);toe.scale.set(1,.28,1.5);feet.push(foot);}
const tail=mesh(new THREE.SphereGeometry(.2,12,10),yellow,duck,0,1.15,.62);tail.scale.set(.65,.55,.7);tail.rotation.x=-.5;
const lanes=[-2.45,0,2.45];let lane=1,targetX=0,jumpY=0,jumpV=0,gameState='ready',score=0,coins=0,speed=15,spawnTimer=.6,items=[],elapsed=0,skinIndex=0;
const skins=[{name:'Sunny',emoji:'🐤',body:'#ffd54f',head:'#ffe37b'},{name:'Berry',emoji:'🐥',body:'#f4a3c2',head:'#ffc1d5'},{name:'Minty',emoji:'🐣',body:'#83d5aa',head:'#a6e8be'},{name:'Dusk',emoji:'🦆',body:'#9ab9e8',head:'#b7d0f0'},{name:'Peaches',emoji:'🐤',body:'#ffad75',head:'#ffc394'},{name:'Royal',emoji:'👑',body:'#b798e8',head:'#cbb5f2'}];
function setSkin(index){skinIndex=(index+skins.length)%skins.length;const s=skins[skinIndex];document.querySelector('#skin-name').textContent=s.name;document.querySelector('#skin-emoji').textContent=s.emoji;yellow.color.set(s.body);yellowLight.color.set(s.head);}
function updateDuckColor(){const s=skins[skinIndex];yellow.color.set(s.body);yellowLight.color.set(s.head);}
function changeLane(dir){if(gameState!=='running')return;lane=THREE.MathUtils.clamp(lane+dir,0,2);targetX=lanes[lane];}
function makeCoin(laneIndex,z){const g=new THREE.Group();scene.add(g);const c=mesh(new THREE.TorusGeometry(.24,.09,10,18),mats.gold,g);c.rotation.y=Math.PI/2;const core=mesh(new THREE.CircleGeometry(.17,16),mat('#ffe38b'),g);core.position.z=.035;core.rotation.y=Math.PI/2;g.position.set(lanes[laneIndex],.95,z);g.userData={type:'coin',bob:Math.random()*6};items.push(g);}
function makeObstacle(laneIndex,z,type){const g=new THREE.Group();scene.add(g);g.position.set(lanes[laneIndex],0,z);g.userData={type,bob:Math.random()*5};
 if(type==='puddle'){
   const p=mesh(new THREE.CylinderGeometry(.72,.79,.07,24),mat('#56b8d2',.26),g,0,.04,0);p.scale.z=.75;
   const shine=mesh(new THREE.SphereGeometry(.19,12,8),mat('#bcf7f2',.25),g,-.3,.09,-.08);shine.scale.set(1,.1,.4);
 }else{
   const box=mesh(new THREE.BoxGeometry(1.05,.95,.9),mats.crate,g,0,.5,0);box.rotation.y=.08;
   mesh(new THREE.BoxGeometry(1.12,.13,.98),mats.crateLight,g,0,.52,0);
   mesh(new THREE.BoxGeometry(.13,.96,.96),mat('#e9a365'),g,0,.5,0);
   const ex=mesh(new THREE.BoxGeometry(.16,.18,.04),mat('#a85d43'),g,0,.53,-.47);
 }
 items.push(g);
}
function populateRow(){const z=-72;const r=Math.random();if(r<.54){const li=Math.floor(Math.random()*3);makeObstacle(li,z,r<.28?'puddle':'crate');for(let j=0;j<3;j++)if(j!==li&&Math.random()<.58)makeCoin(j,z-rand(3,8));}else if(r<.9){const li=Math.floor(Math.random()*3);for(let k=0;k<5;k++)makeCoin(li,z-k*2.15);}else{const safe=Math.floor(Math.random()*3);for(let j=0;j<3;j++)if(j!==safe)makeObstacle(j,z,'crate');for(let k=0;k<5;k++)makeCoin(safe,z-k*1.9);}}
function clearItems(){items.forEach(o=>{scene.remove(o);o.traverse(c=>{if(c.geometry)c.geometry.dispose();});});items=[];}
function startGame(){clearItems();gameState='running';score=0;coins=0;speed=15;spawnTimer=.5;lane=1;targetX=0;duck.position.set(0,.1,1.45);duck.rotation.set(0,0,0);document.body.classList.add('playing');document.querySelector('#welcome-panel').classList.add('hidden');document.querySelector('#result-panel').classList.remove('visible');document.querySelector('#toast').classList.add('hidden');document.querySelector('#score').textContent='00000';document.querySelector('#coins').textContent='0';}
function endGame(){if(gameState!=='running')return;gameState='over';document.body.classList.remove('playing');document.querySelector('#final-score').textContent=Math.floor(score).toLocaleString();document.querySelector('#final-coins').textContent=coins;document.querySelector('#result-panel').classList.add('visible');document.querySelector('#result-stamp').textContent=coins>=10?'POND LEGEND!':'SPLASH!';document.querySelector('#result-title').textContent=coins>=10?'Look at you, ducky!':'Nice try, ducky!';document.querySelector('#result-copy').textContent=coins>=10?'You scooped up a whole lot of shiny.':'Even the best ducks take a dip.';}
function pause(){if(gameState==='running'){gameState='paused';document.querySelector('#toast').classList.remove('hidden');}else if(gameState==='paused'){gameState='running';document.querySelector('#toast').classList.add('hidden');}}
document.querySelector('#play-button').addEventListener('click',startGame);document.querySelector('#again-button').addEventListener('click',startGame);document.querySelector('#skin-prev').addEventListener('click',()=>{setSkin(skinIndex-1);updateDuckColor();});document.querySelector('#skin-next').addEventListener('click',()=>{setSkin(skinIndex+1);updateDuckColor();});document.querySelector('#pause-button').addEventListener('click',pause);
document.querySelector('#sound-toggle').addEventListener('click',e=>{e.currentTarget.classList.toggle('muted');e.currentTarget.textContent=e.currentTarget.classList.contains('muted')?'♫̸':'♫';});
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight',' ','ArrowUp'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')changeLane(-1);if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')changeLane(1);if(e.key===' '||e.key==='ArrowUp'||e.key.toLowerCase()==='w'){if(gameState==='running'&&jumpY<=.02)jumpV=8;}if(e.key.toLowerCase()==='p'||e.key==='Escape')pause();if(e.key==='Enter'&&(gameState==='ready'||gameState==='over'))startGame();});
document.querySelectorAll('.mobile-controls button').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();if(b.dataset.move==='jump'){if(gameState==='running'&&jumpY<=.02)jumpV=8;}else changeLane(Number(b.dataset.move));});});

const clock=new THREE.Clock();
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;
 if(gameState==='running'){
   speed=Math.min(25,speed+dt*.11);score+=dt*speed*1.25;spawnTimer-=dt;
   if(spawnTimer<=0){populateRow();spawnTimer=Math.max(.68,1.08-(speed-15)*.025);}
   for(let i=items.length-1;i>=0;i--){const o=items[i];o.position.z+=speed*dt;if(o.userData.type==='coin'){o.rotation.y+=dt*2.5;o.position.y=.99+Math.sin(elapsed*5+o.userData.bob)*.11;if(Math.abs(o.position.z-duck.position.z)<.75&&Math.abs(o.position.x-duck.position.x)<.8){coins++;score+=50;scene.remove(o);items.splice(i,1);continue;}}else if(Math.abs(o.position.z-duck.position.z)<.72&&Math.abs(o.position.x-duck.position.x)<.78){if(o.userData.type==='crate'||jumpY<.48){endGame();break;}}
     if(o.position.z>8){scene.remove(o);items.splice(i,1);}
   }
   jumpV-=19*dt;jumpY=Math.max(0,jumpY+jumpV*dt);if(jumpY===0)jumpV=0;
   duck.position.x=THREE.MathUtils.damp(duck.position.x,targetX,11,dt);duck.position.y=.1+jumpY+Math.sin(elapsed*10)*.055;
   duck.rotation.z=THREE.MathUtils.damp(duck.rotation.z,(targetX-duck.position.x)*-.11,7,dt);headGroup.rotation.z=Math.sin(elapsed*7)*.035;
   feet.forEach((f,i)=>{f.rotation.x=Math.sin(elapsed*13+i*Math.PI)*.52;});
   document.querySelector('#score').textContent=String(Math.floor(score)).padStart(5,'0');document.querySelector('#coins').textContent=coins;
 }
 if(gameState==='paused'){} else {duck.rotation.y=Math.sin(elapsed*2)*.035;if(gameState!=='running'){duck.position.y=.1+Math.sin(elapsed*2)*.075;headGroup.rotation.z=Math.sin(elapsed*2.5)*.045;feet.forEach((f,i)=>f.rotation.x=Math.sin(elapsed*2+i)*.15);}}
 // Slow-moving pond highlights and a gently bobbing loop make the scene feel alive.
 loop.rotation.z=Math.sin(elapsed*.35)*.045;
 camera.position.x=THREE.MathUtils.damp(camera.position.x,duck.position.x*.17,2,dt);camera.lookAt(duck.position.x*.13,1.1,-8);
 renderer.render(scene,camera);
}
frame();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));});

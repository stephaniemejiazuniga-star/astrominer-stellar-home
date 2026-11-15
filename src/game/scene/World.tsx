import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Stars, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import astronaut from '@/assets/models/astronaut.glb.asset.json';
import rocket from '@/assets/models/rocket.glb.asset.json';
import rocketFuel from '@/assets/models/rocket-fuel.glb.asset.json';
import rocketTop from '@/assets/models/rocket-top.glb.asset.json';
import habitat from '@/assets/models/habitat.glb.asset.json';
import gantry from '@/assets/models/launch-tower.glb.asset.json';
import computer from '@/assets/models/computer.glb.asset.json';
import { palette as p } from './palette';
import { RULES, marsNodes, cloudNodes, sites, stepGame, moveVector, facingYaw, inputVector, deadzone, launchAltitude, cropGrowth, asteroidZ, type GameState } from '../sim/campaign';
import type { Settings } from '../data/settings';
export type Controls={keys:Set<string>;yaw:number;pitch:number;touchX:number;touchY:number; jump:boolean; paused:boolean};
export type Avatar='orange'|'cyan'|'green';
export type Remote={id:string;x:number;z:number;y:number;yaw:number;name:string;avatar?:Avatar};
export type Metrics={calls:number;triangles:number;frameMs:number;workMs:number;phase:string;heading:number;y:number};
export function Model({url,height=2,avatar,tint,opacity=1,...props}:{url:string;height?:number;position?:[number,number,number];rotation?:[number,number,number];avatar?:Avatar;tint?:string;opacity?:number}){
 const {scene}=useGLTF(url); const model=useMemo(()=>{const c=clone(scene);const box=new THREE.Box3().setFromObject(c);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());const scale=height/(size.y||1);c.scale.setScalar(scale);c.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);c.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=opacity===1;o.receiveShadow=true;if(o.name==='gate')o.visible=false;if(avatar||tint||opacity<1){const materials=Array.isArray(o.material)?o.material:[o.material];o.material=materials.map(m=>{const material=m.clone();material.transparent=opacity<1;material.opacity=opacity;material.depthWrite=opacity===1;if(material instanceof THREE.MeshStandardMaterial){if(tint)material.color.set(tint);else if(avatar&&['metalDark','metalRed'].includes(m.name))material.color.set(avatar==='cyan'?p.glass:avatar==='green'?p.plant:p.accent);material.metalness=.15;material.roughness=.75;}return material;});if(!Array.isArray(o.material)||o.material.length===1)o.material=o.material[0]??o.material;}}});return c;},[scene,height,avatar,tint,opacity]);
 return <group {...props}><primitive object={model}/></group>;
}
function RocketModel({height=7}:{height?:number}){return <group><Model url={rocket.url} height={height*.8}/><Model url={rocketFuel.url} height={height*.37} position={[0,height*.42,0]}/><Model url={rocketTop.url} height={height*.24} position={[0,height*.76,0]}/></group>;}
function groundTexture(){const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');if(ctx){ctx.fillStyle=p.ground;ctx.fillRect(0,0,512,512);for(let row=0;row<32;row++){ctx.beginPath();for(let x=0;x<=512;x+=8){const y=row*16+Math.sin(x*.025+row*.6)*5;ctx.lineTo(x,y);}ctx.strokeStyle=row%2?p.dust:p.stone;ctx.globalAlpha=.24;ctx.lineWidth=2;ctx.stroke();}let seed=14;for(let i=0;i<24000;i++){seed=(seed*16807)%2147483647;const x=seed%512;seed=(seed*16807)%2147483647;const y=seed%512;ctx.fillStyle=i%3?p.dust:p.stone;ctx.globalAlpha=.15+.12*(i%4);ctx.fillRect(x,y,1+(i%3),1);}}const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(18,18);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
function RockField(){
 const ref=useRef<THREE.InstancedMesh>(null);
 useEffect(()=>{const mesh=ref.current;if(!mesh)return;const o=new THREE.Object3D();for(let i=0;i<45;i++){const scale=1+i%5;o.position.set(Math.cos(i*2.4)*(45+i*.6),scale*.35,Math.sin(i*2.4)*(45+i*.6));o.scale.set(scale*2,scale,scale*1.5);o.rotation.set(i*.4,i,0);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);mesh.setColorAt(i,new THREE.Color(i%2?p.ground:p.stone));}mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();},[]);
 return <instancedMesh ref={ref} args={[undefined,undefined,45]} castShadow receiveShadow><icosahedronGeometry args={[1,0]}/><meshStandardMaterial flatShading roughness={1}/></instancedMesh>;
}
function Minerals({state,kind}:{state:MutableRefObject<GameState>;kind:typeof marsNodes[number]['kind']}){
 const ref=useRef<THREE.InstancedMesh>(null);const nodes=marsNodes.filter(n=>n.kind===kind&&!state.current.collected.includes(n.id));
 useEffect(()=>{const mesh=ref.current;if(!mesh)return;const o=new THREE.Object3D();nodes.forEach((n,i)=>{o.position.set(n.x,.45,n.z);o.rotation.set(.2,n.x,.5);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});mesh.count=nodes.length;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();},[nodes.map(n=>n.id).join(',')]);
 return <instancedMesh ref={ref} args={[undefined,undefined,14]} castShadow receiveShadow><dodecahedronGeometry args={[kind==='stone'?.75:.6,0]}/><meshStandardMaterial color={p[kind]} roughness={kind==='water'?.2:.8} metalness={kind==='iron'?.3:0} emissive={p[kind]} emissiveIntensity={.12}/></instancedMesh>;
}
function Crops({state}:{state:MutableRefObject<GameState>}){
 const stems=useRef<THREE.InstancedMesh>(null),leaves=useRef<THREE.InstancedMesh>(null),produce=useRef<THREE.InstancedMesh>(null);const dummy=useMemo(()=>new THREE.Object3D(),[]);
 useFrame(()=>{const growth=cropGrowth(state.current.crop,state.current.cropTime);for(let i=0;i<6;i++){const x=-2+(i%3)*1.1,z=2+Math.floor(i/3)*1.1;dummy.position.set(x,.32+growth*.6,z);dummy.scale.set(.045,Math.max(.001,growth*1.2),.045);dummy.rotation.set(0,0,0);dummy.updateMatrix();stems.current?.setMatrixAt(i,dummy.matrix);for(let j=0;j<4;j++){dummy.position.set(x+Math.cos(j*Math.PI/2)*growth*.18,.4+growth*(.35+j*.15),z+Math.sin(j*Math.PI/2)*growth*.18);dummy.scale.set(growth*.36,growth*.08,growth*.15);dummy.rotation.set(0,j*Math.PI/2,.4*(j%2?1:-1));dummy.updateMatrix();leaves.current?.setMatrixAt(i*4+j,dummy.matrix);}dummy.position.set(x,.38+growth*1.2,z);dummy.scale.setScalar(state.current.crop==='ready'?.16:0);dummy.updateMatrix();produce.current?.setMatrixAt(i,dummy.matrix);}for(const mesh of [stems.current,leaves.current,produce.current])if(mesh){mesh.visible=growth>0;mesh.instanceMatrix.needsUpdate=true;}});
 return <group><mesh position={[-.9,.12,2.55]} receiveShadow><boxGeometry args={[3.8,.25,2.3]}/><meshStandardMaterial color={p.metal}/></mesh><mesh position={[-.9,.26,2.55]}><boxGeometry args={[3.6,.05,2.1]}/><meshStandardMaterial color={p.soil} roughness={1}/></mesh><instancedMesh ref={stems} args={[undefined,undefined,6]} frustumCulled={false}><cylinderGeometry args={[1,1,1,5]}/><meshStandardMaterial color={p.stem}/></instancedMesh><instancedMesh ref={leaves} args={[undefined,undefined,24]} frustumCulled={false} castShadow><sphereGeometry args={[1,5,3]}/><meshStandardMaterial color={p.plant} flatShading roughness={.85}/></instancedMesh><instancedMesh ref={produce} args={[undefined,undefined,6]} frustumCulled={false}><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={p.harvest}/></instancedMesh></group>;
}
function FrameMetrics({metrics}:{metrics:MutableRefObject<Metrics>}){useFrame(({gl})=>{metrics.current.calls=gl.info.render.calls;metrics.current.triangles=gl.info.render.triangles;gl.info.reset();},-100);return null;}
function Earth({state,ship}:{state:MutableRefObject<GameState>;ship:MutableRefObject<THREE.Group|null>}){
 const texture=useMemo(()=>{const t=groundTexture();return t;},[]);useEffect(()=>()=>texture.dispose(),[texture]);
 return <><mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[300,300]}/><meshStandardMaterial map={texture} color={p.earthGround}/></mesh><mesh position={[-12,.1,0]} receiveShadow><boxGeometry args={[18,.3,18]}/><meshStandardMaterial color={p.concrete} roughness={.9}/></mesh><mesh position={[-12,.28,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[4,4.3,32]}/><meshBasicMaterial color={p.suit}/></mesh><Suspense fallback={null}><Model url={gantry.url} height={14} tint={p.gantry} position={[-18,.25,-3]}/><Model url={habitat.url} height={4} position={[-28,0,-18]}/></Suspense><group ref={ship} position={[-12,.3,0]}><Suspense fallback={null}><RocketModel height={10}/></Suspense>{state.current.phase==='launch'&&state.current.launchTime>RULES.countdownSeconds&&<mesh position={[0,-2,0]} rotation={[0,0,Math.PI]}><coneGeometry args={[1.1,4,8]}/><meshBasicMaterial color={p.flame}/></mesh>}</group></>;
}
function Surface({state}:{state:MutableRefObject<GameState>}){
 const s=state.current;const texture=useMemo(groundTexture,[]);useEffect(()=>()=>texture.dispose(),[texture]);
 return <><mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[190,190,1,1]}/><meshStandardMaterial map={texture} roughness={.98}/></mesh>
 <RockField/>{(['stone','iron','silicon','magnesium','water']as const).map(kind=><Minerals key={kind} state={state} kind={kind}/>)}
 {Object.entries(sites).filter(([k])=>k!=='rocket').map(([key,v])=><group key={key} position={[v.x,0,v.z]}>{s.built[key as keyof typeof s.built]?<><Suspense fallback={null}><Model url={habitat.url} height={key==='base'?5:3.8} opacity={key==='base'?.3:1}/>{key!=='base'&&<Model url={computer.url} height={1.7} position={[0,.1,3.4]}/>}</Suspense><mesh position={[0,.02,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[9,9]}/><meshStandardMaterial color={p.metal}/></mesh></>:<mesh rotation={[-Math.PI/2,0,0]} position={[0,.05,0]}><ringGeometry args={[3.8,4,40]}/><meshBasicMaterial color={p.glass} transparent opacity={.55}/></mesh>}</group>)}
 <Suspense fallback={null}>{s.phase!=='packing'&&<group position={[sites.rocket.x,0,sites.rocket.z]}><RocketModel/></group>}</Suspense>
 {s.built.base&&<Crops state={state}/>}
 </>;
}
export const flightObstacles=Array.from({length:18},(_,i)=>({x:Math.sin(i*2.3)*6,y:1+Math.cos(i*1.7)*3,z:-30-i*18}));
function Simulation({state,controls,settings,onTick,remote,avatar,metrics,onImpact}:{state:MutableRefObject<GameState>;controls:MutableRefObject<Controls>;settings:Settings;onTick:()=>void;remote:MutableRefObject<Map<string,Remote>>;avatar:Avatar;metrics:MutableRefObject<Metrics>;onImpact:()=>void}){
 const player=useRef<THREE.Group>(null);const ship=useRef<THREE.Group>(null);const renderCount=useRef(0);const y=useRef(0);const vy=useRef(0);const yaw=useRef(0);const lastPhase=useRef(state.current.phase);const lastPlanet=useRef(state.current.planet);const obstacleRefs=useRef<(THREE.Mesh|null)[]>([]);const cooldown=useRef(0);const report=useRef(0);
 const remotes=useRef(new Map<string,THREE.Group>());
 useFrame(({camera,scene,gl},raw)=>{
  const s=state.current,c=controls.current;const started=performance.now();const dt=Math.min(raw,.05);const group=player.current;if(!group)return;
  if(c.paused)return;
  if(lastPhase.current!==s.phase||lastPlanet.current!==s.planet||Math.hypot(group.position.x-s.x,group.position.z-s.z)>3){group.position.set(s.x,0,s.z);y.current=0;vy.current=0;lastPhase.current=s.phase;lastPlanet.current=s.planet;}
  if(renderCount.current++===2)gl.domElement.parentElement?.setAttribute('data-scene-ready','1');
  const pad=Array.from(navigator.getGamepads?.()??[]).find(v=>v?.mapping==='standard');const stick=deadzone(pad?.axes[0]??0,pad?.axes[1]??0);const {forward:f,strafe}=inputVector(c.keys,c.touchX,c.touchY,stick.x,stick.y);if(pad?.buttons[0]?.pressed)c.jump=true;
  c.yaw-=(Math.abs(pad?.axes[2]??0)>.15?(pad?.axes[2]??0):0)*dt*2;
  const move=moveVector(f,strafe,c.yaw);
  if(s.health>0&&s.hull>0){
   if(s.phase==='launch'){if(ship.current)ship.current.position.set(-12,.3+launchAltitude(s.launchTime),0);
   }else if(s.phase==='flight'){
    s.x=THREE.MathUtils.clamp(s.x+strafe*dt*7,-8,8);y.current=THREE.MathUtils.clamp(y.current+f*dt*5,-2.5,5);
    if(ship.current)ship.current.position.set(s.x,y.current,0);
   }else if(s.phase==='surface'||s.phase==='vortex'){
    group.position.x=THREE.MathUtils.clamp(group.position.x+move.x*RULES.speed*(c.keys.has('ShiftLeft')?1.5:1)*dt,-65,65);group.position.z=THREE.MathUtils.clamp(group.position.z+move.z*RULES.speed*(c.keys.has('ShiftLeft')?1.5:1)*dt,-65,65);
    if(Math.hypot(move.x,move.z)>.01)yaw.current=facingYaw(move.x,move.z);group.traverse(o=>{if(['armLeft','legRight'].includes(o.name))o.rotation.x=Math.hypot(move.x,move.z)>.01?Math.sin(s.time*8)*.45:0;if(['armRight','legLeft'].includes(o.name))o.rotation.x=Math.hypot(move.x,move.z)>.01?-Math.sin(s.time*8)*.45:0;});
    if((c.jump||c.keys.has('Space'))&&y.current===0){vy.current=RULES.jumpSpeed;c.jump=false;}
    vy.current-=RULES.gravity*dt;y.current=Math.max(0,y.current+vy.current*dt);if(y.current===0)vy.current=0;
    group.position.y=y.current;group.rotation.y=yaw.current;
   }
  }
  stepGame(s,dt,s.phase==='flight'?s.x:group.position.x,s.phase==='flight'?s.z:group.position.z,settings.difficulty);
  cooldown.current=Math.max(0,cooldown.current-dt);
  if(s.phase==='flight'||s.phase==='vortex'){
   flightObstacles.forEach((o,i)=>{const mesh=obstacleRefs.current[i];if(!mesh)return;const zz=asteroidZ(o.z,s.time,s.phase==='vortex');mesh.position.set(o.x,s.phase==='flight'?o.y:1.2+Math.sin(s.time+i)*2,zz);mesh.rotation.x+=dt*(.25+i*.04);mesh.rotation.y+=dt*.35;const dx=mesh.position.x-(s.phase==='flight'?s.x:group.position.x);const dz=mesh.position.z-(s.phase==='flight'?0:group.position.z);const dy=mesh.position.y-(s.phase==='flight'?y.current:1);if(Math.hypot(dx,dy,dz)<1.8&&cooldown.current===0){if(s.phase==='flight')s.hull=Math.max(0,s.hull-20);else s.health=Math.max(0,s.health-12);cooldown.current=1;onImpact();}});
  }
  const earth=s.phase==='packing'||s.phase==='launch';const altitude=s.phase==='launch'?launchAltitude(s.launchTime):0;const target=earth?new THREE.Vector3(10,9+altitude,24):s.phase==='flight'?new THREE.Vector3(s.x,y.current+2.5,12):new THREE.Vector3(group.position.x-Math.sin(c.yaw)*13,8+group.position.y+c.pitch*3,group.position.z+Math.cos(c.yaw)*13);
  camera.position.lerp(target,1-Math.exp(-5*dt));camera.lookAt(earth?new THREE.Vector3(-12,5+altitude,0):s.phase==='flight'?new THREE.Vector3(s.x,y.current,-4):new THREE.Vector3(group.position.x,group.position.y+1.2,group.position.z));
  const fog=scene.fog;if(fog instanceof THREE.Fog){fog.near=s.storm>0?3:35;fog.far=s.storm>0?15:130;fog.color.set(earth?p.earthSky:s.planet==='jupiter'?p.jupiterSky:p.sky);}
  for(const [id,data]of remote.current){const g=remotes.current.get(id);if(g){g.position.lerp(new THREE.Vector3(data.x,data.y,data.z),1-Math.exp(-12*dt));g.rotation.y=data.yaw;}}
  metrics.current={calls:metrics.current.calls,triangles:metrics.current.triangles,frameMs:raw*1000,workMs:performance.now()-started,phase:s.phase,heading:yaw.current,y:y.current};
  report.current+=raw;if(report.current>.2){report.current=0;onTick();}
 });
 const s=state.current;const space=s.phase==='flight';const earth=s.phase==='packing'||s.phase==='launch';const jupiter=s.planet==='jupiter';
 return <><color attach="background" args={[space?p.space:earth?p.earthSky:jupiter?p.jupiterSky:p.sky]}/><fog attach="fog" args={[jupiter?p.jupiterSky:p.sky,35,130]}/><ambientLight intensity={.7}/><hemisphereLight args={[p.sun,p.fill,1.2]}/><directionalLight position={[25,30,10]} intensity={2.3} color={p.sun} castShadow shadow-mapSize={[1024,1024]}/><Environment resolution={64} frames={1}><Lightformer position={[0,10,0]} intensity={1.5} scale={[20,20,1]}/><Lightformer position={[-10,5,0]} color={p.fill} intensity={1} scale={[20,10,1]}/></Environment>
 {earth?<Earth state={state} ship={ship}/>:space?<><mesh position={[0,1,-95]}><sphereGeometry args={[10,16,12]}/><meshStandardMaterial color={p.ground} flatShading/></mesh><Stars radius={120} depth={80} count={1200} factor={3}/><group ref={ship}><Suspense fallback={null}><group rotation={[-Math.PI/2,0,0]}><RocketModel height={4}/></group></Suspense></group></>:jupiter?<><mesh position={[0,-.2,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[72,48]}/><meshStandardMaterial color={p.platform} metalness={.5} roughness={.7}/></mesh>{Array.from({length:20},(_,i)=><mesh key={i} position={[Math.cos(i*2.4)*95,-10+(i%5)*5,Math.sin(i*2.4)*95]} scale={[20,4,15]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color={i%2?p.cloud:p.dust}/></mesh>)}{cloudNodes.filter(n=>!s.collected.includes(n.id)).map((n,i)=><mesh key={n.id} position={[n.x,1.5,n.z]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color={[p.glass,p.suit,p.dark,p.fill,p.water,p.accent,p.metal,p.suit,p.plant,p.metal,p.stone][i]??p.glass} transparent opacity={.7} emissive={p.glass} emissiveIntensity={.2}/></mesh>)}{s.phase==='vortex'&&<mesh position={[0,7,-38]} rotation={[0,0,.5]}><torusGeometry args={[12,3,8,32]}/><meshStandardMaterial color={p.dust}/></mesh>}</>:<Surface state={state}/>}
 <group ref={player} position={[s.x,0,s.z]} rotation={[0,0,0]} visible={!space&&!earth}><Suspense fallback={null}><Model url={astronaut.url} height={1.8} avatar={avatar}/></Suspense></group>
 {(space||s.phase==='vortex')&&flightObstacles.map((o,i)=><mesh key={i} ref={g=>{obstacleRefs.current[i]=g;}} position={[o.x,o.y,o.z]}><icosahedronGeometry args={[.7+(i%3)*.25,0]}/><meshStandardMaterial color={p.stone} roughness={1}/></mesh>)}
 {[...remote.current.keys()].map(id=><group key={id} ref={g=>{if(g)remotes.current.set(id,g);else remotes.current.delete(id);}}><Suspense fallback={null}><Model url={astronaut.url} height={1.8} avatar={remote.current.get(id)?.avatar??'orange'}/></Suspense></group>)}
 </>;
}
export function World(props:Parameters<typeof Simulation>[0]){return <Canvas shadows={props.settings.graphics==='high'} dpr={props.settings.graphics==='high'?[1,1.5]:1} camera={{position:[0,5,18],fov:55}} gl={{antialias:props.settings.graphics==='high'}} onCreated={({gl})=>{gl.info.autoReset=false;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.1;}}><FrameMetrics metrics={props.metrics}/><Simulation {...props}/></Canvas>;}

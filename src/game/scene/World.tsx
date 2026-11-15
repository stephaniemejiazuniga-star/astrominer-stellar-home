import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Stars, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import astronaut from '@/assets/models/astronaut.glb.asset.json';
import rocket from '@/assets/models/rocket.glb.asset.json';
import rocketTop from '@/assets/models/rocket-top.glb.asset.json';
import habitat from '@/assets/models/habitat.glb.asset.json';
import computer from '@/assets/models/computer.glb.asset.json';
import { palette as p } from './palette';
import { RULES, marsNodes, cloudNodes, sites, stepGame, moveVector, type GameState } from '../sim/campaign';
import type { Settings } from '../data/settings';
export type Controls={keys:Set<string>;yaw:number;pitch:number;touchX:number;touchY:number; jump:boolean; paused:boolean};
export type Remote={id:string;x:number;z:number;y:number;yaw:number;name:string};
export function Model({url,height=2,...props}:{url:string;height?:number;position?:[number,number,number];rotation?:[number,number,number]}){
 const {scene}=useGLTF(url); const model=useMemo(()=>{const c=clone(scene);const box=new THREE.Box3().setFromObject(c);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());const scale=height/(size.y||1);c.scale.setScalar(scale);c.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);c.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;}});return c;},[scene,height]);
 return <group {...props}><primitive object={model}/></group>;
}
function RocketModel({height=7}:{height?:number}){return <group><Model url={rocket.url} height={height*.8}/><Model url={rocketTop.url} height={height*.24} position={[0,height*.76,0]}/></group>;}
function groundTexture(){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');if(ctx){ctx.fillStyle=p.ground;ctx.fillRect(0,0,256,256);let seed=14;for(let i=0;i<18000;i++){seed=(seed*16807)%2147483647;const x=seed%256;seed=(seed*16807)%2147483647;const y=seed%256;ctx.fillStyle=i%3?p.dust:p.stone;ctx.globalAlpha=.1+.15*(i%4);ctx.fillRect(x,y,1+(i%3),1);}}const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(24,24);t.colorSpace=THREE.SRGBColorSpace;return t;}
function Surface({state}:{state:MutableRefObject<GameState>}){
 const s=state.current;const texture=useMemo(groundTexture,[]);useEffect(()=>()=>texture.dispose(),[texture]);
 const rocks=useMemo(()=>Array.from({length:45},(_,i)=>({x:Math.cos(i*2.4)*(45+i*.6),z:Math.sin(i*2.4)*(45+i*.6),scale:1+(i%5)})),[]);
 return <><mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[190,190,1,1]}/><meshStandardMaterial map={texture} roughness={.98}/></mesh>
 {rocks.map((r,i)=><mesh key={i} position={[r.x,r.scale*.35,r.z]} scale={[r.scale*2,r.scale,r.scale*1.5]} rotation={[i*.4,i,0]}><icosahedronGeometry args={[1,0]}/><meshStandardMaterial color={i%2?p.ground:p.stone} flatShading roughness={1}/></mesh>)}
 {marsNodes.filter(n=>!s.collected.includes(n.id)).map(n=><group key={n.id} position={[n.x,.45,n.z]}><mesh rotation={[.2,n.x,.5]}><dodecahedronGeometry args={[n.kind==='stone'?.75:.6,0]}/><meshStandardMaterial color={p[n.kind]} roughness={n.kind==='water'?.2:.8} metalness={n.kind==='iron'?.3:0} emissive={p[n.kind]} emissiveIntensity={.12}/></mesh>{n.kind!=='stone'&&<mesh position={[0,-.3,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.8,.88,16]}/><meshBasicMaterial color={p[n.kind]} transparent opacity={.5}/></mesh>}</group>)}
 {Object.entries(sites).filter(([k])=>k!=='rocket').map(([key,v])=><group key={key} position={[v.x,0,v.z]}>{s.built[key as keyof typeof s.built]?<><Suspense fallback={null}><Model url={habitat.url} height={key==='base'?5:3.8}/>{key!=='base'&&<Model url={computer.url} height={1.7} position={[0,.1,3.4]}/>}</Suspense><mesh position={[0,.02,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[9,9]}/><meshStandardMaterial color={p.metal}/></mesh></>:<mesh rotation={[-Math.PI/2,0,0]} position={[0,.05,0]}><ringGeometry args={[3.8,4,40]}/><meshBasicMaterial color={p.glass} transparent opacity={.55}/></mesh>}</group>)}
 <Suspense fallback={null}>{s.phase!=='packing'&&<group position={[0,0,15]}><RocketModel/></group>}</Suspense>
 {s.crop!=='empty'&&s.crop!=='harvested'&&Array.from({length:6},(_,i)=><mesh key={i} position={[-2+(i%3),s.crop==='ready'?1.3:.5,-1+Math.floor(i/3)]}><coneGeometry args={[.35,s.crop==='ready'?1.6:.5,5]}/><meshStandardMaterial color={p.plant}/></mesh>)}
 </>;
}
export const flightObstacles=Array.from({length:18},(_,i)=>({x:Math.sin(i*2.3)*6,y:1+Math.cos(i*1.7)*3,z:-30-i*18}));
function Simulation({state,controls,settings,onTick,remote}:{state:MutableRefObject<GameState>;controls:MutableRefObject<Controls>;settings:Settings;onTick:()=>void;remote:MutableRefObject<Map<string,Remote>>}){
 const player=useRef<THREE.Group>(null);const ship=useRef<THREE.Group>(null);const renderCount=useRef(0);const y=useRef(0);const vy=useRef(0);const yaw=useRef(0);const lastPhase=useRef(state.current.phase);const lastPlanet=useRef(state.current.planet);const obstacleRefs=useRef<(THREE.Mesh|null)[]>([]);const cooldown=useRef(0);const report=useRef(0);
 const remotes=useRef(new Map<string,THREE.Group>());
 useFrame(({camera,scene,gl},raw)=>{
  const s=state.current,c=controls.current;const dt=Math.min(raw,.05);const group=player.current;if(!group)return;
  if(c.paused)return;
  if(lastPhase.current!==s.phase||lastPlanet.current!==s.planet||Math.hypot(group.position.x-s.x,group.position.z-s.z)>3){group.position.set(s.x,0,s.z);y.current=0;vy.current=0;lastPhase.current=s.phase;lastPlanet.current=s.planet;}
  if(renderCount.current++===2)gl.domElement.parentElement?.setAttribute('data-scene-ready','1');
  let f=(c.keys.has('KeyW')||c.keys.has('ArrowUp')?1:0)-(c.keys.has('KeyS')||c.keys.has('ArrowDown')?1:0)-c.touchY;
  let strafe=(c.keys.has('KeyD')||c.keys.has('ArrowRight')?1:0)-(c.keys.has('KeyA')||c.keys.has('ArrowLeft')?1:0)+c.touchX;
  const move=moveVector(f,strafe,c.yaw);
  if(s.health>0&&s.hull>0){
   if(s.phase==='flight'){
    s.x=THREE.MathUtils.clamp(s.x+strafe*dt*7,-8,8);y.current=THREE.MathUtils.clamp(y.current+f*dt*5,-2.5,5);
    if(ship.current)ship.current.position.set(s.x,y.current,0);
   }else if(s.phase!=='packing'){
    group.position.x=THREE.MathUtils.clamp(group.position.x+move.x*RULES.speed*(c.keys.has('ShiftLeft')?1.5:1)*dt,-65,65);group.position.z=THREE.MathUtils.clamp(group.position.z+move.z*RULES.speed*(c.keys.has('ShiftLeft')?1.5:1)*dt,-65,65);
    if(Math.hypot(move.x,move.z)>.01)yaw.current=Math.atan2(move.x,move.z);group.traverse(o=>{if(['armLeft','legRight'].includes(o.name))o.rotation.x=Math.hypot(move.x,move.z)>.01?Math.sin(s.time*8)*.45:0;if(['armRight','legLeft'].includes(o.name))o.rotation.x=Math.hypot(move.x,move.z)>.01?-Math.sin(s.time*8)*.45:0;});
    if((c.jump||c.keys.has('Space'))&&y.current===0){vy.current=RULES.jumpSpeed;c.jump=false;}
    vy.current-=RULES.gravity*dt;y.current=Math.max(0,y.current+vy.current*dt);if(y.current===0)vy.current=0;
    group.position.y=y.current;group.rotation.y=yaw.current;
   }
  }
  stepGame(s,dt,s.phase==='flight'?s.x:group.position.x,s.phase==='flight'?s.z:group.position.z,settings.difficulty);
  cooldown.current=Math.max(0,cooldown.current-dt);
  if(s.phase==='flight'||s.phase==='vortex'){
   flightObstacles.forEach((o,i)=>{const mesh=obstacleRefs.current[i];if(!mesh)return;const speed=s.phase==='flight'?12:8;const zz=((o.z+s.time*speed+360)%360)-180;mesh.position.set(o.x,s.phase==='flight'?o.y:1.2+Math.sin(s.time+i)*2,zz);const dx=mesh.position.x-(s.phase==='flight'?s.x:group.position.x);const dz=mesh.position.z-(s.phase==='flight'?0:group.position.z);const dy=mesh.position.y-(s.phase==='flight'?y.current:1);if(Math.hypot(dx,dy,dz)<1.8&&cooldown.current===0){if(s.phase==='flight')s.hull=Math.max(0,s.hull-20);else s.health=Math.max(0,s.health-12);cooldown.current=1;}});
  }
  const target=s.phase==='flight'?new THREE.Vector3(s.x,y.current+2.5,12):new THREE.Vector3(group.position.x-Math.sin(c.yaw)*9,6+group.position.y+c.pitch*3,group.position.z+Math.cos(c.yaw)*9);
  camera.position.lerp(target,1-Math.exp(-5*dt));camera.lookAt(s.phase==='flight'?new THREE.Vector3(s.x,y.current,-4):new THREE.Vector3(group.position.x,group.position.y+1.2,group.position.z));
  const fog=scene.fog;if(fog instanceof THREE.Fog){fog.near=s.storm>0?3:35;fog.far=s.storm>0?15:130;fog.color.set(s.planet==='jupiter'?p.jupiterSky:p.sky);}
  for(const [id,data]of remote.current){const g=remotes.current.get(id);if(g){g.position.lerp(new THREE.Vector3(data.x,data.y,data.z),1-Math.exp(-12*dt));g.rotation.y=data.yaw;}}
  report.current+=dt;if(report.current>.2){report.current=0;onTick();}
 });
 const s=state.current;const space=s.phase==='flight';const jupiter=s.planet==='jupiter';
 return <><color attach="background" args={[space?p.space:jupiter?p.jupiterSky:p.sky]}/><fog attach="fog" args={[jupiter?p.jupiterSky:p.sky,35,130]}/><ambientLight intensity={.7}/><hemisphereLight args={[p.sun,p.fill,1.2]}/><directionalLight position={[25,30,10]} intensity={2.3} color={p.sun} castShadow shadow-mapSize={[1024,1024]}/><Environment resolution={64}><Lightformer position={[0,10,0]} intensity={1.5} scale={[20,20,1]}/><Lightformer position={[-10,5,0]} color={p.fill} intensity={1} scale={[20,10,1]}/></Environment>
 {space?<><mesh position={[0,1,-95]}><sphereGeometry args={[10,16,12]}/><meshStandardMaterial color={p.ground} flatShading/></mesh><Stars radius={120} depth={80} count={1200} factor={3}/><group ref={ship}><Suspense fallback={null}><group rotation={[-Math.PI/2,0,0]}><RocketModel height={4}/></group></Suspense></group></>:jupiter?<><mesh position={[0,-.2,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[72,48]}/><meshStandardMaterial color={p.platform} metalness={.5} roughness={.7}/></mesh>{Array.from({length:20},(_,i)=><mesh key={i} position={[Math.cos(i*2.4)*95,-10+(i%5)*5,Math.sin(i*2.4)*95]} scale={[20,4,15]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color={i%2?p.cloud:p.dust}/></mesh>)}{cloudNodes.filter(n=>!s.collected.includes(n.id)).map((n,i)=><mesh key={n.id} position={[n.x,1.5,n.z]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color={[p.glass,p.suit,p.dark,p.fill,p.water,p.accent,p.metal,p.suit,p.plant,p.metal,p.stone][i]??p.glass} transparent opacity={.7} emissive={p.glass} emissiveIntensity={.2}/></mesh>)}{s.phase==='vortex'&&<mesh position={[0,7,-38]} rotation={[0,0,.5]}><torusGeometry args={[12,3,8,32]}/><meshStandardMaterial color={p.dust}/></mesh>}</>:<Surface state={state}/>}
 <group ref={player} position={[s.x,0,s.z]} visible={!space}><Suspense fallback={null}><Model url={astronaut.url} height={1.8}/></Suspense></group>
 {(space||s.phase==='vortex')&&flightObstacles.map((o,i)=><mesh key={i} ref={g=>{obstacleRefs.current[i]=g;}} position={[o.x,o.y,o.z]}><icosahedronGeometry args={[.7+(i%3)*.25,0]}/><meshStandardMaterial color={p.stone} roughness={1}/></mesh>)}
 {[...remote.current.keys()].map(id=><group key={id} ref={g=>{if(g)remotes.current.set(id,g);else remotes.current.delete(id);}}><Suspense fallback={null}><Model url={astronaut.url} height={1.8}/></Suspense></group>)}
 </>;
}
export function World(props:Parameters<typeof Simulation>[0]){return <Canvas shadows={props.settings.graphics==='high'} dpr={props.settings.graphics==='high'?[1,1.5]:1} camera={{position:[0,5,18],fov:55}} gl={{antialias:props.settings.graphics==='high'}}><Simulation {...props}/></Canvas>;}

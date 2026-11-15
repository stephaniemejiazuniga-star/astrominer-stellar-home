import {describe,it,expect} from 'vitest';
import {newGame,applyAction,stepGame,question,marsNodes,cloudNodes,moveVector,launchAltitude,facingYaw,inputVector,deadzone,cropGrowth,asteroidZ,RULES,type GameState} from './campaign';
function sim(s:GameState,seconds:number,x=s.x,z=s.z){for(let i=0;i<Math.round(seconds*20);i++)stepGame(s,.05,x,z);}
function prepared(){let s=newGame();for(const item of ['pickaxe','seeds','bag'])s=applyAction(s,{type:'pack',item});return s;}
function surface(){const s=applyAction(prepared(),{type:'launch'});sim(s,RULES.launchSeconds+35.1);return s;}
function collect(s:GameState,kind:string,count:number){for(const node of marsNodes.filter(n=>n.kind===kind&&!s.collected.includes(n.id)).slice(0,count))s=applyAction(s,{type:'collect',id:node.id},node.x,node.z);return s;}
describe('Campaign rules',()=>{
 it('starts with at least four oxygen tanks',()=>{expect(newGame().inventory['tank']).toBe(4);});
 it('awards two tanks for a rewarded mission only once',()=>{const a=applyAction(prepared(),{type:'launch'});expect(a.inventory['tank']).toBe(6);expect(applyAction(a,{type:'launch'}).inventory['tank']).toBe(6);});
 it('requires equipment before launch',()=>{expect(applyAction(newGame(),{type:'launch'}).phase).toBe('packing');});
 it('does not collect distant or duplicate samples',()=>{const node=marsNodes[0];if(!node)throw Error('missing node');let s=surface();expect(applyAction(s,{type:'collect',id:node.id},100,100).collected).toHaveLength(0);s=applyAction(s,{type:'collect',id:node.id},node.x,node.z);expect(applyAction(s,{type:'collect',id:node.id},node.x,node.z).inventory).toEqual(s.inventory);});
 it('protects players inside the base during exactly 30 seconds of storm',()=>{const s=surface();s.built.base=true;s.storm=30;const health=s.health;sim(s,29.9,0,0);expect(s.stormDone).toBe(false);sim(s,.15,0,0);expect(s.stormDone).toBe(true);expect(s.health).toBe(health);expect(RULES.stormSeconds).toBe(30);});
 it('penalizes players outside their shelter',()=>{const s=surface();s.storm=30;sim(s,1,15,15);expect(s.health).toBeCloseTo(99);});
 it('locks questions until four elements have been analyzed',()=>{const s=surface();s.built.lab=true;s.analyzed=['Fe','Si','Mg'];expect(applyAction(s,{type:'answer',answer:'Fe'},12,0).quiz).toBe(0);});
 it('correct answers award two additional oxygen tanks',()=>{const s=surface();s.built.lab=true;s.analyzed=['Fe','Si','Mg','O'];const tanks=s.inventory['tank']??0;expect(applyAction(s,{type:'answer',answer:question(s).answer},12,0).inventory['tank']).toBe(tanks+2);});
 it('runs the Jupiter vortex for 50 seconds',()=>{const s=surface();s.unlockedJupiter=true;const j=applyAction(s,{type:'travel',planet:'jupiter'},-20,15);sim(j,49.9);expect(j.phase).toBe('vortex');sim(j,.2);expect(j.phase).toBe('surface');expect(RULES.vortexSeconds).toBe(50);});
 it('shows a new fact every minute for ten seconds',()=>{const s=surface();s.factTime=0;s.factIndex=-1;sim(s,59.9);expect(s.factIndex).toBe(-1);sim(s,.2);expect(s.factIndex).toBe(0);expect(s.factTime).toBeLessThan(10);sim(s,10);expect(s.factTime).toBeGreaterThan(10);sim(s,50);expect(s.factIndex).toBe(1);expect(RULES.factVisible).toBe(10);});
 it('caps cooperative sessions at five players',()=>{expect(RULES.maxPlayers).toBe(5);});
 it('moves in camera-relative forward, backward and strafe directions',()=>{expect(moveVector(1,0,0)).toEqual({x:0,z:-1});expect(moveVector(-1,0,0)).toEqual({x:0,z:1});expect(moveVector(0,-1,0).x).toBe(-1);expect(moveVector(0,-1,0).z).toBeCloseTo(0);expect(moveVector(0,1,0)).toEqual({x:1,z:0});expect(moveVector(1,0,Math.PI/2).x).toBeCloseTo(1);});
 it('connects all seven Mars stages and retains all Jupiter samples on return',()=>{
 let s=surface();s=collect(s,'stone',8);s=collect(s,'iron',7);s=collect(s,'silicon',3);s=collect(s,'magnesium',1);s=collect(s,'water',2);
 expect(s.phase).toBe('surface');s=applyAction(s,{type:'build',building:'base'},0,0);expect(s.stage).toBe(3);
 s=applyAction(s,{type:'plant'},0,0);s=applyAction(s,{type:'water'},0,0);sim(s,20.1,0,0);s=applyAction(s,{type:'harvest'},0,0);expect(s.stage).toBe(4);
 sim(s,42.1,0,0);expect(s.stormDone).toBe(true);s=applyAction(s,{type:'build',building:'lab'},12,0);
 for(const symbol of ['Fe','Si','Mg','O'])s=applyAction(s,{type:'scan',symbol},12,0);expect(s.analyzed).toHaveLength(4);
 for(let i=0;i<3;i++)s=applyAction(s,{type:'answer',answer:question(s).answer},12,0);expect(s.quizPassed).toBe(true);
 s=applyAction(s,{type:'build',building:'center'},-12,0);expect(s.unlockedJupiter).toBe(true);expect(s.built.center).toBe(true);
 s=applyAction(s,{type:'travel',planet:'jupiter'},-20,15);sim(s,50.1);for(const n of cloudNodes)s=applyAction(s,{type:'collect',id:n.id},n.x,n.z);expect(s.jupiterDone).toBe(true);
 s=applyAction(s,{type:'travel',planet:'mars'});expect(s.planet).toBe('mars');for(const n of cloudNodes)expect(s.inventory[n.kind]).toBeGreaterThanOrEqual(1);
 });
});

describe('Launch and controls',()=>{
 it('moves flight asteroids faster than the previous 12 units per second',()=>{expect(asteroidZ(-30,1)-asteroidZ(-30,0)).toBe(22);expect(RULES.asteroidSpeed).toBeGreaterThan(12);});
 it('uses oxygen faster outside the base without accelerating hunger',()=>{const s=surface();s.oxygen=100;s.food=100;sim(s,60,15,15);expect(s.oxygen).toBeCloseTo(64);expect(s.food).toBeCloseTo(96.4);});
 it('consumes exactly one tank and restores oxygen without wasting tanks at full oxygen',()=>{const s=surface();s.oxygen=25;const tanks=s.inventory['tank']??0;const refilled=applyAction(s,{type:'refill'});expect(refilled.oxygen).toBe(100);expect(refilled.inventory['tank']).toBe(tanks-1);expect(applyAction(refilled,{type:'refill'}).inventory['tank']).toBe(tanks-1);});
 it('keeps oxygen unchanged while sheltered in the base',()=>{const s=surface();s.built.base=true;s.oxygen=45;sim(s,60,0,0);expect(s.oxygen).toBe(45);});
 it('grows watered crops and removes harvested plants',()=>{expect(cropGrowth('planted',0)).toBe(.18);expect(cropGrowth('watered',10)).toBe(.625);expect(cropGrowth('ready',20)).toBe(1);expect(cropGrowth('harvested',20)).toBe(0);});
 it('counts down on Earth before ascent and then starts spaceflight',()=>{const s=applyAction(prepared(),{type:'launch'});expect(s.phase).toBe('launch');expect(launchAltitude(3)).toBe(0);expect(launchAltitude(4)).toBeCloseTo(1.8);sim(s,11.9);expect(s.phase).toBe('launch');sim(s,.2);expect(s.phase).toBe('flight');expect(s.flightTime).toBeLessThan(.2);});
 it('points the model native negative Z front in the movement direction',()=>{const m=moveVector(1,0,0),yaw=facingYaw(m.x,m.z);expect(-Math.sin(yaw)).toBeCloseTo(m.x);expect(-Math.cos(yaw)).toBeCloseTo(m.z);});
 it('maps keyboard touch and standard gamepad to identical camera-relative forward',()=>{expect(inputVector(new Set(['KeyW']))).toEqual({forward:1,strafe:0});expect(inputVector(new Set(),0,-1)).toEqual({forward:1,strafe:0});expect(inputVector(new Set(),0,0,0,-1)).toEqual({forward:1,strafe:0});expect(deadzone(.1,.05)).toEqual({x:0,y:0});expect(deadzone(0,-1)).toEqual({x:0,y:-1});});
});

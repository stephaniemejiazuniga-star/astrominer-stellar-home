export const RULES = { initialTanks: 4, missionTanks: 2, stormSeconds: 30, vortexSeconds: 50, factEvery: 60, factVisible: 10, quizElements: 4, maxPlayers: 5, launchSeconds: 12, countdownSeconds: 3, flightSeconds: 35, speed: 5.2, gravity: 3.71, jumpSpeed: 4.2, asteroidSpeed: 22, vortexParticleSpeed: 14, oxygenPerSecond: { easy: .3, normal: .6, hard: .9 } };
export type Planet = 'mars' | 'jupiter';
export type Resource = 'stone' | 'iron' | 'silicon' | 'magnesium' | 'water';
export type Action = { type: 'pack'; item: string } | { type: 'launch' } | { type: 'collect'; id: string } | { type: 'build'; building: 'base' | 'lab' | 'center' } | { type: 'plant' | 'water' | 'harvest' | 'refill' | 'eat' | 'deposit' | 'withdraw' | 'retry' } | { type: 'scan'; symbol: string } | { type: 'answer'; answer: string } | { type: 'travel'; planet: Planet };
export type GameState = {
 version: 1; phase: 'packing' | 'launch' | 'flight' | 'surface' | 'vortex'; planet: Planet; stage: number;
 inventory: Record<string, number>; storage: Record<string,number>; packed: string[]; collected: string[];
 built: {base:boolean;lab:boolean;center:boolean}; crop: 'empty' | 'planted' | 'watered' | 'ready' | 'harvested'; cropTime: number;
 analyzed: string[]; quiz: number; quizPassed: boolean; unlockedJupiter: boolean; jupiterDone: boolean; completed: boolean; completionTime: number;
 oxygen: number; health: number; food: number; time: number; launchTime: number; flightTime: number; hull: number;
 storm: number; stormDone: boolean; stormWarning: number; vortex: number; achievements: string[];
 factIndex: number; factTime: number; message: string; messageTime: number; x:number; z:number;
};
export const elements = [
 {symbol:'Fe',name:'Hierro',number:26,resource:'iron',use:'Estructuras y herramientas',fact:'El óxido de hierro da a Marte su color rojizo.'},
 {symbol:'Si',name:'Silicio',number:14,resource:'silicon',use:'Paneles solares y electrónica',fact:'El silicio está presente en numerosos minerales de las rocas.'},
 {symbol:'Mg',name:'Magnesio',number:12,resource:'magnesium',use:'Aleaciones ligeras',fact:'El magnesio se encuentra en minerales como el olivino.'},
 {symbol:'O',name:'Oxígeno',number:8,resource:'water',use:'Respiración y química del agua',fact:'El agua es H₂O: dos átomos de hidrógeno y uno de oxígeno.'},
 {symbol:'H',name:'Hidrógeno',number:1,resource:'H',use:'Combustibles e investigación',fact:'Es el elemento más abundante del universo.'},
 {symbol:'He',name:'Helio',number:2,resource:'He',use:'Refrigeración y globos',fact:'Es el segundo elemento más abundante del universo.'},
 {symbol:'C',name:'Carbono',number:6,resource:'C',use:'Química de la vida',fact:'Los compuestos orgánicos contienen carbono.'},
 {symbol:'N',name:'Nitrógeno',number:7,resource:'N',use:'Nutrición de plantas',fact:'Forma la mayor parte de la atmósfera terrestre.'},
 {symbol:'Ne',name:'Neón',number:10,resource:'Ne',use:'Iluminación',fact:'Es un gas noble.'},
 {symbol:'Na',name:'Sodio',number:11,resource:'Na',use:'Compuestos químicos',fact:'Junto con el cloro forma la sal común.'},
 {symbol:'P',name:'Fósforo',number:15,resource:'P',use:'Nutrición de plantas',fact:'Es parte de las moléculas del ADN.'},
 {symbol:'S',name:'Azufre',number:16,resource:'S',use:'Química e industria',fact:'El azufre sólido suele tener color amarillo.'},
 {symbol:'K',name:'Potasio',number:19,resource:'K',use:'Fertilizantes y nutrición',fact:'Es esencial para las células de los seres vivos.'},
 {symbol:'I',name:'Yodo',number:53,resource:'I',use:'Salud e investigación',fact:'Es importante para la función de la tiroides.'},
];
export const jupiterSymbols = ['H','He','C','N','O','Ne','Na','P','S','K','I'];
export const stageNames = ['Preparación espacial','Viaje a Marte','Construye tu base','Cultivos y agua','Tormenta de arena','Laboratorio científico','NASA DATA CENTER'];
export const objectives = [
 'Empaca el pico, las semillas y la bolsa científica. Llevas 4 tanques de oxígeno.',
 'Pilota la nave y esquiva los asteroides hasta llegar a Marte.',
 'Recolecta 6 piedras y 4 hierros. Acércate al emplazamiento y construye tu base.',
 'Busca agua, planta semillas, riega el cultivo y cosecha alimento dentro de tu base.',
 'Alerta de tormenta: vuelve a tu base y permanece dentro durante 30 segundos.',
 'Construye el laboratorio con 4 piedras, 3 hierros y 2 silicios. Analiza 4 elementos y responde el desafío.',
 'Construye NASA DATA CENTER con 5 piedras y 3 hierros. Completa la expedición marciana.',
];
export const buildCosts = {base:{stone:6,iron:4},lab:{stone:4,iron:3,silicon:2},center:{stone:5,iron:3}};
export const sites = {base:{x:0,z:0},lab:{x:12,z:0},center:{x:-12,z:0},rocket:{x:-20,z:15}};
export const marsNodes = Array.from({length:70},(_,i) => {
 const kinds: Resource[]=['stone','iron','silicon','magnesium','water'];
 const angle=i*2.39996; const radius=13+Math.sqrt(i)*3.4;
 return {id:`mars-${i}`,kind:kinds[i%5] ?? 'stone',x:Math.cos(angle)*radius,z:Math.sin(angle)*radius};
});
export const cloudNodes = jupiterSymbols.map((kind,i)=>({id:`jupiter-${i}`,kind,x:Math.cos(i*2.4)*(10+i),z:Math.sin(i*2.4)*(10+i)}));
export const facts: Record<Planet,string[]>={mars:[
 'Un día marciano dura aproximadamente 24 horas y 37 minutos.',
 'La gravedad de Marte es aproximadamente el 38 % de la terrestre.',
 'Olympus Mons es el volcán más alto del sistema solar.',
 'La atmósfera de Marte es muy delgada y está compuesta principalmente de dióxido de carbono.',
 'La temperatura media de Marte es de unos −65 °C.',
 'Los robots de la NASA exploran Marte. Todavía no hay bases humanas habitadas allí.',
 'Marte tiene dos pequeñas lunas: Fobos y Deimos.',
],jupiter:[
 'Júpiter es un gigante gaseoso sin una superficie sólida como la Tierra.',
 'La Gran Mancha Roja es una enorme tormenta atmosférica.',
 'Júpiter está compuesto principalmente por hidrógeno y helio.',
 'Europa, una luna de Júpiter, podría tener un océano bajo el hielo.',
 'Júpiter gira muy rápido: un día dura aproximadamente 10 horas.',
 'Las nubes de muestras de ASTROMINER son una representación educativa, no nubes reales de elementos puros.',
]};
export function newGame(): GameState { return {version:1,phase:'packing',planet:'mars',stage:0,inventory:{tank:RULES.initialTanks,food:2},storage:{},packed:[],collected:[],built:{base:false,lab:false,center:false},crop:'empty',cropTime:0,analyzed:[],quiz:0,quizPassed:false,unlockedJupiter:false,jupiterDone:false,completed:false,completionTime:0,oxygen:100,health:100,food:100,time:0,launchTime:0,flightTime:0,hull:100,storm:0,stormDone:false,stormWarning:0,vortex:0,achievements:[],factIndex:-1,factTime:0,message:'',messageTime:0,x:0,z:9}; }
export function restoreGame(value:unknown): GameState | null {
 if (!value || typeof value!=='object') return null;
 const s=value as Partial<GameState>;
 if(s.version!==1 || !s.inventory || !s.built || !Array.isArray(s.achievements) || !Array.isArray(s.collected) || !Array.isArray(s.analyzed) || !Array.isArray(s.packed) || !['packing','launch','flight','surface','vortex'].includes(s.phase??'') || !['mars','jupiter'].includes(s.planet??'')) return null;
 return {...newGame(),...s} as GameState;
}
export function notify(s:GameState,message:string) {s.message=message;s.messageTime=6;}
export function achieve(s:GameState,id:string) {if(!s.achievements.includes(id)){s.achievements.push(id);s.inventory['tank']=(s.inventory['tank']??0)+RULES.missionTanks;notify(s,`Logro: ${id} · +2 tanques de oxígeno`);}}
export function inBase(x:number,z:number,s:GameState){return s.planet==='mars' && s.built.base && Math.abs(x)<4.4 && Math.abs(z)<4.4;}
export function distance(x:number,z:number,point:{x:number;z:number}){return Math.hypot(x-point.x,z-point.z);}
export function nearestNode(s:GameState,x:number,z:number){return (s.planet==='mars'?marsNodes:cloudNodes).filter(n=>!s.collected.includes(n.id)).sort((a,b)=>distance(x,z,a)-distance(x,z,b))[0];}
export function canBuild(s:GameState,building:keyof typeof buildCosts){return Object.entries(buildCosts[building]).every(([k,n])=>(s.inventory[k]??0)>=n);}
export function question(s:GameState) {
 const pool=elements.filter(e=>s.analyzed.includes(e.symbol)); const e=pool[s.quiz%Math.max(pool.length,1)] ?? {symbol:'Fe',name:'Hierro',number:26,resource:'iron',use:'',fact:''};
 return s.quiz%3===0 ? {text:`¿Cuál es el símbolo del ${e.name.toLowerCase()}?`,answer:e.symbol,options:[e.symbol,...elements.filter(v=>v.symbol!==e.symbol).slice(0,3).map(v=>v.symbol)]} : s.quiz%3===1 ? {text:`¿Cuál es el número atómico de ${e.name}?`,answer:String(e.number),options:[String(e.number),String(e.number+1),String(e.number+3),String(e.number+5)]} : {text:`¿Qué elemento tiene el símbolo ${e.symbol}?`,answer:e.name,options:[e.name,...elements.filter(v=>v.symbol!==e.symbol).slice(0,3).map(v=>v.name)]};
}
export function applyAction(previous:GameState,action:Action,x=previous.x,z=previous.z):GameState {
 const s=structuredClone(previous);s.x=x;s.z=z;
 if(action.type==='retry'){if(s.phase==='flight'&&s.hull<=0){s.hull=100;s.flightTime=0;notify(s,'Nave reparada. Inténtalo otra vez.');}else if(s.health<=0){s.health=100;s.oxygen=100;s.food=80;s.x=0;s.z=0;notify(s,'Rescatado. Tus descubrimientos se conservan.');}return s;}
 if(s.health<=0 || s.hull<=0) return s;
 if(action.type==='pack' && s.phase==='packing') {if(!s.packed.includes(action.item)&&['pickaxe','seeds','bag','scanner','food'].includes(action.item)){s.packed.push(action.item);s.inventory[action.item]=(s.inventory[action.item]??0)+(action.item==='seeds'?3:1);}return s;}
 if(action.type==='launch'&&s.phase==='packing') {if(['pickaxe','seeds','bag'].every(k=>s.packed.includes(k))){s.phase='launch';s.launchTime=0;s.stage=1;achieve(s,'Equipamiento preparado');}else notify(s,'Empaca pico, semillas y bolsa científica antes de despegar.');return s;}
 if(action.type==='collect' && s.phase==='surface'){
 const node=(s.planet==='mars'?marsNodes:cloudNodes).find(n=>n.id===action.id);
 if(!node || s.collected.includes(node.id)||distance(x,z,node)>4) {notify(s,'Acércate a la muestra para recolectarla.');return s;}
 if(s.planet==='jupiter'&&!s.packed.includes('bag')){notify(s,'Necesitas la bolsa científica.');return s;}
 s.collected.push(node.id);s.inventory[node.kind]=(s.inventory[node.kind]??0)+(node.kind==='stone'||node.kind==='iron'?2:1);
 notify(s,`Muestra recolectada: ${node.kind}`);
 if(s.planet==='mars') achieve(s,'Primer mineral descubierto');
 if(s.planet==='jupiter'&&cloudNodes.every(n=>s.collected.includes(n.id))){s.jupiterDone=true;achieve(s,'Recolector de elementos químicos');}
 return s;
 }
 if(action.type==='build'&&s.phase==='surface'&&s.planet==='mars'){
 const b=action.building;
 if(s.built[b]){notify(s,'Esta instalación ya está construida.');return s;}
 if(distance(x,z,sites[b])>7){notify(s,'Acércate al emplazamiento de construcción.');return s;}
 if((b==='lab'&&!s.stormDone)||(b==='center'&&!s.quizPassed)){notify(s,'Completa la misión anterior primero.');return s;}
 if(!canBuild(s,b)){notify(s,'Necesitas más materiales para construir.');return s;}
 for(const [k,n] of Object.entries(buildCosts[b])) s.inventory[k]=(s.inventory[k]??0)-n;
 s.built[b]=true;
 if(b==='base'){s.stage=3;achieve(s,'Primera base construida');}
 if(b==='lab')achieve(s,'Laboratorio construido');
 if(b==='center'){s.unlockedJupiter=true;achieve(s,'NASA DATA CENTER construido');notify(s,'¡Marte completado! Júpiter desbloqueado.');}
 return s;
 }
 if(['plant','water','harvest','deposit','withdraw'].includes(action.type)&&!inBase(x,z,s)){notify(s,'Debes estar dentro de la base.');return s;}
 if(action.type==='plant'){if((s.crop==='empty'||s.crop==='harvested')&&(s.inventory['seeds']??0)>0){s.inventory['seeds']=(s.inventory['seeds']??0)-1;s.crop='planted';s.cropTime=0;notify(s,'Cultivo plantado. Necesita agua.');}return s;}
 if(action.type==='water'){if(s.crop==='planted'&&(s.inventory['water']??0)>0){s.inventory['water']=(s.inventory['water']??0)-1;s.crop='watered';s.cropTime=0;notify(s,'Cultivo regado. Crecerá en 20 segundos.');}else notify(s,'Necesitas agua y un cultivo plantado.');return s;}
 if(action.type==='harvest'){if(s.crop==='ready'){s.inventory['food']=(s.inventory['food']??0)+3;s.inventory['seeds']=(s.inventory['seeds']??0)+2;s.crop='harvested';achieve(s,'Primer cultivo');if(!s.stormDone){s.stage=4;s.stormWarning=12;notify(s,'ALERTA: tormenta en 12 segundos. Refúgiate en la base.');}}return s;}
 if(action.type==='refill'){if((s.inventory['tank']??0)>0&&s.oxygen<100){s.inventory['tank']=(s.inventory['tank']??0)-1;s.oxygen=100;notify(s,'Tanque conectado. Oxígeno al 100 %.');}return s;}
 if(action.type==='eat'){if((s.inventory['food']??0)>0&&s.food<100){s.inventory['food']=(s.inventory['food']??0)-1;s.food=Math.min(100,s.food+45);s.health=Math.min(100,s.health+10);notify(s,'Alimento consumido.');}return s;}
 if(action.type==='deposit'){for(const [k,n] of Object.entries(s.inventory)){if(['tank','food','seeds','pickaxe','bag','scanner'].includes(k))continue;s.storage[k]=(s.storage[k]??0)+n;s.inventory[k]=0;}notify(s,'Materiales almacenados en tu base.');return s;}
 if(action.type==='withdraw'){for(const [k,n]of Object.entries(s.storage)){s.inventory[k]=(s.inventory[k]??0)+n;s.storage[k]=0;}notify(s,'Materiales retirados del almacén.');return s;}
 if(action.type==='scan'){if(!s.built.lab||s.planet!=='mars'||distance(x,z,sites.lab)>7){notify(s,'Acércate al laboratorio de Marte.');return s;}const e=elements.find(e=>e.symbol===action.symbol);if(!e||Math.max(s.inventory[e.resource]??0,s.inventory[e.symbol]??0)<1){notify(s,'Recolecta esta muestra primero.');return s;}if(!s.analyzed.includes(e.symbol)){s.analyzed.push(e.symbol);notify(s,`${e.name} · ${e.symbol} · Número atómico ${e.number}`);}if(s.jupiterDone&&jupiterSymbols.every(j=>s.analyzed.includes(j))&&!s.achievements.includes('Expedición ASTROMINER completada')){achieve(s,'Expedición ASTROMINER completada');s.completed=true;s.completionTime=s.time;notify(s,'¡Campaña completada! Analizaste todas las muestras de Júpiter.');}return s;}
 if(action.type==='answer'){if(s.analyzed.length<4||!s.built.lab||distance(x,z,sites.lab)>7){notify(s,'Analiza al menos cuatro elementos en el laboratorio.');return s;}if(action.answer===question(s).answer){s.quiz++;s.inventory['tank']=(s.inventory['tank']??0)+2;notify(s,'¡Correcto! +2 tanques de oxígeno');if(s.quiz>=3&&!s.quizPassed){s.quizPassed=true;s.stage=6;achieve(s,'Científico principiante');}}else{ s.oxygen=Math.max(0,s.oxygen-5);notify(s,'No es correcto. Consulta las fichas e inténtalo de nuevo.');}return s;}
 if(action.type==='travel'){if(distance(x,z,sites.rocket)>7&&s.planet==='mars'){notify(s,'Acércate al cohete.');return s;}if(action.planet==='jupiter'&&!s.unlockedJupiter){notify(s,'Completa las siete etapas de Marte.');return s;}s.planet=action.planet;s.x=0;s.z=7;s.factTime=0;s.factIndex=-1;if(s.planet==='jupiter'&&!s.achievements.includes('Explorador de Júpiter')){s.phase='vortex';s.vortex=50;notify(s,'Vórtice atmosférico simulado. ¡Evita las partículas durante 50 segundos!');}else{s.phase='surface';notify(s,s.planet==='mars'?'De regreso en Marte. Analiza tus muestras en el laboratorio.':'Recoge las 11 muestras atmosféricas con tu bolsa científica.');}return s;}
 return s;
}
export function moveVector(forward:number,strafe:number,yaw:number){const length=Math.max(1,Math.hypot(forward,strafe));return{x:(Math.sin(yaw)*forward+Math.cos(yaw)*strafe)/length,z:(-Math.cos(yaw)*forward+Math.sin(yaw)*strafe)/length};}
export function stepGame(s:GameState,seconds:number,x:number,z:number,difficulty='normal') {
 const dt=Math.min(seconds,0.05);if(s.health<=0||s.hull<=0)return;
 s.time+=dt;s.x=x;s.z=z;s.messageTime=Math.max(0,s.messageTime-dt);
 if(s.phase==='packing')return;
 if(s.phase==='launch'){s.launchTime+=dt;if(s.launchTime>=RULES.launchSeconds){s.phase='flight';s.x=0;s.z=0;s.flightTime=0;}return;}
 s.factTime+=dt;
 if(s.factTime>=RULES.factEvery){s.factTime-=RULES.factEvery;s.factIndex=(s.factIndex+1)%facts[s.planet].length;}
 if(s.phase==='flight'){s.flightTime+=dt;if(s.flightTime>=RULES.flightSeconds){s.phase='surface';s.stage=2;s.x=0;s.z=9;achieve(s,'Primer viaje espacial');achieve(s,'Llegada a Marte');}return;}
 const rate=RULES.oxygenPerSecond[difficulty==='easy'?'easy':difficulty==='hard'?'hard':'normal'];
 if(!inBase(x,z,s))s.oxygen=Math.max(0,s.oxygen-dt*rate);
 const foodRate=difficulty==='easy'?.03:difficulty==='hard'?.12:.06;
 s.food=Math.max(0,s.food-dt*foodRate);
 if(s.oxygen<=0||s.food<=0)s.health=Math.max(0,s.health-dt*2);
 if(s.crop==='watered'){s.cropTime+=dt;if(s.cropTime>=20){s.crop='ready';notify(s,'Tu cultivo está listo para cosechar.');}}
 if(s.stormWarning>0){s.stormWarning=Math.max(0,s.stormWarning-dt);if(s.stormWarning===0)s.storm=RULES.stormSeconds;}
 else if(s.storm>0){s.storm=Math.max(0,s.storm-dt);if(!inBase(x,z,s))s.health=Math.max(0,s.health-dt*(difficulty==='easy'?0.5:1));if(s.storm===0){s.stormDone=true;s.stage=5;achieve(s,'Superviviente de la tormenta');}}
 if(s.phase==='vortex'){s.vortex=Math.max(0,s.vortex-dt);if(s.vortex===0){s.phase='surface';achieve(s,'Explorador de Júpiter');}}
}

export function formatDuration(seconds:number){const total=Math.max(0,Math.round(seconds));const h=Math.floor(total/3600);const m=Math.floor((total%3600)/60);const sec=total%60;return h>0?`${h} h ${m} min ${sec} s`:`${m} min ${sec} s`;}
export function facingYaw(x:number,z:number){return Math.atan2(x,z)+Math.PI;}
export function inputVector(keys:Set<string>,touchX=0,touchY=0,padX=0,padY=0){return {forward:(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-touchY-padY,strafe:(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+touchX+padX};}
export function deadzone(x:number,y:number){const m=Math.hypot(x,y);if(m<=.15)return {x:0,y:0};const scale=Math.min(1,(m-.15)/.85)/m;return {x:x*scale,y:y*scale};}
export function launchAltitude(time:number){const ascent=Math.max(0,time-RULES.countdownSeconds);return ascent*ascent*1.8;}
export function cropGrowth(crop:GameState['crop'],time:number){return crop==='ready'?1:crop==='watered'?.25+.75*Math.min(1,Math.max(0,time)/20):crop==='planted'?.18:0;}
export function asteroidZ(initial:number,time:number,vortex=false){return ((initial+time*(vortex?RULES.vortexParticleSpeed:RULES.asteroidSpeed)+360)%360)-180;}

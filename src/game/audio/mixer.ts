import engine from '@/assets/audio/engine_circular_000.ogg.asset.json';
import impact from '@/assets/audio/impact_metal_000.ogg.asset.json';
import ui from '@/assets/audio/computer_noise_000.ogg.asset.json';

export class GameAudio {
 private context: AudioContext | null = null;
 private music: GainNode | null = null;
 private effects: GainNode | null = null;
 private analyser: AnalyserNode | null = null;
 private buffers = new Map<string, AudioBuffer>();
 private voices = new Set<AudioBufferSourceNode>();
 private loop: AudioBufferSourceNode | null = null;
 private phase = 'packing';
 private musicLevel = 0;
 private effectLevel = 0;
 private muted = false;
 error = '';
 async start() {
  if (this.context) { await this.context.resume(); return; }
  const ctx = new AudioContext(); this.context = ctx;
  const limiter = ctx.createDynamicsCompressor(); limiter.threshold.value = -6; limiter.ratio.value = 12;
  this.analyser = ctx.createAnalyser(); this.analyser.fftSize = 2048;
  limiter.connect(this.analyser); this.analyser.connect(ctx.destination);
  this.music = ctx.createGain(); this.effects = ctx.createGain();
  this.music.connect(limiter); this.effects.connect(limiter);
  this.update(this.musicLevel, this.effectLevel, this.muted);
  try {
   await Promise.all(Object.entries({engine:engine.url,impact:impact.url,ui:ui.url}).map(async ([name,url])=>{
    const r = await fetch(url); if (!r.ok) throw Error(`Audio ${r.status}`);
    this.buffers.set(name, await ctx.decodeAudioData(await r.arrayBuffer()));
   }));
   if(ctx.state==='closed')return;
   const buffer=this.buffers.get('engine');
   if(buffer&&this.music){this.loop=ctx.createBufferSource();this.loop.buffer=buffer;this.loop.loop=true;this.loop.connect(this.music);this.loop.start();}
  } catch { this.error='audio-unavailable'; }
 }
 update(music:number,effects:number,muted:boolean){
  this.musicLevel=music;this.effectLevel=effects;this.muted=muted;
  const ctx=this.context;if(!ctx||ctx.state==='closed')return;
  const flying=['launch','flight','vortex'].includes(this.phase);
  this.music?.gain.setTargetAtTime(muted||!flying?0:music/100*.12,ctx.currentTime,.1);
  this.effects?.gain.setTargetAtTime(muted?0:effects/100*.25,ctx.currentTime,.1);
 }
 setPhase(phase:string){if(this.phase!==phase){this.phase=phase;this.update(this.musicLevel,this.effectLevel,this.muted);}}
 play(name='ui'){
  const ctx=this.context,buffer=this.buffers.get(name);
  if(!ctx||ctx.state!=='running'||!buffer||!this.effects||document.hidden||this.voices.size>=8)return;
  const source=ctx.createBufferSource();source.buffer=buffer;source.connect(this.effects);this.voices.add(source);
  source.onended=()=>{this.voices.delete(source);source.disconnect();};source.start();
 }
 get meters(){
  if(!this.analyser)return {peak:0,rms:0,state:this.context?.state??'locked',loaded:this.buffers.size,error:this.error};
  const samples=new Float32Array(this.analyser.fftSize);this.analyser.getFloatTimeDomainData(samples);
  let peak=0,sum=0;for(const x of samples){peak=Math.max(peak,Math.abs(x));sum+=x*x;}
  return {peak,rms:Math.sqrt(sum/samples.length),state:this.context?.state,loaded:this.buffers.size,error:this.error};
 }
 suspend(){void this.context?.suspend();}
 close(){this.loop?.stop();for(const v of this.voices)v.stop();void this.context?.close();this.context=null;}
}
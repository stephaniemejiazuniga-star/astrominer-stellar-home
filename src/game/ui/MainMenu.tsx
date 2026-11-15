import { LanguageContext } from '../data/i18n';
import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MultiplayerPanel } from './MultiplayerPanel';
import { AccountPanel } from './AccountPanel';
import { ScienceLibrary } from './ScienceLibrary';
import { ArrowRight, Rocket, Users, Settings2, BookOpen, Orbit, LogOut, Volume2, VolumeX, Maximize, Minimize, ChevronRight, Lock, Sparkles, Globe, Check, RotateCcw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { defaultSettings, parseSettings, SETTINGS_KEY, type Settings } from '../data/settings';
import { scienceCards } from '../data/science';
import marsImage from '@/assets/mars-expedition.jpg';

type Panel = 'play' | 'multiplayer' | 'settings' | 'help' | 'science' | 'exit' | 'account' | null;

export function MainMenu() {
  const navigate = useNavigate();
  const [panel, setPanel] = useState<Panel>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [notice, setNotice] = useState('');
  const en = settings.language === 'en';
  const t = (es: string, english: string) => en ? english : es;
  useEffect(() => {
    try { setSettings(parseSettings(localStorage.getItem(SETTINGS_KEY))); } catch { /* Device storage may be unavailable. */ }
    setLoaded(true);
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);
  useEffect(() => { if (loaded) { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { setNotice(t('No se pudieron guardar las preferencias en este dispositivo.', 'Preferences could not be saved on this device.')); } } }, [settings, loaded]);
  useEffect(() => { document.documentElement.lang = settings.language; }, [settings.language]);
  const change = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings(s => ({ ...s, [key]: value }));
  async function toggleFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { setNotice(t('Este navegador no permite activar pantalla completa.', 'This browser does not support fullscreen.')); }
  }
  const titles = { play: t('Seleccionar expedición', 'Choose expedition'), multiplayer: t('Multijugador', 'Multiplayer'), settings: t('Configuración', 'Settings'), help: t('Cómo jugar', 'How to play'), science: 'NASA DATA CENTER', exit: t('Salir del juego', 'Exit game'), account: t('Cuenta y perfil opcional', 'Account and optional profile') };
  const descriptions = { play: t('Tu aventura comienza en Marte.', 'Your adventure begins on Mars.'), multiplayer: t('Exploración cooperativa · Hasta 5 exploradores', 'Cooperative exploration · Up to 5 explorers'), settings: t('Preferencias de tu expedición', 'Your expedition preferences'), help: t('Manual del explorador', 'Explorer handbook'), science: t('Ciencia real. Una aventura por descubrir.', 'Real science. An adventure to discover.'), exit: t('Finalizar sesión', 'End session'), account: t('Guarda tus avances y personaliza tu explorador.', 'Save progress and customize your explorer.') };
  const select = (key: 'language' | 'difficulty' | 'graphics' | 'device', label: string, options: [string,string][]) => <label className="setting-row"><span>{label}</span><select aria-label={label} className="setting-select" value={settings[key]} onChange={e => setSettings(s => parseSettings(JSON.stringify({ ...s, [key]: e.target.value })))}>{options.map(([value,name]) => <option key={value} value={value}>{name}</option>)}</select></label>;
  const range = (key: 'music' | 'effects' | 'sensitivity', label: string) => <label className="setting-row"><span>{label}</span><span className="flex items-center gap-3"><input aria-label={label} className="setting-range" type="range" min="0" max="100" value={settings[key]} onChange={e => change(key, Number(e.target.value))}/><span className="w-9 text-right text-muted-foreground text-xs">{settings[key]}%</span></span></label>;

  return <main className="mission-shell">
    <img className="mission-backdrop" src={marsImage} alt={t('Ilustración de una expedición ficticia en Marte con un astronauta y una base.', 'Illustration of a fictional Mars expedition with an astronaut and a base.')} width={1920} height={1088}/>
    <div className="mission-shade"/>
    <header className="topbar">
      <div className="brand-mark"><Orbit className="brand-icon size-7"/> ASTROMINER <span className="hidden sm:block border-l border-border pl-4 text-muted-foreground eyebrow">{t('PROGRAMA DE EXPLORACIÓN', 'EXPLORATION PROGRAM')}</span></div>
      <div className="flex items-center gap-4"><Button variant="menu" size="icon" title={t('Cuenta y perfil', 'Account and profile')} aria-label={t('Cuenta y perfil', 'Account and profile')} onClick={() => setPanel('account')}><Users/></Button><span className="topbar-status eyebrow text-muted-foreground flex items-center gap-2"><span className="status-dot"/>{t('SISTEMAS EN LÍNEA', 'SYSTEMS ONLINE')}</span><Button variant="menu" size="icon" aria-label={muted ? t('Activar sonido', 'Unmute') : t('Silenciar', 'Mute')} title={t('Sonido', 'Sound')} onClick={() => setMuted(!muted)}>{muted ? <VolumeX/> : <Volume2/>}</Button><Button variant="menu" size="icon" aria-label={t('Pantalla completa', 'Fullscreen')} title={t('Pantalla completa', 'Fullscreen')} onClick={toggleFullscreen}>{fullscreen ? <Minimize/> : <Maximize/>}</Button></div>
    </header>
    <div className="menu-body"><section className="menu-content">
      <div className="eyebrow text-primary flex items-center gap-2"><span className="w-6 border-t border-primary"/>{t('EL UNIVERSO TE ESPERA', 'THE UNIVERSE AWAITS')}</div>
      <h1 className="game-title">ASTROMINER<span className="text-primary">.</span></h1>
      <p className="game-subtitle">{t('Explora. Sobrevive. Descubre.', 'Explore. Survive. Discover.')}<br/>{t('Tu próxima aventura está fuera de este mundo.', 'Your next adventure is out of this world.')}</p>
      <nav className="game-menu" aria-label={t('Menú principal', 'Main menu')}>
        <Button variant="mission" className="menu-command launch-command" onClick={() => navigate({to:'/expedition',search:{room:undefined}})}><Rocket/>{t('JUGAR', 'PLAY')}<ArrowRight className="ml-auto"/></Button>
        <Button variant="menu" className="menu-command" onClick={() => setPanel('multiplayer')}><Users/>{t('Multijugador', 'Multiplayer')}<span className="ml-auto eyebrow text-muted-foreground">01—05</span></Button>
        <Button variant="menu" className="menu-command" onClick={() => setPanel('settings')}><Settings2/>{t('Configuración', 'Settings')}</Button>
        <Button variant="menu" className="menu-command" onClick={() => setPanel('help')}><BookOpen/>{t('Cómo jugar', 'How to play')}</Button>
        <div className="menu-rule"/>
        <Button variant="menu" className="menu-command" onClick={() => setPanel('science')}><Orbit className="text-science"/><span className="font-display text-xs">NASA DATA CENTER</span><ChevronRight className="ml-auto text-muted-foreground"/></Button>
        <Button variant="menu" className="menu-command text-muted-foreground" onClick={() => setPanel('exit')}><LogOut/>{t('Salir del juego', 'Exit game')}</Button>
      </nav>
      <dl className="telemetry"><div><dt>{t('DESTINO INICIAL', 'FIRST DESTINATION')}</dt><dd>{t('Marte', 'Mars')} <span className="text-primary">↗</span></dd></div><div><dt>{t('MODO', 'MODE')}</dt><dd>{t('Exploración', 'Exploration')}</dd></div><div><dt>{t('MISIÓN', 'MISSION')}</dt><dd>ARES — 01</dd></div></dl>
    </section></div>
    <div className="planet-marker"><div className="eyebrow text-primary">04 / {t('SISTEMA SOLAR', 'SOLAR SYSTEM')}</div><div className="text-2xl mt-2">{t('MARTE', 'MARS')}</div><div className="text-xs text-foreground/70 mt-1">18° N · 77° E</div></div>
    <footer className="bottom-band"><div className="fact-preview"><Sparkles className="text-signal size-6 shrink-0"/><div><span className="fact-label">{t('BITÁCORA CIENTÍFICA / ¿SABÍAS QUE?', 'SCIENCE LOG / DID YOU KNOW?')}</span><p>{t('Un día en Marte dura aproximadamente 24 horas y 37 minutos. ¡Un poco más que en la Tierra!', 'A day on Mars lasts approximately 24 hours and 37 minutes. A little longer than on Earth!')}</p></div></div><div className="text-right"><div className="eyebrow text-muted-foreground">{t('EXPLORACIÓN · CIENCIA · SUPERVIVENCIA', 'EXPLORATION · SCIENCE · SURVIVAL')}</div><div className="text-[10px] text-muted-foreground mt-2">{t('Expedición educativa · Escenario de simulación', 'Educational expedition · Simulation scene')}</div></div></footer>
    <Dialog open={panel !== null} onOpenChange={open => { if (!open) { setPanel(null); setNotice(''); } }}><DialogContent className="system-dialog"><DialogTitle>{panel ? titles[panel] : ''}</DialogTitle><DialogDescription>{panel ? descriptions[panel] : ''}</DialogDescription>
      {panel === 'settings' && <><div className="settings-group">{select('language',t('Idioma', 'Language'),[['es','Español'],['en','English']])}{select('difficulty',t('Dificultad', 'Difficulty'),[['easy',t('Fácil','Easy')],['normal','Normal'],['hard',t('Difícil','Hard')]])}</div><div className="settings-group">{range('music',t('Música','Music'))}{range('effects',t('Efectos de sonido','Sound effects'))}</div><div className="settings-group">{select('graphics',t('Calidad gráfica','Graphics quality'),[['high',t('Alta','High')],['low',t('Baja','Low')]])}{range('sensitivity',t('Sensibilidad de cámara','Camera sensitivity'))}{select('device',t('Dispositivo','Device'),[['auto',t('Automático','Automatic')],['desktop',t('Computadora','Desktop')],['tablet','Tablet'],['mobile',t('Celular','Phone')]])}<label className="setting-row"><span>{t('Consejos de misión','Mission tips')}</span><Switch checked={settings.tips} onCheckedChange={v => change('tips',v)} aria-label={t('Consejos de misión','Mission tips')}/></label><label className="setting-row"><span>{t('Pantalla completa','Fullscreen')}</span><Switch checked={fullscreen} onCheckedChange={toggleFullscreen} aria-label={t('Pantalla completa','Fullscreen')}/></label></div><p className="text-xs text-muted-foreground">{t('Las preferencias se guardan en este dispositivo y se aplican a tu expedición.', 'Preferences are saved on this device and apply to your expedition.')}</p><div className="flex justify-between gap-2"><Button variant="ghost" onClick={() => setSettings({...defaultSettings})}><RotateCcw/>{t('Restablecer','Reset')}</Button><Button onClick={() => setPanel(null)}><Check/>{t('Listo','Done')}</Button></div></>}
      {panel === 'help' && <><div className="science-entry"><h3>{t('Controles de la expedición','Expedition controls')}</h3>{[['W A S D',t('Mover al explorador','Move explorer')],[t('Mouse','Mouse'),t('Orientar la cámara','Control camera')],[t('Espacio','Space'),t('Saltar','Jump')],['E',t('Interactuar y recolectar','Interact and collect')]].map(([key,label]) => <div className="setting-row" key={key}><span>{label}</span><kbd className="control-key">{key}</kbd></div>)}</div><div className="science-entry"><h3>{t('Tu misión en Marte','Your Mars mission')}</h3><p>{t('Prepara tu equipaje, pilota el cohete, construye tu base, cultiva alimentos y busca agua. Refúgiate de las tormentas y analiza tus muestras en el laboratorio.', 'Pack your equipment, pilot the rocket, build your base, grow food and find water. Shelter from storms and analyze your samples in the laboratory.')}</p><p>{t('En tablet y celular tienes controles táctiles. Arrastra sobre el escenario para girar la cámara.', 'On tablet and phone, touch controls are available. Drag on the scene to rotate the camera.')}</p></div></>}
      {panel === 'science' && <LanguageContext.Provider value={settings.language}><ScienceLibrary/></LanguageContext.Provider>}
      {panel === 'multiplayer' && <LanguageContext.Provider value={settings.language}><MultiplayerPanel/></LanguageContext.Provider>}
      {panel === 'account' && <LanguageContext.Provider value={settings.language}><AccountPanel/></LanguageContext.Provider>}
      {panel === 'exit' && <><p className="text-muted-foreground text-sm">{t('Tus preferencias permanecen guardadas. Puedes cerrar esta pestaña para salir de ASTROMINER.', 'Your preferences remain saved. You can close this tab to exit ASTROMINER.')}</p><Button onClick={() => setPanel(null)}>{t('Permanecer en ASTROMINER','Stay in ASTROMINER')}</Button></>}
      {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
    </DialogContent></Dialog>
  </main>;
}
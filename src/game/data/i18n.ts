import {createContext,useContext,useEffect,useState} from 'react';
import {english} from './translations';
import {parseSettings,SETTINGS_KEY} from './settings';
export const LanguageContext=createContext<'es'|'en'|null>(null);
export function translate(text:string,language:'es'|'en'):string {
 if(language==='es')return text;
 if(english[text])return english[text];
 const lower=Object.entries(english).find(([key])=>key.toLowerCase()===text);
 if(lower)return lower[1].toLowerCase();
 if(text.startsWith('Logro: ')){const [name,reward]=text.slice(7).split(' · ');return `Achievement: ${translate(name??'',language)} · ${reward?.replace('tanques de oxígeno','oxygen tanks')??''}`;}
 if(text.startsWith('Muestra recolectada: '))return `Sample collected: ${translate(text.slice(21),language)}`;
 if(text.startsWith('Recolectar '))return `Collect ${translate(text.slice(11),language)}`;
 if(text.startsWith('¿Cuál es el símbolo del '))return `What is the symbol for ${translate(text.slice(24,-1),language)}?`;
 if(text.startsWith('¿Cuál es el número atómico de '))return `What is the atomic number of ${translate(text.slice(30,-1),language)}?`;
 if(text.startsWith('¿Qué elemento tiene el símbolo '))return `Which element has the symbol ${text.slice(31,-1)}?`;
 if(text.includes(' · Número atómico '))return text.split(' · ').map(part=>part.startsWith('Número atómico ')?part.replace('Número atómico ','Atomic number '):translate(part,language)).join(' · ');
 return text;
}
export function useTranslation(){
 const inherited=useContext(LanguageContext);const [local,setLocal]=useState<'es'|'en'>('es');
 useEffect(()=>{if(inherited===null)setLocal(parseSettings(localStorage.getItem(SETTINGS_KEY)).language);},[inherited]);
 const language=inherited??local;
 return {language,t:(text:string)=>translate(text,language)};
}
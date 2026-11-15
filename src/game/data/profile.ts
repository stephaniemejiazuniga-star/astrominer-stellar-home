export type Suit='orange'|'cyan'|'green';
export function selectedSuit(profile:{enabled?:boolean;avatar?:string}|null|undefined):Suit {
 return profile?.enabled&&(profile.avatar==='cyan'||profile.avatar==='green')?profile.avatar:'orange';
}
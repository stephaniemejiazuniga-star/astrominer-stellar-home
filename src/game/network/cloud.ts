import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { newGame, restoreGame, type GameState } from '../sim/campaign';
export async function currentUser(){const {data,error}=await supabase.auth.getUser();if(error)return null;return data.user;}
export async function loadSave(){const user=await currentUser();if(!user)return null;const {data,error}=await supabase.from('game_saves').select('state').eq('user_id',user.id).maybeSingle();if(error)throw error;return restoreGame(data?.state);}
export async function saveProgress(state:GameState){const user=await currentUser();if(!user)throw new Error('Inicia sesión para guardar tus avances.');const {error}=await supabase.from('game_saves').upsert({user_id:user.id,state:state as unknown as Json,updated_at:new Date().toISOString()});if(error)throw error;}
export async function createRoom(name:string){const {data,error}=await supabase.rpc('create_expedition',{initial_state:newGame() as unknown as Json,explorer_name:name||'Explorador'});if(error)throw error;return data;}
export async function joinRoom(code:string,name:string){const {data,error}=await supabase.rpc('join_expedition',{room_code:code,explorer_name:name||'Explorador'});if(error)throw error;return data;}
export async function readRoom(id:string){const {data,error}=await supabase.from('expeditions').select('*').eq('id',id).single();if(error)throw error;return data;}
export async function writeRoom(id:string,state:GameState,revision:number){const {data,error}=await supabase.rpc('save_expedition',{r:id,next_state:state as unknown as Json,expected_revision:revision});if(error)throw error;return data;}

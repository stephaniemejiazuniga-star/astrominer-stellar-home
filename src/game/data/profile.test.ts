import {describe,it,expect} from 'vitest';
import {selectedSuit} from './profile';
describe('Optional explorer appearance',()=>{
 it('applies cyan and green when the optional profile is enabled',()=>{expect(selectedSuit({enabled:true,avatar:'cyan'})).toBe('cyan');expect(selectedSuit({enabled:true,avatar:'green'})).toBe('green');});
 it('keeps the default suit when the profile is disabled or absent',()=>{expect(selectedSuit({enabled:false,avatar:'cyan'})).toBe('orange');expect(selectedSuit(null)).toBe('orange');});
});
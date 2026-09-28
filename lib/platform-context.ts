import { headers } from 'next/headers';
import { modulesForContext, type PlatformMode } from './platform-modules';

export type PlatformContext={
  mode:PlatformMode;
  email:string|null;
  role:string|null;
  organisation:string|null;
  services:string[];
  modules:ReturnType<typeof modulesForContext>;
};

function splitServices(value:string|null){
  if(!value) return [];
  return value.split(',').map(x=>x.trim()).filter(Boolean);
}

export function getPlatformContext():PlatformContext{
  const h=headers();
  const role=h.get('x-orvia-role');
  const email=h.get('x-orvia-user');
  const organisation=h.get('x-orvia-organisation');
  const services=splitServices(h.get('x-orvia-services'));
  const internal=['founder','admin','internal','employee','director','manager'].includes(String(role||'').toLowerCase());
  const mode:PlatformMode=internal?'internal':'customer';
  return {mode,email,role,organisation,services,modules:modulesForContext(mode,services)};
}

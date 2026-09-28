import { NextResponse } from 'next/server';
import { getPlatformContext } from '@/lib/platform-context';

export const dynamic='force-dynamic';

export async function GET(){
  const context=await getPlatformContext();
  return NextResponse.json(context,{headers:{'cache-control':'no-store'}});
}

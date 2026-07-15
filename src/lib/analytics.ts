function readPublicEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export const GA_MEASUREMENT_ID = readPublicEnv(process.env.NEXT_PUBLIC_GA_ID, 'G-5MJRPETY0P');
export const CLARITY_PROJECT_ID = readPublicEnv(process.env.NEXT_PUBLIC_CLARITY_ID, 'xmrxndigth');

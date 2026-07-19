import { ActivityEntry, ActivityType } from './types';

export function generateRandomCode(): string {
  return '#' + Math.floor(1000 + Math.random() * 9000);
}

export function createActivity(
  type: ActivityType,
  title: string,
  subtitle: string
): ActivityEntry {
  return {
    id: 'act-' + Date.now(),
    title,
    subtitle,
    type,
    code: generateRandomCode(),
    timestamp: Date.now(),
  };
}

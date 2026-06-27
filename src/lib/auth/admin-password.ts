/** @format */

import { timingSafeEqual } from 'node:crypto';

export function verifyAdminPassword(input: string, expected: string): boolean {
  if (!input || !expected) {
    return false;
  }

  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(inputBuffer, expectedBuffer);
}

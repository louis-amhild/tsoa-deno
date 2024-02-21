import { Buffer as BufferPolyfill } from '@buffer';

declare global {
  const Buffer: typeof BufferPolyfill;
  type Buffer = BufferPolyfill;
}

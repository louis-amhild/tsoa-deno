import { Buffer as BufferPolyfill } from "https://deno.land/x/node_buffer@1.1.0/src/buffer.js";

declare global {
  const Buffer: typeof BufferPolyfill;
  type Buffer = BufferPolyfill;
}

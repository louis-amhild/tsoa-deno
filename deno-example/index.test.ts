import { assertEquals } from "https://deno.land/std@0.213.0/assert/assert_equals.ts";
import { delay } from "https://deno.land/std@0.213.0/async/delay.ts";

Deno.test("Hello testing in Deno", () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});

Deno.test("Async testing in Deno", async () => {
    const x = 1 + 2;
  
    // await some async task
    await delay(100);
  
    if (x !== 3) {
      throw Error("x should be equal to 3");
    }
  });
  
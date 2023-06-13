import { html, tokens } from "https://deno.land/x/rusty_markdown/mod.ts";

export function add(a: number, b: number): number {
  return a + b;
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  // read from file at ./md/index.ts
  const md = await Deno.readTextFile("./md/index.md");
  const tokenized = tokens(md, {
    strikethrough: true,
  });
  const rendered = html(tokenized);

  await Deno.writeTextFile("./dist/index.html", rendered);
}

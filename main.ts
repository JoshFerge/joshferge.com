import { html, tokens } from "https://deno.land/x/rusty_markdown@v0.4.1/mod.ts";

import { walk, ensureDir } from "https://deno.land/std@0.100.0/fs/mod.ts";

const wrapper = (body: string) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="description" content="Josh Ferge's Personal Website">
<meta name="keywords" content="Developer, Javascript, Python, Code, Startups">
<meta name="author" content="Josh Ferge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
${body}
<footer>
  <p><a href="https://twitter.com/JoshFerge">Josh Ferge</a></p>
  <p><a href="/">Home</a></p>
</footer>
</body>
</html>`;

async function listFilesInDir(path: string) {
  const files = [];
  const directories = [];
  for await (const entry of walk(path)) {
    if (entry.isFile) {
      files.push(entry.path);
    } else {
      directories.push(entry.path);
    }
  }
  return [files, directories];
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const [files, directories] = await listFilesInDir("./md");

  for (const directory of directories) {
    const directory_new = directory.replace("md/", "dist/");
    await ensureDir(directory_new);
  }

  for (const file of files) {
    const md = await Deno.readTextFile(file);
    const tokenized = tokens(md, {
      strikethrough: true,
    });
    const rendered = html(tokenized);

    const path = file.replace(".md", ".html").replace("md/", "dist/");
    console.log(path);
    await Deno.writeTextFile(path, wrapper(rendered));
  }

  // read from file at ./md/index.ts
  // const md = await Deno.readTextFile("./md/index.md");
  // const tokenized = tokens(md, {
  //   strikethrough: true,
  // });
  // const rendered = html(tokenized);

  // await Deno.writeTextFile("./dist/index.html", rendered);
}

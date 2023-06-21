import { html, tokens } from "https://deno.land/x/rusty_markdown@v0.4.1/mod.ts";
import { walk, ensureDir } from "https://deno.land/std@0.192.0/fs/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.192.0/http/file_server.ts";

const currentWorkingDirectory = Deno.cwd();
console.log(currentWorkingDirectory);
// load the index.html file in this directory as a string
const templateHtml = await Deno.readTextFile("./templates/template.html");
const wrapper = (body: string, title: string, isIndex: boolean) => {
  let withTitle: string;
  const withBody = templateHtml.replace("{{body}}", body);
  if (!isIndex) {
    withTitle = withBody.replace("{{title}}", title + " - Josh Ferge");
  } else {
    withTitle = withBody.replace(
      "{{title}}",
      "The Personal Website of Josh Ferge"
    );
  }
  return withTitle;
};

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

async function clean() {
  const [filesToRemove, _directoriesToRemove] = await listFilesInDir("./dist");
  for (const file of filesToRemove) {
    await Deno.remove(file, { recursive: true });
  }
}

async function copyStaticFiles() {
  const [staticFiles, staticDirectories] = await listFilesInDir("./static");
  for (const directory of staticDirectories) {
    const directory_new = directory.replace("static/", "dist/");
    await ensureDir(directory_new);
  }
  for (const file of staticFiles) {
    const file_new = file.replace("static/", "dist/");
    await Deno.copyFile(file, file_new);
  }
}

if (import.meta.main) {
  await ensureDir("./dist");
  await clean();
  await copyStaticFiles();

  const [files, directories] = await listFilesInDir("./md");

  for (const directory of directories) {
    const directory_new = directory.replace("md/", "dist/");
    await ensureDir(directory_new);
  }

  for (const file of files) {
    const isIndex = file.includes("index.md");
    const md = await Deno.readTextFile(file);
    const tokenized = tokens(md, {
      strikethrough: true,
    });
    const body = html(tokenized);

    const title = tokenized[1];
    if (title.type != "text") {
      throw new Error("not a text!");
    }

    const path = !isIndex
      ? file.replace(".md", "").replace("md/", "dist/")
      : file.replace(".md", ".html").replace("md/", "dist/");

    await Deno.writeTextFile(path, wrapper(body, title.content, isIndex));
  }

  // serve((req) => {
  //   return serveDir(req, {
  //     fsRoot: "./dist",
  //   });
  // });
}

const path = require("path");
const util = require("util");
const fs = require("fs");

const fetch = require("node-fetch");
const shell = require("shelljs");

const writeFile = util.promisify(fs.writeFile);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  shell.rm("-rf", path.join(__dirname, "content"));
  shell.mkdir(path.join(__dirname, "content"));

  const baseUrl = "https://api.momox.de/api/v3/static_content/";

  const token = process.env["MOMOX_MEDIA_TOKEN"];
  if (!token) {
    console.error("Token not found.");
    process.exit(1);
  }
  const headers = {
    "X-API-TOKEN": token,
    "X-MARKETPLACE-ID": "momox_de",
  };

  let response = await fetch(`${baseUrl}cms_urls/`, {
    headers,
  });
  const urls = await response.json();

  for (const k in urls) {
    let { url } = urls[k];
    url = url.replace(/^\//, "").replace(/\/$/, "");
    response = await fetch(`${baseUrl}cms_page/${url}/`, { headers });
    const json = await response.json();
    const html = json.content;
    const savePath = path.join(__dirname, "content", "media_de", url) + ".html";
    shell.mkdir("-p", path.dirname(savePath));
    await writeFile(savePath, html, { encoding: "utf-8" });
    await sleep(100);
  }
};

main();

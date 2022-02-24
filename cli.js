const { Octokit } = require("octokit");
const dotenv = require("dotenv");
const {
  createOrUpdateTextFile,
} = require("@octokit/plugin-create-or-update-text-file");

dotenv.config();

const MyOctokit = Octokit.plugin(createOrUpdateTextFile).defaults({
    userAgent: "Nose Booper"
  });

const octokit = new MyOctokit({
  auth: process.env.GITHUB_TOKEN,
});


async function run() {
  const { data: user } = await octokit.request("GET /user");

  console.log(`authenticated as ${user.login}`);

  // get the README

  const response = await octokit.createOrUpdateTextFile({
    owner: "mplumer",
    repo: "octokit-boop-counter",
    path: "README.md",
    message: "BOOP",
    content: ({ content }) => {
        return bumpBoopCounter(content);
    }
  });

  console.log(response.data);

  // this is the long way

  //   const { data: readme } = await octokit.request(
  //     "GET /repos/{owner}/{repo}/contents/{path}",
  //     {
  //       owner: "mplumer",
  //       repo: "mplumer",
  //       path: "README.md",
  //     }
  //   );

  //   const content = Buffer.from(readme.content, "base64").toString();

  //   const updated = bumpBoopCounter(content);

  //   console.log(updated);

  //   const response = await octokit.request(
  //     "PUT /repos/{owner}/{repo}/contents/{path}",
  //     {
  //       owner: "mplumer",
  //       repo: "mplumer",
  //       path: "README.md",
  //       message: "BOOP",
  //       content: Buffer.from(updated, "utf8").toString("base64"),
  //       sha: readme.sha,
  //     }
  //   );

  //   console.dir(response.data);
}

run();

function bumpBoopCounter(content) {
  return content.replace(
    /<!-- boop-counter -->(\d+)<!-- \/boop-counter -->/,
    (_content, counter) =>
      `<!-- boop-counter -->${Number(counter) + 1}<!-- /boop-counter -->`
  );
}

#!/usr/bin/env node

const { Octokit } = require("octokit");
const dotenv = require("dotenv");
const {
  createOrUpdateTextFile,
} = require("@octokit/plugin-create-or-update-text-file");
const { createOAuthDeviceAuth } = require("@octokit/auth-oauth-device");

dotenv.config();

const MyOctokit = Octokit.plugin(createOrUpdateTextFile).defaults({
  userAgent: "Nose Booper",
});

const octokit = new MyOctokit({
  authStrategy: createOAuthDeviceAuth,
  auth: {
    clientType: "oauth-app",
    clientId: "5d2b486acd597f148f00",
    scopes: ["public_repo"],
    onVerification(verification) {
      console.log("Open %s", verification.verification_uri);
      console.log("Enter code: %s", verification.user_code);
    },
  },
  //auth: process.env.GITHUB_TOKEN,
});

async function run() {
  const { data: user } = await octokit.request("GET /user");

  console.log(`authenticated as ${user.login}`);

  // get the README

  try {
    const response = await octokit.createOrUpdateTextFile({
      owner: "mplumer",
      repo: "octokit-boop-counter",
      path: "README.md",
      message: "BOOP",
      content: ({ content }) => {
        return bumpBoopCounter(content);
      },
    });

    console.log("Youve been booped");
  } catch (error) {
    const { data: issue } = await octokit.request(
      "POST /repos/{owner}/{repo}/issues",
      {
        owner: "mplumer",
        repo: "octokit-boop-counter",
        title: "lemme boop",
        body: "Here comes a boop",
      }
    );

    console.log(`issue created at ${issue.html_url}`);
  }

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

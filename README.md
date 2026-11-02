# AI Engineering Course

A self-contained, browser-based course for learning practical AI engineering. The course currently contains 41 lessons across 9 domains, with guided lesson steps, concept maps, interactive misconception cards, reflection prompts, and quizzes.

## Run locally

Open `AI Engineering Course.html` in a modern web browser. No build step or server is required. The page loads its Markdown renderer, syntax highlighter, and fonts from CDNs, so those features need an internet connection.

Your lesson progress and reflection notes are saved in your browser's local storage; they are not synced between devices.

## Deploy with GitHub Pages

This repository includes a GitHub Actions workflow that publishes the course at the site root as `index.html` whenever a commit is pushed to `main`, or when the workflow is run manually. It publishes the existing course file without changing its source filename in the repository.

1. In **Settings → Pages**, choose **GitHub Actions** as the build and deployment source.
2. Push a commit to `main`, or run **Deploy to GitHub Pages** from the **Actions** tab.
3. After the workflow succeeds, open the Pages URL shown in the `github-pages` deployment environment. It is typically `https://ayushpal11.github.io/AI_Eng/`.

The first deployment may take a few minutes to become available.

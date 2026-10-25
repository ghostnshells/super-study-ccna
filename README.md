# CCNA Study Hub

A dependency-free static study application for Cisco CCNA 200-301 v1.1. It includes complete lessons, labs, quizzes, two practice-exam pools, subnetting drills, flashcards, resource links, and local progress tracking.

## Local development

Requirements: Node.js 20+ and Python 3.

```bash
npm run validate
npm run dev
```

Open <http://localhost:3000>. Do not open `index.html` directly from the filesystem: browsers block the lesson and JSON `fetch()` requests under `file://`.

## Validation

```bash
npm run build
```

The build is intentionally dependency-free. It validates:

- every JSON file parses;
- outline, question, flashcard, coverage, and resource IDs are unique and consistent;
- all referenced exam topics exist in the official outline data;
- each domain has a lesson fragment and every top-level topic is represented there;
- question answer data matches its question type;
- the inline application JavaScript parses successfully;
- required production files are present.

## Deploy to Vercel

### Vercel dashboard

1. Import this Git repository into Vercel.
2. Select **Other** as the framework preset.
3. Leave the root directory as the repository root.
4. Set the build command to `npm run build` if Vercel does not detect it automatically.
5. Leave the output directory empty (the repository itself contains the static site).
6. Deploy.

### Vercel CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

`vercel.json` supplies security headers, caching rules, clean URLs, and trailing-slash behavior. No environment variables or server-side services are required.

## Production notes

- Progress is stored in the browser's `localStorage` under `ccna-hub-v1`. Clearing site data or changing browsers/devices does not preserve it.
- The site loads fonts from Google Fonts. If you need a fully self-hosted or stricter privacy deployment, download those font files and update the stylesheet and Content Security Policy.
- The application is a hash-routed single page (`/#home`, `/#quiz`, and so on), so direct navigation does not require rewrite rules.
- Vercel Preview Deployments should be checked before promoting changes to production.

## Project structure

```text
index.html          Application shell, styles, and client-side logic
data/               Outline, questions, cards, resources, and coverage
lessons/            HTML lesson fragments loaded by the application
scripts/validate.mjs Dependency-free production validation
vercel.json         Vercel headers and static-hosting configuration
```

## License

See [LICENSE](LICENSE).

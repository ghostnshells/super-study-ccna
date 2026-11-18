import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import vm from "node:vm";

const errors = [];
const requiredFiles = [
  "index.html",
  "vercel.json",
  "site.webmanifest",
  "icon.svg",
  "robots.txt",
  ...Array.from({ length: 7 }, (_, index) => `lessons/d${index}.html`),
  ...["outline", "questions", "cards", "resources", "coverage", "path"].map(name => `data/${name}.json`),
];

function fail(message) {
  errors.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

async function loadJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    fail(`${path}: ${error.message}`);
    return null;
  }
}

function uniqueIds(items, label) {
  const seen = new Set();
  for (const item of items) {
    assert(item && typeof item.id === "string" && item.id.length > 0, `${label}: item has no string id`);
    if (!item?.id) continue;
    assert(!seen.has(item.id), `${label}: duplicate id ${item.id}`);
    seen.add(item.id);
  }
  return seen;
}

for (const path of requiredFiles) {
  try {
    await access(path, constants.R_OK);
  } catch {
    fail(`${path}: required file is missing or unreadable`);
  }
}

const [outline, questions, cards, resources, coverage, path, manifest, vercel] = await Promise.all([
  loadJson("data/outline.json"),
  loadJson("data/questions.json"),
  loadJson("data/cards.json"),
  loadJson("data/resources.json"),
  loadJson("data/coverage.json"),
  loadJson("data/path.json"),
  loadJson("site.webmanifest"),
  loadJson("vercel.json"),
]);

if (outline && questions && cards && resources && coverage) {
  assert(Array.isArray(outline.domains) && outline.domains.length === 6, "outline: expected six domains");
  assert(outline.domains.reduce((sum, domain) => sum + domain.weight, 0) === 100, "outline: domain weights must total 100");

  const domains = new Set(outline.domains.map(domain => domain.id));
  const topicIds = new Set();
  const topLevelIds = new Set();
  for (const domain of outline.domains) {
    assert(Number.isInteger(domain.id) && domain.id >= 1 && domain.id <= 6, `outline: invalid domain ${domain.id}`);
    assert(Array.isArray(domain.topics), `outline: domain ${domain.id} has no topics array`);
    for (const topic of domain.topics || []) {
      assert(!topicIds.has(topic.id), `outline: duplicate topic ${topic.id}`);
      topicIds.add(topic.id);
      topLevelIds.add(topic.id);
      assert(topic.id.startsWith(`${domain.id}.`), `outline: topic ${topic.id} is in the wrong domain`);
      for (const sub of topic.subs || []) {
        assert(Array.isArray(sub) && sub.length === 2, `outline: malformed subtopic under ${topic.id}`);
        if (!Array.isArray(sub)) continue;
        assert(!topicIds.has(sub[0]), `outline: duplicate topic ${sub[0]}`);
        topicIds.add(sub[0]);
        assert(sub[0].startsWith(`${topic.id}.`), `outline: subtopic ${sub[0]} has the wrong parent`);
      }
    }
  }

  // Learning path: every top-level outline topic (plus the 1.0 foundations and the primers) is taught
  // exactly once, and every prerequisite is taught before the lesson that needs it.
  if (path) {
    const primerIds = new Set((path.primers || []).map(primer => primer.id));
    const lessonIds = new Set([...topLevelIds, "1.0", ...primerIds]);
    const seenSteps = new Set();
    const primerLesson = await readFile("lessons/d0.html", "utf8");
    for (const id of primerIds) assert(primerLesson.includes(`id="t-${id.replace(".", "-")}"`), `lessons/d0.html: primer ${id} has no section`);
    let lastUnit = -1;
    for (const unit of path.units || []) {
      assert(Number.isInteger(unit.n) && unit.n > lastUnit, `path: units must be numbered in increasing order (unit ${unit.n})`);
      lastUnit = unit.n;
      for (const field of ["title", "question", "why", "model", "practice"]) assert(typeof unit[field] === "string" && unit[field].length > 0, `path: unit ${unit.n} has no ${field}`);
      assert(Array.isArray(unit.goals) && unit.goals.length > 0, `path: unit ${unit.n} has no goals`);
      assert(typeof unit.hours === "number" && unit.hours > 0, `path: unit ${unit.n} has no hour estimate`);
      for (const step of unit.steps || []) {
        assert(lessonIds.has(step.t), `path: unit ${unit.n} references unknown lesson ${step.t}`);
        assert(!seenSteps.has(step.t), `path: lesson ${step.t} appears more than once`);
        for (const field of ["why", "analogy", "explain"]) assert(typeof step[field] === "string" && step[field].length > 0, `path: lesson ${step.t} has no ${field}`);
        for (const field of ["warmup", "focus", "later", "needs"]) assert(Array.isArray(step[field]), `path: lesson ${step.t} has no ${field} list`);
        assert((step.focus || []).length > 0, `path: lesson ${step.t} has no first-pass focus`);
        for (const pair of step.warmup || []) assert(Array.isArray(pair) && pair.length === 2 && pair.every(x => typeof x === "string" && x), `path: lesson ${step.t} has a malformed warm-up question`);
        for (const need of step.needs || []) assert(seenSteps.has(need), `path: lesson ${step.t} needs ${need}, which is not taught earlier`);
        seenSteps.add(step.t);
      }
    }
    for (const id of lessonIds) assert(seenSteps.has(id), `path: lesson ${id} is not in the learning path`);
  }

  const questionIds = uniqueIds(questions, "questions");
  const allowedTypes = new Set(["single", "multi", "order", "match", "input"]);
  for (const question of questions) {
    assert(domains.has(question.domain), `question ${question.id}: invalid domain ${question.domain}`);
    assert(["quiz", "exam"].includes(question.pool), `question ${question.id}: invalid pool ${question.pool}`);
    assert(allowedTypes.has(question.type), `question ${question.id}: invalid type ${question.type}`);
    assert(Array.isArray(question.topics) && question.topics.length > 0, `question ${question.id}: no topics`);
    for (const topic of question.topics || []) assert(topicIds.has(topic), `question ${question.id}: unknown topic ${topic}`);

    if (["single", "multi"].includes(question.type)) {
      assert(Array.isArray(question.choices) && question.choices.length >= 2, `question ${question.id}: choices are missing`);
      assert(Array.isArray(question.answer) && question.answer.length >= 1, `question ${question.id}: answers are missing`);
      if (question.type === "single") assert(question.answer?.length === 1, `question ${question.id}: single choice must have one answer`);
      for (const answer of question.answer || []) {
        assert(Number.isInteger(answer) && answer >= 0 && answer < question.choices.length, `question ${question.id}: answer index ${answer} is out of range`);
      }
    } else if (question.type === "order") {
      assert(Array.isArray(question.items) && question.items.length >= 2, `question ${question.id}: order items are missing`);
    } else if (question.type === "match") {
      assert(Array.isArray(question.pairs) && question.pairs.length >= 2, `question ${question.id}: match pairs are missing`);
      for (const pair of question.pairs || []) assert(Array.isArray(pair) && pair.length === 2, `question ${question.id}: malformed match pair`);
    } else if (question.type === "input") {
      assert(Array.isArray(question.accept) && question.accept.length >= 1, `question ${question.id}: accepted answers are missing`);
    }
  }
  assert(questionIds.size === questions.length, "questions: IDs are not unique");
  assert(questions.filter(question => question.pool === "exam" && question.form === "A").length === 100, "questions: exam form A must contain 100 questions");
  assert(questions.filter(question => question.pool === "exam" && question.form === "B").length === 100, "questions: exam form B must contain 100 questions");

  uniqueIds(cards, "cards");
  for (const card of cards) {
    assert(domains.has(card.domain), `card ${card.id}: invalid domain ${card.domain}`);
    assert(typeof card.front === "string" && typeof card.back === "string", `card ${card.id}: front/back is missing`);
    for (const topic of card.topics || []) assert(topicIds.has(topic), `card ${card.id}: unknown topic ${topic}`);
  }

  uniqueIds(resources, "resources");
  for (const resource of resources) {
    try {
      const url = new URL(resource.url);
      assert(url.protocol === "https:", `resource ${resource.id}: URL must use HTTPS`);
    } catch {
      fail(`resource ${resource.id}: invalid URL`);
    }
    for (const domain of resource.domains || []) assert(domains.has(domain), `resource ${resource.id}: invalid domain ${domain}`);
    for (const topic of resource.topics || []) assert(topicIds.has(topic), `resource ${resource.id}: unknown topic ${topic}`);
  }

  const coverageIds = uniqueIds(coverage, "coverage");
  for (const topic of topicIds) assert(coverageIds.has(topic), `coverage: missing topic ${topic}`);
  for (const row of coverage) assert(topicIds.has(row.id), `coverage: unknown topic ${row.id}`);

  for (const domain of outline.domains) {
    const lessonPath = `lessons/d${domain.id}.html`;
    const lesson = await readFile(lessonPath, "utf8");
    assert(/<section\b[^>]*class="[^"]*topic/.test(lesson), `${lessonPath}: no topic sections found`);
    for (const topic of domain.topics) {
      const escaped = topic.id.replaceAll(".", "\\.");
      assert(new RegExp(`data-topics="[^"]*${escaped}(?:,|"|\\s)`).test(lesson), `${lessonPath}: top-level topic ${topic.id} is not represented`);
    }
  }
}

try {
  const html = await readFile("index.html", "utf8");
  assert(/^<!doctype html>/i.test(html), "index.html: missing doctype");
  assert(/<html\s+lang="en">/i.test(html), "index.html: missing language");
  assert(/<meta\s+name="description"/i.test(html), "index.html: missing description metadata");
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  assert(scripts.length === 1, "index.html: expected one inline application script");
  for (const [, source] of scripts) new vm.Script(source, { filename: "index.html inline script" });
} catch (error) {
  fail(`index.html: ${error.message}`);
}

if (manifest) {
  assert(manifest.start_url === "/#home", "site.webmanifest: unexpected start_url");
  assert(Array.isArray(manifest.icons) && manifest.icons.length > 0, "site.webmanifest: no icons configured");
}

if (vercel) {
  assert(vercel.buildCommand === "npm run build", "vercel.json: unexpected build command");
  assert(vercel.outputDirectory === "dist", "vercel.json: outputDirectory must be dist");
  assert(Array.isArray(vercel.headers) && vercel.headers.length > 0, "vercel.json: no headers configured");
  const headers = vercel.headers.flatMap(rule => rule.headers || []).map(header => header.key.toLowerCase());
  for (const name of ["content-security-policy", "referrer-policy", "x-content-type-options"]) {
    assert(headers.includes(name), `vercel.json: missing ${name} header`);
  }
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} error${errors.length === 1 ? "" : "s"}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation passed: ${path?.units?.reduce((n, unit) => n + unit.steps.length, 0) ?? 0} path lessons, ${questions?.length ?? 0} questions, ${cards?.length ?? 0} cards, ${resources?.length ?? 0} resources, ${coverage?.length ?? 0} coverage rows.`);

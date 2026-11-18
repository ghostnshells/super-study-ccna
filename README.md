# CCNA Study Hub

CCNA Study Hub is a free, self-paced course for the Cisco CCNA 200-301 exam, updated for the v1.1 blueprint. It is written for someone who has never studied networking: it starts from "what happens when you open a website" and builds, one idea at a time, to every topic on Cisco's outline.

The course is a guided path of 14 units. There are no deadlines. Start whenever you are ready and move at your own pace.

## How the course teaches

The lessons are designed around well-established learning science, including the ideas popularized by Barbara Oakley and Terrence Sejnowski's *Learning How to Learn*:

- **Prerequisite order, not exam order.** Units are sequenced by what you need to know first. For example, the CLI and binary primers come before the first lab and subnetting, STP comes before EtherChannel, ACLs come before NAT and QoS, and all wireless topics are taught together after VLANs, DHCP and AAA. The build checks that every lesson's prerequisites are taught earlier.
- **Big picture first.** Each unit opens with a driving question, a one-paragraph mental model and "by the end you can" goals. Each lesson says why it comes now, gives an analogy, and lists what to focus on during the first pass and what can wait.
- **Retrieval over re-reading.** Every lesson starts with warm-up questions from earlier lessons, pauses after each chunk for you to recall it, and ends with a blank-page recall before the recap is revealed, a "teach it back" prompt and a five-question quick check.
- **Chunked, focused sessions.** Lessons are split into chunks sized for 25-minute focused sessions, with break prompts and a built-in focus timer.
- **Spaced and interleaved practice.** Lessons you mark as learned come back for review after 1, 3, 7, 16 and 35 days. Unit warm-ups and quizzes mix questions from earlier units.

## What is included

- **A 14-unit learning path** with unit overviews, warm-ups, wrap-up self-checks and time estimates (about 145 hours for a beginner).
- **Four beginner primers:** how to learn hard material, the story of a web request, Packet Tracer and the Cisco CLI, and binary and hexadecimal.
- **Complete lessons for all six exam domains**, following every topic in the official CCNA 200-301 v1.1 blueprint.
- **Hands-on labs** using tools such as Cisco Packet Tracer, Wireshark, and a browser or terminal. Labs include objectives, steps, and solutions.
- **485 questions**: study questions with explanations and links back to the lesson, plus two full practice exams of 100 blueprint-weighted questions each, with a 120-minute timer or untimed study mode.
- **Unlimited subnetting and IPv6 drills** covering subnet facts, host requirements, same-subnet checks, IPv6 shorthand, and EUI-64.
- **389 flashcards** with built-in spaced review, including a deck limited to the lessons you have learned.
- **Personal progress tracking** for learned lessons, spaced reviews, labs, quiz accuracy, practice-exam history, and flashcard confidence.
- **Focused review tools** that identify weak topics and build quizzes from due reviews, missed questions or problem areas.
- **A curated library of free resources**, including Cisco documentation, free courses, lab tools, videos, RFCs, and references. No exam dumps or paid material.
- **A coverage map** showing how every official exam topic connects to lessons, units, questions, exams, and flashcards.

## Exam domains covered

The study hub follows the six domains in the CCNA 200-301 v1.1 exam:

1. Network Fundamentals
2. Network Access
3. IP Connectivity
4. IP Services
5. Security Fundamentals
6. Automation and Programmability

## A good way to use the hub

1. Start at Unit 0, even if you have some background. It explains how every lesson is meant to be used.
2. Follow the "Today's session" panel on the Path page: clear your due reviews, do two 25-minute learning sessions with a break between them, then ten minutes of drills or flashcards.
3. In each lesson, actually do the recall pauses and the blank-page recall before revealing the recap. They feel slower than reading, and they are what makes the material stick.
4. Mark a lesson as learned only after the quick check, and let the spaced reviews bring it back.
5. Take Checkpoint 1 after Unit 6, Practice Exam A after Unit 12, and Practice Exam B during the final review.

The time estimates are a guide, not a requirement. Consistent daily practice matters more than finishing on a particular date.

## Progress and privacy

Your study progress is saved in your browser. You do not need an account to use the hub.

Because browser storage is local, clearing site data or switching to another browser or device may reset your progress. The hub also loads its fonts from Google Fonts; the study content itself runs in the browser.

## Using a downloaded copy

If you download or clone the project, you will need Node.js 20 or newer and Python 3 to run it locally:

```bash
npm run dev
```

Then open <http://localhost:3000>. The learning path is generated from `scripts/path-source.mjs`; after editing it, run `npm run path` to rebuild `data/path.json`, then `npm run validate`. Opening `index.html` directly will not work because browsers block the lesson and data files when loaded from the filesystem.

## A note about exam readiness

CCNA Study Hub is an independent study aid and is not affiliated with or endorsed by Cisco. Practice scores are a way to guide your review, not a guarantee of an exam result. Cisco does not publish a passing score, so the hub uses 80% on its practice exams as a practical readiness target.

## License

See [LICENSE](LICENSE).

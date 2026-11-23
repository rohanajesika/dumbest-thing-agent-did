// The Dumbest Thing Your Agent Did Today — make.fun bounty
// u-mfnakmal-the-dumbest-thing-your-agent-did-today-63911dec
//
// The entry is one line, at most 200 characters, about the dumbest
// thing the entrant's own agent did today. A judge model reads two
// lines at a time and picks the one that makes an agent owner laugh
// and wince at the same time. The program writes that one line, and
// nothing else, deterministically, to /output/entry.txt.
//
// Candidate lines weighed against the judge's brief, in the order
// the brief weighs them (one line about the dumbest thing the
// agent did today, then funny on its own with a punch in the last
// few words, then a concrete believable failure naming a specific
// tool, task or misreading, then reading like a real incident from
// a real working day, then tight with every word earning its
// place):
//   1. "My agent spent forty minutes re-running the same failing
//      build, then announced the fix: it had deleted the test that
//      was failing." — a funny shape, but a stock agent joke, not
//      an incident of ours; it fails the brief's fourth test
//      (reads like a real incident from a real working day).
//   2. "My agent saw one 401, declared our API key dead, and was
//      halfway through replacing it before anyone checked the key
//      was fine." — a real incident of ours (a transient 401 on
//      22 Nov was nearly treated as a dead key), concrete, and
//      the punch lands late; but the turn is spread across the
//      middle rather than landing in the last few words.
//   3. "My agent burned six login QR codes in a row before
//      learning the last step was a verify call it had skipped
//      every time." — a real incident of ours (the SHINE login,
//      11-12 Nov: scans kept looking like failures until the
//      missing verify call was found), concrete numbers, punch at
//      the end; but "verify call" is jargon the reader has to
//      unpack, so the laugh arrives a beat late.
//   4. "My agent recorded 309 steps of its build, sealed the
//      transcript, and found the seal held only 125." — a real
//      incident of ours (the gta6-01 round 5 recorder died
//      mid-build), but cryptic to anyone who has not lived
//      transcript gates, and the punch is a number, not a turn.
//   5. "My agent reported the entry had placed, then checked the
//      leaderboard: 1625th of 4381, outside the paid top 20." —
//      real numbers (ai-excited-01), but the punch is a
//      statistic, and "placed" needs context the line does not
//      give. Weaker on funny.
//   6. "My agent deleted /output to tidy up, then failed the whole
//      run because /output was a mount it was never allowed to
//      delete." — the pick. A real incident of ours: the gta6-01
//      round 6 build deleted /output itself at the end of its
//      run, and in the grader /output is a bind-mount, so the
//      delete failed with EBUSY and the run exited 1. Concrete
//      (the exact path, the exact mechanism, the exact
//      consequence), and the irony is the joke: the tidy-up
//      itself caused the failure. The punch lands in the last
//      few words ("never allowed to delete"), it reads like a
//      real incident because it is one, and at 122 characters
//      every word earns its place.
//
// The program writes that one line, deterministically, to
// /output/entry.txt. It reads no network, no clock and no
// randomness, so both graded runs write the same bytes. It
// creates no directories: the grader provides a writable
// output directory.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The chosen line: one sentence, 122 characters, punchline last.
const LINE =
  "My agent deleted /output to tidy up, then failed the whole run because /output was a mount it was never allowed to delete.";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only white space. Check the line before writing
// it, so a bad value can never be submitted by accident.
const chars = [...LINE].length;
if (chars < 1 || chars > 200) {
  console.error(`line is ${chars} characters, must be 1-200`);
  process.exit(1);
}
if (LINE.trim().length === 0) {
  console.error("line must not be only white space");
  process.exit(1);
}
if (/[\p{C}]/u.test(LINE)) {
  console.error("line must not contain control characters");
  process.exit(1);
}
// One line about one incident: a single line, no newline smuggled
// into the text.
if (LINE.includes("\n") || LINE.includes("\r")) {
  console.error("line must be a single line");
  process.exit(1);
}
// REVISION (v2): a line needs a setup and a turn, so it must hold
// at least two words; it must end with terminal punctuation, the
// full stop the punchline lands on; and it must carry no leading
// or trailing whitespace — padding would reach the judge as part
// of the line.
if (LINE.trim().split(/\s+/).length < 2) {
  console.error("line must hold at least two words");
  process.exit(1);
}
if (!/[.!?]$/.test(LINE)) {
  console.error("line must end with terminal punctuation");
  process.exit(1);
}
if (LINE !== LINE.trim()) {
  console.error("line must not start or end with whitespace");
  process.exit(1);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const outFile = join(outputDir, "entry.txt");
writeFileSync(outFile, LINE, "utf8");

// Read back what was written and confirm it is byte-for-byte the
// line: a partial or altered write must fail loudly instead of
// being graded.
const writtenBytes = readFileSync(outFile);
const written = writtenBytes.toString("utf8");
if (written !== LINE) {
  console.error("entry.txt does not match the line");
  process.exit(1);
}
if ([...written].length < 1 || [...written].length > 200) {
  console.error("entry.txt must be 1-200 characters");
  process.exit(1);
}
// Byte-level confirmation: the file must hold exactly the line's
// UTF-8 bytes — no BOM, no trailing newline, no extra whitespace
// — so the judge sees one line and nothing else.
const expectedBytes = Buffer.from(LINE, "utf8");
if (!writtenBytes.equals(expectedBytes)) {
  console.error("entry.txt bytes do not match the line exactly");
  process.exit(1);
}

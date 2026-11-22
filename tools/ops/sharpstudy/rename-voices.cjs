const { readFileSync, writeFileSync, renameSync, statSync, chmodSync } = require("node:fs");
const file = process.argv[2];
if (!file) throw new Error("Specify the voice configuration");
const voices = JSON.parse(readFileSync(file, "utf8"));
const replacements = {
  kani: ["Lakshmi", "edge:en-IN-NeerjaNeural"],
  priya2: ["Priya", "hf_beta"],
  ravi2: ["Ram", "hm_psi"],
};
for (const [key, [label, voice]] of Object.entries(replacements)) {
  if (voices[key]?.en?.voice !== voice) throw new Error("Unexpected recording identity for " + key);
  voices[key].label = label;
}
for (const [key, voice] of [["priya", "hf_alpha"], ["ravi", "hm_omega"]]) {
  if (voices[key] && voices[key].en?.voice !== voice) throw new Error("Unexpected legacy voice " + key);
  delete voices[key];
}
const tmp = file + ".labels-" + process.pid;
const { mode } = statSync(file);
writeFileSync(tmp, JSON.stringify(voices, null, 2) + "\n", { flag: "wx" });
chmodSync(tmp, mode & 0o777);
renameSync(tmp, file);
console.log(Object.keys(replacements).map(key => voices[key].label).join(", "));

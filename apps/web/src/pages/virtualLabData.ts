export type LabId = "transformer" | "indicator";
export const narration = {
  "tx-start": "Start with alternating current. Watch the two coils. They are separate circuits, linked by a changing magnetic field.",
  "tx-turns": "Keep the input steady and change the number of turns on the secondary coil. Compare the input and output voltages, then switch to direct current.",
  "tx-equal": "Both coils have the same number of turns, so the ideal output voltage equals the input voltage.",
  "tx-up": "The secondary has more turns, so the ideal output voltage is higher. A transformer does not create extra power.",
  "tx-down": "The secondary has fewer turns, so the ideal output voltage is lower. That is called stepping down the voltage.",
  "tx-dc": "Steady direct current creates a steady magnetic field. Once the current settles, the field no longer changes, so the secondary has no sustained voltage.",
  "ph-start": "Choose a virtual sample and predict whether it is acidic, neutral, or basic. Add the indicator to check your prediction.",
  "ph-dilute": "Use the dilution slider and compare the reading. In this simplified model, adding water moves an acidic or basic sample towards neutral.",
  "ph-acid": "Lemon juice is acidic. Its pH is below seven. Try adding water and see which way the number moves.",
  "ph-neutral": "The model water sample is neutral. Its pH is seven, midway between acids and bases on this scale.",
  "ph-base": "The model soap solution is basic. Its pH is above seven. Diluting it with water brings the reading closer to neutral.",
};
export type VoiceCue = keyof typeof narration;
export const labs: { id: LabId; title: string; subject: string; description: string; level: string; guides: { title: string; cue: VoiceCue }[] }[] = [
  { id: "transformer", title: "Transformer playground", subject: "physics", description: "Change coil turns and see how AC voltage responds.", level: "Senior secondary · Concept preview", guides: [{ title: "Start with AC", cue: "tx-start" }, { title: "Change one variable", cue: "tx-turns" }] },
  { id: "indicator", title: "Colour and pH", subject: "chemistry", description: "Compare acids, bases and a neutral sample using a virtual indicator.", level: "Class 10 · CBSE practical companion", guides: [{ title: "Predict and test", cue: "ph-start" }, { title: "Try dilution", cue: "ph-dilute" }] },
];
export function transformer(ac: boolean, volts: number, primary: number, secondary: number): number {
  return ac ? volts * secondary / primary : 0;
}
export function nominalPh(ph: number, dilution: number): number {
  if (ph === 7) return 7;
  const deviation = Math.abs(ph - 7);
  return 7 + Math.sign(ph - 7) * Math.max(0, deviation + Math.log10(1 - dilution / 100));
}

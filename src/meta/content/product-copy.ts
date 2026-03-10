export const PRODUCT_COPY = {
  start: {
    title: "Tap Fast, Flip Fate",
    subtitle: "Pressure spikes can unlock clutch twists. Risky choices create bigger comebacks.",
    primaryCta: "Start Round",
    secondaryCta: "How Comeback Works",
    coreRules: [
      "Tap only free tiles (not blocked).",
      "Match 3 identical tiles in tray.",
      "Tray at 7 loses. Clear all tiles to win.",
    ],
    metaHints: [
      "Pressure spikes unlock Chaos Twist.",
      "Rescue cards can rewind, clear, or add +1 slot.",
      "Undo fixes one tap. Cards decide clutch rounds.",
    ],
  },
  result: {
    win: [
      "Clean finish. You turned pressure into tempo.",
      "Clutch clear. That comeback chain was real.",
      "Win secured. Queue one more while your timing is hot.",
    ],
    lose: [
      "One slot away. A sharper twist choice can flip this.",
      "Loss recorded. Your rescue timing was close.",
      "You built heat but dropped the closer. Run it back.",
    ],
    comeback: [
      "You survived red pressure and still closed it out.",
      "Chaos worked for you this time. Chase a longer chain.",
      "Last-slot save landed. This is worth another run.",
    ],
    nextSteps: {
      winHasNext: "Push into the next level while your timing is still warm.",
      winNoNext: "You cleared all current levels. Replay for cleaner tempo and fewer taps.",
      lose: "Run it back and spend rescue tools one beat earlier.",
    },
  },
  share: {
    titleTemplates: [
      "I hit a {comebackChain}x comeback chain. Beat that?",
      "My pressure meter maxed and I still won. Your turn.",
      "I took the fake-safe twist and survived. Can you?",
    ],
    description: "Mobile H5 speed run. One tap can rescue or ruin the round.",
    cta: "Open challenge now",
  },
} as const;

export const PRODUCT_COPY = {
  start: {
    title: "Tap Fast, Flip Fate",
    subtitle: "Pressure spikes can unlock clutch twists. Risky choices create bigger comebacks.",
    primaryCta: "Start Round",
    secondaryCta: "How Comeback Works",
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

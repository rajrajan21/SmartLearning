const topic = { board: "cbse", classLevel: 6, subject: "science", chapter: "exploring-magnets", topic: "magnetic-and-non-magnetic" };
const chapterHref = "/cbse/6/science/exploring-magnets";
export const sample = {
  ...topic, chapterHref, href: "/classroom" + chapterHref + "/" + topic.topic + "?sample",
  title: { en: "Magnetic and non-magnetic things", ta: "காந்தம் மற்றும் காந்தமில்லாப் பொருட்கள்" },
};
export function matchesSample(item: typeof topic) {
  return item.board.toLowerCase() === topic.board && item.classLevel === topic.classLevel &&
    item.subject === topic.subject && item.chapter === topic.chapter && item.topic === topic.topic;
}

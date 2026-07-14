// Total number of islands in the journey (Hero, About, Skills, Projects,
// Timeline, Achievement, Experience, Blog, Contact = 9 so far per the plan).
// Bump this as islands are added in later content phases — it only affects
// how much scroll distance exists, not anything visual by itself.
export const TOTAL_ISLANDS = 9;

export function ScrollSpacer() {
  return (
    <div
      aria-hidden
      style={{ height: `${TOTAL_ISLANDS * 100}vh`, width: '1px' }}
    />
  );
}

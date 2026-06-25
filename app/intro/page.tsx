import Link from "next/link";

export default function IntroPage() {
  return (
    <main className="standalone-page">
      <p className="eyebrow">Human Technology Tree</p>
      <h1>Knowledge is easier to navigate when its dependencies are visible.</h1>
      <p>
        This project maps foundational ideas, the concepts they unlock, and reliable references
        for learning more. The initial slice focuses on machine learning and its mathematical and
        computing foundations.
      </p>
      <Link className="primary-link" href="/">
        Explore the tree
      </Link>
    </main>
  );
}

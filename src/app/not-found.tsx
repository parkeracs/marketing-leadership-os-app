import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ maxWidth: 520, padding: "12vh 24px" }}>
      <h1 className="page-title">Not found</h1>
      <p className="lede">That page doesn&rsquo;t exist, or it has moved in the vault.</p>
      <Link href="/">Back to home</Link>
    </div>
  );
}

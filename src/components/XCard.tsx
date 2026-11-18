import Link from "next/link";
import { Icon } from "./Icons";

/** An expandable card: collapsed by default, so long pages stay scannable. */
export function XCard({
  title,
  kicker,
  sub,
  meta,
  href,
  openLabel = "Open",
  children,
}: {
  title: string;
  kicker?: string;
  sub?: string;
  meta?: string;
  href: string;
  openLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <details className="xcard">
      <summary>
        <div>
          {kicker && <p className="kicker">{kicker}</p>}
          <h3 className="card-title">{title}</h3>
          {sub && <p className="sub">{sub}</p>}
          {meta && <p className="xmeta">{meta}</p>}
        </div>
        <Icon name="chevron" size={20} className="chev" />
      </summary>
      <div className="xbody">
        {children ? <div className="xcontent">{children}</div> : null}
        <Link href={href} className="open-link">
          {openLabel} <Icon name="chevron" size={15} />
        </Link>
      </div>
    </details>
  );
}

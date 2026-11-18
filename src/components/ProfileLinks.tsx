import { Icon } from "./Icons";
import type { LinkKey } from "@/lib/vault";

const LABEL: Record<LinkKey, string> = {
  website: "Website",
  newsletter: "Newsletter",
  podcast: "Podcast",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  x: "X",
};

export function ProfileLinks({ links }: { links: { key: LinkKey; href: string }[] }) {
  if (!links.length) return null;
  return (
    <div className="profile-links">
      {links.map((l) => (
        <a key={l.key} href={l.href} target="_blank" rel="noreferrer">
          <Icon name={l.key} size={16} />
          {LABEL[l.key]}
        </a>
      ))}
    </div>
  );
}

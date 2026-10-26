import type { ReactNode } from "react";

export type NombreIcono =
  | "search"
  | "bag"
  | "menu"
  | "close"
  | "arrow"
  | "plus"
  | "minus"
  | "trash"
  | "heart"
  | "whatsapp"
  | "user"
  | "filter"
  | "check"
  | "edit"
  | "eye";

const trazos: Record<NombreIcono, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 13H6L5 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" />,
  heart: (
    <path d="M20.8 8.5c0 5.2-8.8 10.5-8.8 10.5S3.2 13.7 3.2 8.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8.8 1.5Z" />
  ),
  whatsapp: (
    <>
      <path d="M20 11.5a8 8 0 0 1-11.8 7l-4.2 1 1.1-4A8 8 0 1 1 20 11.5Z" />
      <path d="M8.5 8.5c.7 3 2 4.3 5 5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  filter: <path d="M4 5h16M7 12h10M10 19h4" />,
  check: <path d="m5 12 4 4L19 6" />,
  edit: <path d="m4 20 4-1 11-11-3-3L5 16l-1 4ZM14 7l3 3" />,
  eye: (
    <>
      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
};

export default function Icono({
  name,
  size = 20,
}: {
  name: NombreIcono;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {trazos[name]}
    </svg>
  );
}

// Aliases de retrocompatibilidad
export const Icon = Icono;
export type IconName = NombreIcono;

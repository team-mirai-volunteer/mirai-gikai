import { Facebook, Instagram, Youtube } from "lucide-react";

const sizeProps = {
  strokeWidth: 1.6,
};

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M4 4L20 20M20 4L4 20"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const footerIcons = {
  x: (props: React.SVGProps<SVGSVGElement>) => <XIcon {...props} />,
  facebook: (props: React.SVGProps<SVGSVGElement>) => (
    <Facebook {...sizeProps} {...props} />
  ),
  instagram: (props: React.SVGProps<SVGSVGElement>) => (
    <Instagram {...sizeProps} {...props} />
  ),
  youtube: (props: React.SVGProps<SVGSVGElement>) => (
    <Youtube {...sizeProps} {...props} />
  ),
} satisfies Record<
  string,
  (props: React.SVGProps<SVGSVGElement>) => JSX.Element
>;

export type FooterIconId = keyof typeof footerIcons;


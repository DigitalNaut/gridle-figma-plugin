import { Icon } from "~/types";

export default function AxisIcon({ className }: Icon) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="3" rx="1.5" fill="currentColor" />
      <rect x="3" y="10" width="18" height="3" rx="1.5" fill="currentColor" />
      <rect x="3" y="17" width="18" height="3" rx="1.5" fill="currentColor" />
    </svg>
  );
}

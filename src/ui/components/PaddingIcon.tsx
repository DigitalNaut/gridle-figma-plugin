import { Icon } from "~/types";

export default function PaddingIcon({ className }: Icon) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5 4H4V8H20V4H19V7H5V4Z"
        fill="currentColor"
      />
      <rect x="7" y="11" width="10" height="2" rx="1" fill="currentColor" />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M20 16H4V20H5V17H19V20H20V16Z"
        fill="currentColor"
      />
    </svg>
  );
}

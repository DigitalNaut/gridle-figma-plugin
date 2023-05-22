export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="10" height="10" fill="currentColor" fillOpacity="0.82" />
      <rect
        x="11"
        width="10"
        height="10"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <rect
        y="11"
        width="10"
        height="10"
        fill="currentColor"
        fillOpacity="0.45"
      />
      <rect
        x="11"
        y="11"
        width="10"
        height="10"
        fill="currentColor"
        fillOpacity="0.7"
      />
    </svg>
  );
}

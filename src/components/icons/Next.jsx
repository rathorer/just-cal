const NextIcon = ({ className = "w-6 h-6" }) => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    className={"icon " + className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 18l6-6-6-6"
    />
  </svg>
);
export default NextIcon;
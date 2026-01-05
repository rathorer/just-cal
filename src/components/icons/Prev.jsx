const PrevIcon = ({ className = "w-6 h-6" }) => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    className={"icon " + className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15 18l-6-6 6-6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} />
  </svg>
);
export default PrevIcon;
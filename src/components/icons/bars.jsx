function BarsIcon({ className = "w-7 h-7" }) {
  return (
    <svg 
      className={`${className} text-inherit`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24" 
      height="24" 
      fill="none"
      viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  );
}

export default BarsIcon;
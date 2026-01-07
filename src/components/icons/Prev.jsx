const PrevIcon = ({ className = "w-7 h-7", title = "Prev" }) => (
  // <svg
  //   fill="none"
  //   stroke="currentColor"
  //   viewBox="0 0 24 24"
  //   className={"icon " + className}
  //   xmlns="http://www.w3.org/2000/svg"
  // >
  //   <title>{title}</title>
  //   <path d="M15 18l-6-6 6-6" 
  //       strokeLinecap="round" 
  //       strokeLinejoin="round" 
  //       strokeWidth={2} />
  // </svg>
  <svg className={"icon "+ className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
</svg>

);
export default PrevIcon;
const NextIcon = ({ className = "w-7 h-7", title = "Next" }) => (
  // <svg
  //   fill="none"
  //   stroke="currentColor"
  //   viewBox="0 0 24 24"
  //   className={"icon " + className}
  //   xmlns="http://www.w3.org/2000/svg"
  // >
  //   <title>{title}</title>
  //   <path
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //       strokeWidth={2}
  //       d="M9 18l6-6-6-6"
  //   />
  // </svg>

  <svg 
    className={"icon "+ className} 
    aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <title>{title}</title>
  <path stroke="currentColor" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
</svg>

);
export default NextIcon;
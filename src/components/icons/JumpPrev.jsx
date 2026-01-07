const JumpPrevIcon = ({ className = "w-7 h-7", title = "Jump Prev" }) => (

 <svg
    className={"icon "+ className}
    viewBox="0 0 0.24 0.24"
    stroke="currentColor"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    transform="matrix(-1,1.2246467991473532e-16,-1.2246467991473532e-16,-1,0,0)"
  >
    <title>{title}</title>
    <g fill="none" fillRule="evenodd">
      <path
        d="M.153.124.058.185A.005.005 0 0 1 .05.181V.059A.005.005 0 0 1 .058.055l.096.061a.005.005 0 0 1 0 .008ZM.19.05v.14"
        stroke="currentColor"
        strokeWidth={0.02}
        strokeLinecap="round"
      />
    </g>
  </svg>
);
export default JumpPrevIcon;

{/* <svg className={"icon "+ className} 
    aria-hidden="true" 
    xmlns="http://www.w3.org/2000/svg"
    fill="none" 
    viewBox="0 0 24 24">
  <title>{title}</title>
  <path stroke="currentColor" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    strokeWidth="2" d="M5 12h14M5 12l4-4m-4 4 4 4 M9 4H7a3 3 0 0 0-4 3v10a3 3 0 0 0 3 3h2"/>
</svg> */}

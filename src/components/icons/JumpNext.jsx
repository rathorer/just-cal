const JumpNextIcon = ({ className = "w-7 h-7", title = "Jump next" }) => (

  <svg
    className={"icon " + className}
    stroke="currentColor"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <title>{title}</title>
    <g id="Page-1" stroke="none" strokeWidth={2} fill="none" fillRule="evenodd">
      <g id="Next">
        <rect
          id="Rectangle"
          fillRule="nonzero"
          x={0}
          y={0}
          width={24}
          height={24}
        />
        <path
          d="M15.3371,12.4218 L5.76844,18.511 C5.43558,18.7228 5,18.4837 5,18.0892 L5,5.91084 C5,5.51629 5.43558,5.27718 5.76844,5.48901 L15.3371,11.5782 C15.6459,11.7746 15.6459,12.2254 15.3371,12.4218 Z"
          id="Path"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <line
          x1={19}
          y1={5}
          x2={19}
          y2={19}
          id="Path"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </g>
    </g>
  </svg>
);

export default JumpNextIcon;

{/* <svg className="w-8 h-8 text-gray-800 dark:text-white" 
    ariaHidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    strokeWidth="2" 
    d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
</svg> */}
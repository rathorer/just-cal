const HomeIcon = ({className = "h-5 w-5"}) => (
  <svg
    fill="#000000"
    viewBox="0 0 24 24"
    id="home"
    data-name="Line color"
    xmlns="http://www.w3.org/2000/svg"
    className={"icon line-color " + className}
  >
    <path
      id="primary"
      d="M9.7,21H5.83A.77.77,0,0,1,5,20.3V10m9.3,11h3.87a.77.77,0,0,0,.83-.7V10M14.3,21V14.1H9.7V21"
      style={{
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
      }}
    />
    <path
      id="secondary"
      d="M12,3,3,12m9-9,9,9"
      style={{
        fill: "none",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        stroke: "rgb(249, 94, 1)"//"rgb(198 76 6)", "rgb(44, 169, 188)",
      }}
    />
  </svg>
);
export default HomeIcon;

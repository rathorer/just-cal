const UndoIcon = function ({ className = "w-6 h-6" }) {
    return (<svg className={"icon " + className}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M3 9h13a5 5 0 0 1 0 10H7M3 9l4-4M3 9l4 4" />
    </svg>)
};

export default UndoIcon;

function JustCal({ className = "w-6 h-6" }) {
    //Pastel pink (#F6C2CF), lavender (#C9B7E9), light blue (#CFE6FA), periwinkle (#DCC7F2), soft background (#F5F6FA).
    return (
        <svg 
            width="128" height="128" 
            viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" 
            role="img" aria-label="just-cal minimal calendar logo">
            {/* <!-- Background (optional) --> */}
            <rect x="0" y="0" width="128" height="128" rx="24" fill="#F5F6FA" />

            {/* <!-- Calendar base --> */}
            <rect x="24" y="24" width="80" height="80" rx="16" fill="#EAEAF6" />
            {/* <!-- Binding rings --> */}
            <circle cx="44" cy="24" r="6" fill="#F6C2CF" />
            <circle cx="84" cy="24" r="6" fill="#F6C2CF" />
            {/* <!-- Header bar --> */}
            <rect x="24" y="24" width="80" height="22" rx="16" fill="#C9B7E9" />

            {/* <!-- Grid cells (2x2) --> */}
            <rect x="34" y="52" width="30" height="28" rx="8" fill="#F6C2CF" />
            <rect x="64" y="52" width="30" height="28" rx="8" fill="#CFE6FA" />
            <rect x="34" y="80" width="30" height="28" rx="8" fill="#CFE6FA" />
            <rect x="64" y="80" width="30" height="28" rx="8" fill="#DCC7F2" />
        </svg>
    );
}

export default JustCal

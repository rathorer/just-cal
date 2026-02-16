const MoreActions = ({
  actions
}) => {
  return (
    <div className="dropdown dropdown-end">
      <button
        title="More actions"
        className="btn btn-ghost btn-xs px-1 min-w-0 text-base-content/70 hover:text-base-content"
        aria-label="More options"
      >
        <svg className="w-5 h-5" aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeWidth="2"
            d="M6 12h.01m6 0h.01m5.99 0h.01" />
        </svg>
      </button>

      <ul
        tabIndex={0}
        className="dropdown-content menu menu-sm bg-base-100 shadow-lg border border-base-300 rounded-md w-48 z-[100]"
      >
        {actions.map((action, idx)=> 
          <li key={idx}>
            <button onClick={(e)=> action[1](e, idx)}>
              {action[0]}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default MoreActions;

const spray = (props: any) => {
    return (
        <svg
            width={props?.size || 16}
            height={props?.size || 16}
            viewBox="0 0 24 24"
            {...props}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g clip-path="url(#clip0_500_9121)">
                <path
                    d="M1.74753 13.8833C1.43993 12.7305 1.60221 11.5028 2.19876 10.4696C2.79531 9.4363 3.77739 8.68191 4.92951 8.37192L8.53362 7.4062C8.79301 7.32019 13.2985 5.76647 16.6887 0.927247C16.8523 0.693313 17.0793 0.51094 17.343 0.401549C17.6067 0.292159 17.8962 0.260295 18.1774 0.309701C18.4586 0.359108 18.7198 0.487731 18.9304 0.680463C19.141 0.873195 19.2923 1.12203 19.3664 1.39774L23.2487 15.8866C23.3225 16.1625 23.3161 16.4537 23.2302 16.726C23.1443 16.9984 22.9824 17.2405 22.7636 17.424C22.5448 17.6075 22.2781 17.7247 21.995 17.7619C21.7118 17.7991 21.424 17.7546 21.1652 17.6338C16.9762 15.6815 13.2034 15.8111 11.6286 15.9866L12.3983 18.859C12.4625 19.0977 12.4668 19.3485 12.4108 19.5893C12.3547 19.83 12.2401 20.0532 12.077 20.2389L11.2587 21.1696C11.1006 21.3497 10.9016 21.4893 10.6785 21.5767C10.4554 21.6641 10.2145 21.6967 9.97617 21.6719C9.73781 21.6471 9.50886 21.5656 9.3085 21.4341C9.10814 21.3026 8.9422 21.125 8.82457 20.9162L6.68236 17.1848C5.59941 17.3258 4.50208 17.0688 3.59439 16.4616C2.6867 15.8543 2.03041 14.9381 1.74753 13.8833ZM21.7981 16.2685L17.9175 1.78597C14.9121 6.07657 11.1646 7.96298 9.64596 8.5873L11.2348 14.5169C12.8613 14.3024 17.0486 14.0607 21.7981 16.2685ZM10.1294 20.1716L10.1321 20.1815L10.9503 19.2509L10.1567 16.2888L8.20066 16.8129L10.1294 20.1716ZM6.87065 15.6164L9.76843 14.8399L8.21552 9.04435L5.31774 9.82081C4.5492 10.0267 3.89395 10.5295 3.49612 11.2186C3.0983 11.9076 2.99049 12.7265 3.19642 13.495C3.40235 14.2636 3.90514 14.9188 4.5942 15.3167C5.28325 15.7145 6.10212 15.8223 6.87065 15.6164Z"
                    fill={props?.color || "currentColor"}
                    stroke={props?.color || "currentColor"}
                    strokeWidth="0.4"
                />
            </g>
            <defs>
                <clipPath id="clip0_500_9121">
                    <rect
                        width="24"
                        height="24"
                        fill="white"
                        transform="matrix(-1 0 0 1 24 0)"
                    />
                </clipPath>
            </defs>
        </svg>
    );
};

const transfer = (props: any) => {
    return (
        <svg
            width={props?.size || 16}
            height={props?.size || 16}
            viewBox="0 0 24 24"
            {...props}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                stroke={props?.color || "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9 9.50977L12 6.50977L15 9.50977"
                stroke={props?.color || "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 6.50977V14.5098"
                stroke={props?.color || "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M6 16.5098C9.89 17.8098 14.11 17.8098 18 16.5098"
                stroke={props?.color || "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

const swap = (props: any) => {
    return (
        <svg
            width={props?.size || 16}
            height={props?.size || 16}
            viewBox="0 0 24 24"
            {...props}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                stroke={props?.color || "currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10.18 17.1494L7.14001 14.1094"
                stroke={props?.color || "currentColor"}
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10.1801 6.84961V17.1496"
                stroke={props?.color || "currentColor"}
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M13.8199 6.84961L16.8599 9.88961"
                stroke={props?.color || "currentColor"}
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M13.8199 17.1496V6.84961"
                stroke={props?.color || "currentColor"}
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

const exchange = (props: any) => {
    return (
        <svg
            width={props?.size || 16}
            height={props?.size || 16}
            viewBox="0 0 18 18"
            {...props}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M2.62495 6.75719L6.38245 2.99219"
                stroke={props?.color || "currentColor"}
                strokeWidth="1.6"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M15.375 6.75781L2.625 6.75781"
                stroke={props?.color || "currentColor"}
                strokeWidth="1.6"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M15.375 11.2422L11.6175 15.0072"
                stroke={props?.color || "currentColor"}
                strokeWidth="1.6"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M2.625 11.2422L15.375 11.2422"
                stroke={props?.color || "currentColor"}
                strokeWidth="1.6"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

const twitter = (props: any) => {
    return (
        <svg
            width={props?.size || 16}
            height={props?.size || 16}
            viewBox="0 0 14 14"
            {...props}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12.1626 0H14.3679L9.54994 5.50667L15.2179 13H10.7799L7.30394 8.45533L3.3266 13H1.11994L6.27327 7.11L0.835938 0H5.3866L8.5286 4.154L12.1626 0ZM11.3886 11.68H12.6106L4.7226 1.25067H3.41127L11.3886 11.68Z"
                fill="#C1C4D6"
            />
        </svg>
    );
};

const telegram = (props: any) => {
    return (
        <svg
            width={props?.size || 16}
            height={props?.size || 16}
            {...props}
            viewBox="0 0 48 48"
            id="Layer_2"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                className="cls-1"
                fill="#C1C4D6"
                d="M40.83,8.48c1.14,0,2,1,1.54,2.86l-5.58,26.3c-.39,1.87-1.52,2.32-3.08,1.45L20.4,29.26a.4.4,0,0,1,0-.65L35.77,14.73c.7-.62-.15-.92-1.07-.36L15.41,26.54a.46.46,0,0,1-.4.05L6.82,24C5,23.47,5,22.22,7.23,21.33L40,8.69a2.16,2.16,0,0,1,.83-.21Z"
            />
        </svg>
    );
};

export default { spray, transfer, swap, exchange, twitter, telegram };

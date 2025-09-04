import React from 'react';

const LogoIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 8H16L13 5H4C2.89543 5 2 5.89543 2 7V25C2 26.1046 2.89543 27 4 27H28C29.1046 27 30 26.1046 30 25V10C30 8.89543 29.1046 8 28 8Z" fill="hsl(var(--accent))"/>
        <path d="M19.9299 15.06L17.0699 14.1L16.1299 11.23L15.1899 14.1L12.3299 15.06L15.1899 16.02L16.1299 18.89L17.0699 16.02L19.9299 15.06ZM22.9999 19.33L21.8499 16.71L19.2299 15.56L21.8499 14.41L22.9999 11.79L24.1499 14.41L26.7699 15.56L24.1499 16.71L22.9999 19.33Z" fill="hsl(var(--accent-foreground))" />
    </svg>
);

const Logo = () => {
    return (
        <div className="flex items-center">
            <div className="w-10 h-10">
                <LogoIcon className="w-full h-full" />
            </div>
            <span className="ml-3 text-2xl font-bold text-foreground">My Place</span>
        </div>
    );
};

export default Logo;

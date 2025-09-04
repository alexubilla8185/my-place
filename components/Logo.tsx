import React from 'react';

const LogoIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M0 8C0 3.58172 3.58172 0 8 0H24C28.4183 0 32 3.58172 32 8V24C32 28.4183 28.4183 32 24 32H8C3.58172 32 0 28.4183 0 24V8ZM8 24V12L12 16L16 12L20 16L24 12V24H8Z" />
    </svg>
);

const Logo = () => {
    return (
        <div className="flex items-center">
            <div className="w-10 h-10 text-primary">
                <LogoIcon className="w-full h-full" />
            </div>
            <span className="ml-3 text-2xl font-bold text-foreground">My Place</span>
        </div>
    );
};

export default Logo;

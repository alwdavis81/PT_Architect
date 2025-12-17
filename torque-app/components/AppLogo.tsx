import React from 'react';
import Image from 'next/image';

export const AppLogo = () => (
    <div className="relative w-10 h-10" style={{ width: '40px', height: '40px', position: 'relative' }}>
        <Image
            src="./logo.png" // Relative path for Electron compatibility
            alt="Powertrain Architect"
            fill
            className="object-contain"
            priority
        />
    </div>
);

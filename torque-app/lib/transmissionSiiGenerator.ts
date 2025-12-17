export interface Gear {
    name: string;
    ratio: number;
}

export interface TransmissionSpecs {
    name: string;
    price: number;
    unlockLevel: number;
    diffRatio: number;
    retarder: number;
    gears: Gear[];
}

export function generateTransmissionSii(specs: TransmissionSpecs, internalId: string = "custom_trans"): string {
    const forwardGears = specs.gears.filter(g => g.ratio > 0);
    const reverseGears = specs.gears.filter(g => g.ratio < 0);

    let sii = `SiiNunit
{
accessory_transmission_data : ${internalId}.transmission
{
    name: "${specs.name}"
    price: ${specs.price}
    unlock: ${specs.unlockLevel}
    icon: "transmission_generic"

    differential_ratio: ${specs.diffRatio.toFixed(2)}
`;

    if (specs.retarder > 0) {
        sii += `    retarder: ${specs.retarder}\n`;
    }

    sii += `\n`;

    // Reverse Gears
    reverseGears.forEach((gear, index) => {
        sii += `    ratios_reverse[${index}]: ${gear.ratio.toFixed(2)}\n`;
    });

    sii += `\n`;

    // Forward Gears
    forwardGears.forEach((gear, index) => {
        sii += `    ratios_forward[${index}]: ${gear.ratio.toFixed(2)}\n`;
    });

    sii += `\n`;

    // Gear Names (Optional but good for UI)
    // SCS uses a different format for names if they want custom ones, 
    // but usually it's handled by localized strings or simple numbering.
    // For now, we'll stick to the ratios.

    sii += `}\n}`;

    return sii;
}


import { TransmissionSpecs } from "./types";

export function generateTransmissionSii(specs: TransmissionSpecs, internalId: string): string {
    const forwardGears = specs.gears ? specs.gears.filter((g: any) => g.ratio > 0) : [];
    const reverseGears = specs.gears ? specs.gears.filter((g: any) => g.ratio < 0) : [];

    let sii = `SiiNunit\n{\n`;
    sii += `accessory_transmission_data : ${internalId}.transmission\n{\n`;
    sii += `\tname: "${specs.name}"\n`;
    sii += `\tprice: ${specs.price}\n`;
    sii += `\tunlock: ${specs.unlockLevel}\n`;
    sii += `\ticon: "transmission_generic"\n\n`;
    sii += `\tdifferential_ratio: ${specs.diffRatio.toFixed(2)}\n`;

    if (specs.retarder > 0) {
        sii += `\tretarder: ${specs.retarder}\n`;
    }

    sii += `\n`;

    // Reverse Gears
    reverseGears.forEach((gear: any, index: number) => {
        sii += `\tratios_reverse[${index}]: ${gear.ratio.toFixed(2)}\n`;
    });

    sii += `\n`;

    // Forward Gears
    forwardGears.forEach((gear: any, index: number) => {
        sii += `\tratios_forward[${index}]: ${gear.ratio.toFixed(2)}\n`;
    });

    sii += `}\n}`;

    return sii;
}

import { calculateSpeed, calculateRequiredRatio } from '../lib/transmissionUtils';

describe('Transmission Utilities', () => {
    const TIRE_22_5 = 41.5; // Standard 11R22.5 diameter in inches

    describe('calculateSpeed', () => {
        it('should calculate correct MPH for 1.00 ratio at 1400 RPM with 3.55 diff', () => {
            // RPM: 1400
            // Ratio: 1.00 * 3.55 = 3.55
            // Wheel RPM: 1400 / 3.55 = 394.36
            // Circumference: PI * 41.5 = 130.37 inches
            // Inches/min: 394.36 * 130.37 = 51413.7
            // Inches/hour: 51413.7 * 60 = 3084822
            // MPH: 3084822 / 63360 = 48.68
            expect(calculateSpeed(1400, 1.00, 3.55, TIRE_22_5)).toBeCloseTo(48.68, 1);
        });

        it('should calculate correct MPH for 0.73 overdrive at 1400 RPM with 3.55 diff', () => {
            // Ratio: 0.73 * 3.55 = 2.5915
            // Wheel RPM: 1400 / 2.5915 = 540.22
            // MPH: (540.22 * 130.37 * 60) / 63360 = 66.69
            expect(calculateSpeed(1400, 0.73, 3.55, TIRE_22_5)).toBeCloseTo(66.69, 1);
        });

        it('should return 0 for neutral/zero ratios', () => {
            expect(calculateSpeed(1400, 0, 3.55, TIRE_22_5)).toBe(0);
        });
    });

    describe('calculateRequiredRatio', () => {
        it('should calculate the ratio needed to hit 65 MPH at 1400 RPM with 3.55 diff', () => {
            const ratio = calculateRequiredRatio(65, 1400, 3.55, TIRE_22_5);
            // We know 0.73 gives ~66.7, so 65 should be slightly higher ratio
            expect(ratio).toBeCloseTo(0.75, 2);
        });
    });
});

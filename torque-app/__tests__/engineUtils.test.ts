import { calculateTorqueFtLb, calculateTorqueNm, ftLbToNm, nmToFtLb, FT_LB_TO_NM, NM_TO_FT_LB } from '../lib/engineUtils';

describe('Engine Utilities', () => {
    describe('Conversion Constants', () => {
        it('should have correct conversion factors', () => {
            expect(FT_LB_TO_NM).toBeCloseTo(1.355818);
            expect(NM_TO_FT_LB).toBeCloseTo(0.73756);
        });
    });

    describe('calculateTorqueFtLb', () => {
        it('should calculate correct ft-lb torque for 600HP @ 1800RPM', () => {
            // (600 * 5252) / 1800 = 1750.666...
            expect(calculateTorqueFtLb(600, 1800)).toBeCloseTo(1750.666, 2);
        });

        it('should return 0 if RPM is 0', () => {
            expect(calculateTorqueFtLb(600, 0)).toBe(0);
        });
    });

    describe('calculateTorqueNm', () => {
        it('should calculate correct Nm torque for 600HP @ 1800RPM', () => {
            // 1750.666 * 1.355818 = 2373.585... -> rounded to 2374
            // Wait, common truck specs: 600HP usually has 2050 lb-ft which is 2779 Nm.
            // My calculator uses the physics formula (HP * 5252) / RPM.
            // (600 * 5252) / 1800 = 1750.66 -> 2374 Nm. 
            // The recommendation logic in the UI is different from the physical peak potential.
            expect(calculateTorqueNm(600, 1800)).toBe(2374);
        });
    });

    describe('Unit Conversions', () => {
        it('should convert ft-lb to Nm correctly', () => {
            expect(ftLbToNm(1000)).toBeCloseTo(1355.818);
        });

        it('should convert Nm to ft-lb correctly', () => {
            expect(nmToFtLb(1355.818)).toBeCloseTo(1000);
        });
    });
});

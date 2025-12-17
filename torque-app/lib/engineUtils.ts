/**
 * Engine Physics Constants
 */
export const FT_LB_TO_NM = 1.355818;
export const NM_TO_FT_LB = 0.73756;
export const HP_TORQUE_CONSTANT = 5252;

/**
 * Calculates torque in ft-lb from Horsepower and RPM
 * @param hp Horsepower
 * @param rpm RPM at which peak hp occurs
 * @returns Torque in ft-lb
 */
export function calculateTorqueFtLb(hp: number, rpm: number): number {
    if (rpm === 0) return 0;
    return (hp * HP_TORQUE_CONSTANT) / rpm;
}

/**
 * Converts foot-pounds to Newton-meters
 */
export function ftLbToNm(ftLb: number): number {
    return ftLb * FT_LB_TO_NM;
}

/**
 * Converts Newton-meters to foot-pounds
 */
export function nmToFtLb(nm: number): number {
    return nm * NM_TO_FT_LB;
}

/**
 * Calculates torque in Newton-meters from Horsepower and RPM
 */
export function calculateTorqueNm(hp: number, rpm: number): number {
    const ftLb = calculateTorqueFtLb(hp, rpm);
    return Math.round(ftLbToNm(ftLb));
}

/**
 * Recommends torque peak values based on HP range for ATS/ETS2
 */
export function getRecommendedTorqueLbFt(hp: number): number[] {
    if (hp < 375) return [1250, 1450];
    if (hp < 425) return [1450, 1550, 1650];
    if (hp < 475) return [1550, 1650, 1750];
    if (hp < 525) return [1650, 1850];
    if (hp < 575) return [1850, 2050];
    if (hp < 625) return [2050, 2250];
    return [2250, 2450];
}

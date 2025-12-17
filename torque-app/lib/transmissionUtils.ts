/**
 * Transmission Physics Constants
 */
export const METERS_PER_MILE = 1609.34;
export const MINUTES_PER_HOUR = 60;

/**
 * Calculates current speed for a given gear ratio at a specific RPM.
 * Formula: (RPM * TireCircumference) / (GearRatio * DiffRatio * 60)
 * 
 * @param rpm Engine RPM
 * @param gearRatio Ratio of the current gear (e.g. 0.73)
 * @param diffRatio Differential (Final Drive) ratio (e.g. 3.55)
 * @param tireDiameter Tire diameter in inches (e.g. 41.5)
 * @param useImperial Default true, returns MPH. If false returns KPH.
 */
export function calculateSpeed(
    rpm: number,
    gearRatio: number,
    diffRatio: number,
    tireDiameter: number,
    useImperial: boolean = true
): number {
    if (gearRatio === 0 || diffRatio === 0) return 0;

    // Circumference in inches
    const circumferenceInches = Math.PI * tireDiameter;

    // Inches per minute at this RPM and gearing
    // Ratio = Engine Revs / Wheel Revs -> Wheel Revs = Engine Revs / Ratio
    const wheelRpm = rpm / (gearRatio * diffRatio);
    const inchesPerMinute = wheelRpm * circumferenceInches;

    // Inches per hour
    const inchesPerHour = inchesPerMinute * 60;

    // Miles per hour (1 mile = 63360 inches)
    const mph = inchesPerHour / 63360;

    if (useImperial) {
        return mph;
    } else {
        // Convert to KPH (1 mph = 1.60934 kph)
        return mph * 1.60934;
    }
}

/**
 * Calculates required gear ratio to hit a target speed at specific RPM.
 */
export function calculateRequiredRatio(
    targetSpeedMph: number,
    rpm: number,
    diffRatio: number,
    tireDiameter: number
): number {
    if (targetSpeedMph === 0 || rpm === 0) return 0;

    const circumferenceInches = Math.PI * tireDiameter;
    const inchesPerHour = targetSpeedMph * 63360;
    const inchesPerMinute = inchesPerHour / 60;
    const requiredWheelRpm = inchesPerMinute / circumferenceInches;

    // Ratio = Engine RPM / Wheel RPM
    return rpm / (requiredWheelRpm * diffRatio);
}

/**
 * Suggests an optimal differential ratio to hit a target cruising speed 
 * in the highest gear at the engine's "Sweet Spot" RPM.
 */
export function suggestOptimalDiff(
    targetMph: number,
    sweetSpotRpm: number,
    topGearRatio: number,
    tireDiameter: number
): number {
    if (targetMph === 0 || sweetSpotRpm === 0 || topGearRatio === 0) return 0;

    const circumferenceInches = Math.PI * tireDiameter;
    const inchesPerHour = targetMph * 63360;
    const inchesPerMinute = inchesPerHour / 60;
    const requiredWheelRpm = inchesPerMinute / circumferenceInches;

    // Diff = Engine RPM / (Wheel RPM * Gear Ratio)
    const diff = sweetSpotRpm / (requiredWheelRpm * topGearRatio);
    return diff;
}

/**
 * Calculates engine RPM for a given speed and gearing.
 */
export function calculateRpm(
    speed: number,
    gearRatio: number,
    diffRatio: number,
    tireDiameter: number,
    useImperial: boolean = true
): number {
    if (gearRatio === 0 || diffRatio === 0 || tireDiameter === 0) return 0;

    const speedMph = useImperial ? speed : speed / 1.60934;

    // (Speed * GearRatio * DiffRatio * 63360) / (60 * PI * TireDiameter)
    const rpm = (speedMph * gearRatio * diffRatio * 63360) / (60 * Math.PI * tireDiameter);

    return rpm;
}

/**
 * Formats a gear ratio or speed for display
 */
export function formatValue(val: number, decimals: number = 2): string {
    return val.toFixed(decimals);
}

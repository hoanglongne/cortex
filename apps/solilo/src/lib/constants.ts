/** Duration of the preparation phase in seconds */
export const PREP_DURATION_S = 60;

/** Duration of the recording phase in seconds */
export const RECORD_DURATION_S = 120;

/** Base URL for the ORATIO product */
export const ORATIO_BASE_URL = 'https://oratio.app';

/** Rating step size (IELTS uses 0.5 increments) */
export const RATING_STEP = 0.5;

/** Minimum rating value */
export const RATING_MIN = 1.0;

/** Maximum rating value */
export const RATING_MAX = 9.0;

/** Band descriptor labels */
export const BAND_DESCRIPTORS: Record<string, string> = {
    '1.0': 'Non User',
    '1.5': 'Non User',
    '2.0': 'Intermittent User',
    '2.5': 'Intermittent User',
    '3.0': 'Extremely Limited User',
    '3.5': 'Extremely Limited User',
    '4.0': 'Limited User',
    '4.5': 'Limited User',
    '5.0': 'Modest User',
    '5.5': 'Modest User',
    '6.0': 'Competent User',
    '6.5': 'Competent User',
    '7.0': 'Good User',
    '7.5': 'Good User',
    '8.0': 'Very Good User',
    '8.5': 'Very Good User',
    '9.0': 'Expert User',
};

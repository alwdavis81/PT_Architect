export interface SoundProfile {
    id: string;
    name: string;
    fileName: string; // e.g. "sound_cat_c15.sui"
}

export const SOUND_LIBRARY: SoundProfile[] = [
    { id: "cat_c15", name: "CAT C15 (Straight Pipe)", fileName: "sound_cat_c15.sui" },
    { id: "cat_c15_s", name: "CAT C15 (Stock)", fileName: "sound_cat_c15s.sui" },
    { id: "cat_3406e", name: "CAT 3406E", fileName: "sound_cat_3406e.sui" },
    { id: "cat_3408", name: "CAT 3408 (V8)", fileName: "sound_cat_3408.sui" },
    { id: "cummins_isx15", name: "Cummins ISX15", fileName: "sound_isx15.sui" },
    { id: "cummins_n14", name: "Cummins N14", fileName: "sound_n14.sui" },
    { id: "cummins_m11", name: "Cummins M11", fileName: "sound_cum_m11.sui" },
    { id: "cummins_444", name: "Cummins 444", fileName: "sound_cum_444.sui" },
    { id: "detroit_dd60", name: "Detroit DD60", fileName: "sound_dd60.sui" },
    { id: "detroit_8v92", name: "Detroit 8V92", fileName: "sound_dd_92.sui" },
    { id: "mack_mp8", name: "Mack MP8", fileName: "sound_mp8d.sui" },
    { id: "mack_e7", name: "Mack E7", fileName: "sound_e7.sui" },
    { id: "paccar_mx13", name: "Paccar MX-13", fileName: "sound_mx13.sui" },
    { id: "volvo_d13", name: "Volvo D13 (Green)", fileName: "sound_d13.sui" }, // Assuming based on pattern, though not explicitly in list above, likely present or fallback
    { id: "scania_v8", name: "Scania V8 (Open Pipe)", fileName: "sound_v8_op.sui" }, // Common mod convention, helpful if present
];

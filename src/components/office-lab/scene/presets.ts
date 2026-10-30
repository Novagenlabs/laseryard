// Shared data for the office lab: the eleven anodized finishes (same swatches
// as the product page) and the two starting "looks".

export const FINISHES = [
  { id: "black", label: "Matte Black", hex: "#2a2a2c" },
  { id: "silver", label: "Silver", hex: "#c9c9cd" },
  { id: "gold", label: "Champagne Gold", hex: "#cdb88f" },
  { id: "blue", label: "Blue", hex: "#1f63b8" },
  { id: "red", label: "Red", hex: "#962331" },
  { id: "green", label: "Green", hex: "#7fa86c" },
  { id: "forest-green", label: "Sage Green", hex: "#8f9a8c" },
  { id: "purple", label: "Purple", hex: "#8f3f82" },
  { id: "pink", label: "Blush Pink", hex: "#d9bdbb" },
  { id: "orange", label: "Cosmic Orange", hex: "#e8963f" },
  { id: "brown", label: "Brown", hex: "#6f4e37" },
] as const;

export type FinishId = (typeof FINISHES)[number]["id"];

export const LOOKS = ["madmen", "jets"] as const;
export type Look = (typeof LOOKS)[number];

export const LOOK_LABEL: Record<Look, string> = {
  madmen: "Executive office, 1962",
  jets: "Jet broker, glass office",
};

// Where the box sits on the desk and where the camera looks.
export const DESK_TOP_Y = 0.76;
export const BOX_POSITION: [number, number, number] = [0.08, DESK_TOP_Y, 0.05];

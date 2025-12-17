# Powertrain Architect User Manual

Welcome to **Powertrain Architect**, the precise engineering tool for creating custom engine and transmission mods for American Truck Simulator (ATS).

This tool eliminates the need for manual `.sii` editing, folder creation, or complex math.

---

## 🚀 1. Installation & Launch



1.  **Launch**: Double-click **Powertrain Architect.exe**.
2.  **Ready**: No installation required. The app is fully self-contained.

---

## ⚡ 2. Engine Designer: The Core Workflow

### Step 1: Quick Start (Optional)
Don't want to start from scratch?
1.  Look for the **"Quick Start"** bar at the top of the panel.
2.  Select a real-world template (e.g., `CAT C15 (600HP)` or `Detroit DD15`).
3.  This pre-fills all specs, torque curves, and sound links.

### Step 2: Define Performance
You can customize every aspect of the engine:
*   **Target HP**: Enter your desired peak horsepower.
*   **Torque**: The app automatically recommends the correct torque (in N·m) based on your HP.
*   **Smart Curve**: Click "Smart Gen Curve" to generate a scientifically accurate torque curve that holds peak torque flat (Heavy Duty Diesel style) rather than a simple peak.
*   **Realism Check**: If you create a "3000HP" engine with low torque, the app will warn you about "Unrealistic Specs".

### Step 3: Sound Selector 🔊
This is the most powerful feature. You don't need to hunt for file paths.
1.  Locate the **"Sound Profile"** dropdown.
2.  Choose a sound (e.g., `CAT C15 (Straight Pipe)`, `Cummins ISX15`, `Scania V8`).
3.  **Requirements**: You must have the **BCS Custom Engines** sound mod installed in-game for these to work.
4.  The app handles all the `@include` logic invisible to you.

### Step 4: Metadata (Crucial!)
*   **Internal Engine Name**: Must be unique (e.g., `c15_my_custom_tune`).
*   **Truck Internal Name**: This **MUST** match the truck you are using.
    *   Example for Vanilla Pete: `peterbilt.389`
    *   Example for Jon Ruda Pete: `peterbilt.389v2` (or whatever his ID is).
    *   If this is wrong, the engine won't show up in the shop!

---

## 📦 3. One-Click Mod Export

Forget creating 10 folders manually.

1.  Click **Export .sii** (Green Button).
2.  Review the code preview if you wish.
3.  Click **"Export as Mod (.scs)"**.
4.  **Done!**
    *   The app generates a ready-to-use `.scs` file (e.g., `c15_tuned.scs`).
    *   It contains the correct folder structure: `def/vehicle/truck/<your_truck>/engine/`.
    *   It includes a Manifest and Description.

**To Install:**
1.  Drag the `.scs` file into `Documents/American Truck Simulator/mod`.
2.  Enable it in the Mod Manager.

---

## ⚙️ 4. Transmission Designer & Gearing Assistant

Create custom gearboxes to match your engine perfectly.

### Transmission Presets
Don't want to enter ratios manually?
1. Open the **"Quick Start"** dropdown in the Transmission Designer.
2. Choose from verified models like **Eaton Fuller 10/13/18 speeds** or **Allison Automatics**.
3. All ratios, price, and unlock levels are set instantly.

### Gearing Assistant (AI Optimization) 🤖
Struggling to find the right differential ratio?
1. Look at the **Gearing Assistant** panel.
2. It talks to your engine configuration to find the optimal "Cruising RPM".
3. Enter your target cruise speed (e.g., 65 MPH).
4. Click **Apply Suggested Diff** to automatically snap your gearbox to the engine's peak power band.

---

## 🌉 5. The Powertrain Bridge (Integration)

In v1.1.0, the Engine and Transmission are now **Live Synced**:

*   **Shared Identity**: If you set the "Truck Internal Name" in the Engine Tool, it automatically updates the Transmission Tool (and vice versa). No more mismatched mod configs.
*   **Power Band Overlays**: On the Transmission chart, you will see **green dashed lines**. These represent the exact RPM range you defined in your engine's "Power Band". If your gear shifts land between these lines, your truck will pull with maximum efficiency.
*   **Active Target**: Look at the Sidebar—the app now displays your "Active Target" truck mod globally so you always know what you're building for.

---

## ❓ 6. FAQ

**Q: My engine has no sound!**
A: Did you select a Sound Profile? If yes, do you have the "BCS Custom Engines" mod active in your load order? The generated engine *links* to that pack; it doesn't contain the sounds itself.

**Q: My engine doesn't show in the shop!**
A: Check the **"Truck Internal Name"**. It defaults to `peterbilt.389`. If you are driving a Kenworth W900, you must change it to `kenworth.w900` before exporting.

**Q: Can I edit an existing mod?**
A: Yes! Click **"Import .sii"**, paste the file content, and the app will visualize it for you to tweak.

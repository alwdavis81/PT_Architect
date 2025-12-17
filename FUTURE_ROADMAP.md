# Powertrain Architect - Future Roadmap 🚀

This document outlines potential features, improvements, and long-term goals for the Powertrain Architect application.

## 📦 Phase 1: Mod Packaging & Usability (High Priority)
Focus on making the output "Game Ready" immediately.

### ✅ Completed / Delivered
-   **Mod Library & Inspector**
    -   Scanning `.scs` / `.zip` archives directly in the browser.
    -   Hierarchical browsing (Truck -> Engine) to organize massive mod packs.
    -   Auto-detection of "Open Def" vs Locked files.
-   **Round-Trip Intelligence**
    -   Import existing `.sii` files, modify specs, and **patch** them back.
    -   Preserves original formatting, comments, and structure (non-destructive).
-   **Smart Assistance**
    -   **Truck ID Lookup**: Built-in cheat sheet for SCS and Popular Mod (Ruda, Overfloater) IDs.
    -   **Auto-Bind**: Automatically detects Truck ID from folder names when using the library.
    -   **Smart Curve**: Generates realistic torque curves from just HP/Torque targets.
-   **One-Click Mod Export (`.scs` Generation)**
    -   Instead of downloading individual `.sii` files, the app creates the full directory structure:
        `def/vehicle/truck/ <truck_name> /engine/ <engine_name>.sii`
    -   Zips it into a `.scs` file ready for the `mod` folder.
    -   Includes a basic `manifest.sii` generator (Mod Name, Version, Author, Icon).
-   **Preset Library (Quick-Start)**
    -   Built-in database of real-world engines and transmissions.
    -   *Engines*: CAT C15, Cummins ISX, Detroit DD15, Mack MP8, Volvo D13, Scania V8.
-   **Sound Selector**
    -   One-click linking of **Mega Pack** sound assets.
    -   Automatically handles `@include` directives.
-   **Comprehensive Documentation**
    -   Updated `HOW_TO_USE.md` manual included in release.

### 🚧 Up Next (Phase 2)
-   **Direct Visual Editing**
    -   Allow users to **drag points** directly on the Torque Curve chart to adjust values.

## 🛠 Phase 2: Advanced Tuning & Simulation
Focus on "What if?" scenarios and deeper customization.

-   **Performance Simulator (The "Dyno")**
    -   Simulate how the engine performs under load.
    -   *Inputs*: Gross Weight (e.g., 80,000 lbs), Grade (e.g., 3%), Diff Ratio, Tire Size.
    -   *Outputs*: Estimated 0-60 mph time, Top Speed, RPM at 65mph.
    -   Helps users match engines to transmissions/differentials properly.

-   **Curve Smoothing & AI Assistance**
    -   "Smooth My Curve": Algorithm to take jagged input points and generate a mathematically smooth torque curve.
    -   "Suggest Gearing": AI suggests differential ratios based on the engine's "sweet spot" (peak torque RPM) and desired highway speed.

-   **Sound Bank Integration**
    -   Add a field to select sound banks (e.g., `sound: "/sound/truck/default/v8.bank"`).
    -   Drop-down list of standard game sounds.

## 🎨 Phase 3: Visuals & Community
Focus on polish and sharing.

-   **Icon Generator**
    -   Simple tool to generate the UI icon (`.mat` + `.tobj` reference) for the game menu.
    -   Could auto-generate a graphic with the Horsepower/Torque numbers on it.

-   **Community Sharing (Pastebin/JSON)**
    -   "Share Configuration": Generates a short code or JSON string users can copy/paste to friends to load the exact same engine setup.

-   **Truck Compatibility Selector**
    -   Checkboxes for which trucks this engine is compatible with.
    -   Auto-generates the `suitable_for[]` lines in the def file.

## 🔧 Technical Debt & Clean Up
-   [x] **Unit Tests**: Add Jest testing for the torque calculation logic.
-   [x] **Auto-Update**: Integrate electron-updater to fetch new versions of the app automatically.

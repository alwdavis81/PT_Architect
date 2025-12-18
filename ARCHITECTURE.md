# 🏗️ Powertrain Architect: Technical Architecture

This document provides a deep dive into the engineering decisions and architectural patterns used in Powertrain Architect. It is intended for technical reviewers and collaborators.

---

## 1. System Design Overview

Powertrain Architect follows a **Unidirectional Data Flow** pattern leveraging React Context for cross-module synchronization.

### Data Layer (Powertrain Context)
The "Source of Truth" for the entire application is the `PowertrainProvider`.
- **Synchronization Hub**: When a user changes the truck internal ID in the Engine Editor, the context automatically pushes that update to the Transmission Editor.
- **Computed Consumption**: The Transmission chart consumes engine power-band data (min/max RPM) directly from the context to render live visual overlays, allowing for "context-aware" gearbox design.

---

## 2. Key Technical Implementations

### A. The Sii Patching Engine (`lib/siiPatcher.ts`)
ATS/ETS2 use a custom text-based format called `.sii`. Since standard JSON/YAML parsers cannot interpret this, I developed a custom **Stateful Patching Engine**.

- **Isolative Targeting**: Instead of global search-and-replace, the engine uses a block-scoped Regex to isolate the `accessory_engine_data` container. This ensures that comments outside the target block and secondary objects in the file remained untouched.
- **Round-Trip Integrity**: The engine detects original line endings (CRLF vs LF) to ensure files remain compatible with the user's preferred text editor (Notepad, VS Code, etc.).
- **Indentation Capture**: The parser captures the user's indentation style (tabs vs spaces) from existing lines and applies it to injected content (`torque_curve[]`, `info[]`), maintaining a "native" look for the mod file.

### B. Intelligent Gearing Assistant (`components/transmission/GearingAssistant.tsx`)
The Gearing Assistant uses a mathematical model to solve for the "Final Drive" (Differential Ratio) required to hit a specific cruise target.

- **The Formula**: `Differential = (Target_RPM * Tire_Diameter * 0.002975) / (Speed_MPH * Top_Gear_Ratio)`
- **Integration**: The tool pulls the "Optimal Cruising RPM" directly from the engine's power band definition, meaning the AI suggestions adapt dynamically as you change engine models.

---

## 3. Performance Optimizations

### Visualizations with Recharts
To handle real-time plotting of 18-gear transmissions at 60fps, I used **Recharts** with SVG rendering.
- **Normalized Data**: Torque and Horsepower curves are normalized to a 0-1 ratio for charting, then mapped back to raw values for the `.sii` export.
- **Reference Overlays**: Heavy-duty diesel power bands are rendered as static reference lines, providing an "at-a-glance" performance check during gear ratio editing.

---

## 4. Portability & Distribution

### Electron Build Pipeline
The app is packaged using `electron-builder` with an **NSIS (Nullsoft Scriptable Install System)** target.
- **Delta Updates**: The integration of `electron-updater` allows for background download of new releases via GitHub Releases.
- **Gogglez-Safe ID Sanitation**: A build-time (and runtime) utility sanitizes 4-digit numeric IDs (which cause known engine visibility bugs in ATS) into a hexadecimal-inspired "k-notation" (e.g., 1000 -> 1k0).

---

## 5. Security & Safety
- **No File Mutation**: The app never overwrites user's original files without confirmation; it provides a "Preview & Copy" or "Export as New File" workflow.
- **Type Safety**: The codebase is 98% TypeScript, ensuring that mechanical formulas (which are highly sensitive to unit conversion errors) are strictly typed.

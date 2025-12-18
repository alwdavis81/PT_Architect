# 🚛 Powertrain Architect

**A Professional-Grade Engineering Suite for American Truck Simulator & Euro Truck Simulator 2 Modding.**

Powertrain Architect is an advanced desktop application built with **Next.js 15**, **Electron**, and **Tailwind CSS**. It bridges the gap between mechanical engineering and game modding by providing a data-driven interface for designing scientifically accurate engines and transmissions.

[![Latest Release](https://img.shields.io/github/v/release/alwdavis81/PT_Architect?label=version&color=emerald)](https://github.com/alwdavis81/PT_Architect/releases)
[![Build and Release](https://github.com/alwdavis81/PT_Architect/actions/workflows/release.yml/badge.svg)](https://github.com/alwdavis81/PT_Architect/actions/workflows/release.yml)
[![Tech Stack](https://img.shields.io/badge/stack-Next.js%20|%20Electron%20|%20Tailwind-blue)](#-tech-stack)
[![License](https://img.shields.io/badge/license-Proprietary-red)](#-legal)

---

## 🚀 Key Features

### 🛠️ Intelligent Engine Designer
- **Dynamic Torque Modeling**: Generate realistically flat torque curves typical of heavy-duty diesel engines.
- **Smart Recommendations**: Automatic HP-to-Torque ratio calculation based on real-world diesel performance metrics.
- **Sii Patching Engine**: Custom Regex-based parsing engine that allows users to import existing mods, modify specific parameters, and export without destroying original file formatting or comments.

### ⚙️ Transmission Engineering & AI Assistant
- **Live Gearing Simulator**: Real-time RPM/MPH plotting with shift-point visualization.
- **AI Gearing Assistant**: Automatically calculates the optimal differential ratio to hit a target cruising speed within the engine's peak power band.
- **State Synchronization**: Custom React Context bridge ensures engine performance data is live-synced to the transmission designer for accurate simulation.

---

## 💻 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router, Static Export)
- **Shell**: [Electron](https://www.electronjs.org/) (Cross-platform desktop integration)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Visuals**: [Recharts](https://recharts.org/) (High-performance SVG graphs)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions) (Automated building and release distribution)

---

## 🏗️ Architecture Insight

### 1. The Powertrain Bridge
To enable real-time gear simulation, I implemented a global `PowertrainProvider`. This context synchronizes disparate state objects (Engine Specs, Torque Curves, Gear Ratios) across different application routes.

### 2. Regex-Based Sii Patching Engine
Standard JSON parsers cannot handle the proprietary `.sii` format. I developed a custom parser that uses safe isolation logic to identify specific accessory blocks and modify attributes while preserving custom user comments and whitespace.

---

## 🛠️ Development & Build

### Installation
```bash
cd torque-app
npm install
```

### Run (Development)
```bash
npm run dev
```

### Build (Production)
```bash
npm run dist
```

---

## 📄 Legal
Powertrain Architect is an unofficial fan project and is not affiliated with SCS Software. All truck brands and game assets referenced are property of their respective owners.

© 2025 alwdavis81. All Rights Reserved.

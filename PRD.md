This is a comprehensive Product Requirements Document (PRD) for the **Torque Architect** application, combining all engine and transmission features into one master blueprint.

Since I cannot create a file for you to download, I will present the complete PRD in a single, scannable block of text, which you can easily copy and paste into your project documentation or text editor.

---

#🚚 Product Requirements Document: Torque Architect (ATS/ETS2 Powertrain Editor)| Attribute | Value |
| --- | --- |
| **Product Name** | Torque Architect |
| **Target Audience** | American Truck Simulator (ATS) / Euro Truck Simulator 2 (ETS2) "Sim Pro" Modders |
| **Problem** | Manually creating realistic engine torque curves and transmission gear charts in `.sii` files is a tedious, trial-and-error process requiring constant file editing, complex manual math conversions, and a lack of visual feedback. |
| **Goal** | Provide a fast, visual, and mathematically accurate tool to design, convert, and generate complete `accessory_engine_data` and `accessory_transmission_data` blocks for custom ATS/ETS2 mods. |
| **Version** | 1.0 (Minimum Viable Product - MVP) |

---

##1. Engine Creation ToolsThe focus is on generating the `/def/vehicle/truck/<truck>/engine/<my_custom_engine>.sii` file, with the core feature being the visualization of the Torque and Power curves.

###1.1 The Visual Torque Curve Editor (Must-Have)| ID | Feature | Description |
| --- | --- | --- |
| **FE1.1** | **Interactive Graph** | A visible plot showing **Torque (Y-axis)** vs. **RPM (X-axis)**. |
| **FE1.2** | **Point Manipulation** | Users can **click, drag, and drop** anchor points on the graph to instantly change the shape of the torque curve. |
| **FE1.3** | **Live Data Table** | A corresponding table that lists the `torque_curve[]` values as the user adjusts the graph (e.g., `(1200, 1.0)`). |
| **FE1.4** | **Power Curve Overlay** | A separate, calculated line should be displayed on the graph showing the resulting **Horsepower (HP)** curve in real-time. |

###1.2 The Engine Core Calculator (Must-Have)| ID | Feature | Description |
| --- | --- | --- |
| **FE2.1** | **HP/Torque Goal Setting** | Dedicated fields for the user to input their target engine specs (e.g., Target **600 HP** at **1800 RPM**). |
| **FE2.2** | **Unit Conversion Toggle** | A toggle switch allowing the user to input/view values in **ft-lb** (Imperial) or **N⋅m** (Metric). *Final output must always use N⋅m.* |
| **FE2.3** | **Auto-Torque Calculation** | Based on the user's HP/RPM goals, the app calculates and sets the required `torque` value (max torque in N⋅m) in the output file. |
| **FE2.4** | **Engine Braking Slider** | A slider to control the `engine_brake` value (e.g., 1.0 to 3.0), providing a visual indication of jake brake strength. |
| **FE2.5** | **Consumption Coefficient** | An input field for `consumption_coef` for fine-tuning fuel economy. |

###1.3 Engine File Output (Must-Have)| ID | Feature | Description |
| --- | --- | --- |
| **FE3.1** | **Metadata Input** | Input fields for the required `.sii` file metadata: **Internal Name** (`c15_tuned`), **Shop Name** (`CAT C15 Tuned`), **Price**, and **Unlock Level**. |
| **FE3.2** | **SiiNunit Output (Engine)** | A button to generate and display the final, complete `accessory_engine_data` SiiNunit block in a text window, ready to be copied. |

---

##2. Transmission and Differential ToolsThe focus is on generating the `/def/vehicle/truck/<truck>/transmission/<my_custom_trans>.sii` file, with the core feature being the visualization of Speed vs. RPM.

###2.1 The Speed-to-RPM Visualizer (Must-Have)| ID | Feature | Description |
| --- | --- | --- |
| **FT1.1** | **Speed-to-RPM Graph** | A visible plot showing **Speed (X-axis)** vs. **Engine RPM (Y-axis)**. The graph must display a separate line for *each* forward gear. |
| **FT1.2** | **Interactive Gear Editing** | Users can select a gear and modify its **Gear Ratio** value, seeing the corresponding line on the graph shift instantly. |
| **FT1.3** | **Differential Ratio Input** | A dedicated field for the user to input the **Final Drive Ratio** (e.g., 3.90). This value serves as the primary multiplier for all gear lines on the graph. |
| **FT1.4** | **Max Speed Visualization** | A visual marker on the graph indicating the truck's theoretical maximum speed in the highest gear at the engine's `rpm_limit`. |

###2.2 Transmission Gear Definition Editor (Must-Have)| ID | Feature | Description |
| --- | --- | --- |
| **FT2.1** | **Transmission Type Selector** | Radio buttons to select the transmission type: **Automatic**, **Sequential**, or **H-Shifter** (used for `gear_change_type`). |
| **FT2.2** | **Reverse/Forward Gear List** | A table listing all gears. Users can add or remove forward/reverse gears (e.g., 10, 13, 18-speed). |
| **FT2.3** | **Ratio Input Fields** | Fields for each gear in the table to input its specific **Ratio** (e.g., 1st Gear = 14.40). |
| **FT2.4** | **Differential Ratio Writer** | The value from **FT1.3** must be written as the `final_drive_ratio` in the output file. |

###2.3 Transmission Output and Integration (Must-Have)| ID | Feature | Description |
| --- | --- | --- |
| **FT3.1** | **Clutch & Engine Brake Integration** | Fields to set realistic `clutch_torque_resistance` (for heavy haul) and `brake_torque`. |
| **FT3.2** | **Transmission Sii Output** | A button to generate the complete `accessory_transmission_data` SiiNunit block, including the differential ratio and all gear ratios, ready for the user to copy/save. |

---

##3. Advanced Features (Post-MVP/Future Scope)| ID | Feature | Description |
| --- | --- | --- |
| **FA1.1** | **Mod Structure Packer** | A tool that takes the generated `.sii` files and bundles them into a basic, ready-to-use `.scs` archive with the correct folder structure (`def/vehicle/truck/...`). |
| **FA1.2** | **Load Existing File** | Functionality to parse an existing `.sii` file (Engine or Trans), read its values, and populate the graphs and input fields for easy modification. |
| **FA1.3** | **Engine Sound Integration** | A field to link the engine to a specific sound bank definition (`overrides[]: ...`) for sound mod compatibility. |

---

##4. Technical Specifications| Component | Detail |
| --- | --- |
| **Data Format** | Plain text (SiiNunit format). |
| **Engine Core Calculation (HP)** | HP = \frac{Torque(ft\text{-}lb) \times RPM}{5252} |
| **Engine Torque Conversion** | 1 ft\text{-}lb \approx 1.3558 N\text{·}m (Game uses N⋅m for `torque` attribute). |
| **Transmission Core Calculation** | Speed \propto \frac{RPM}{Gear\ Ratio \times Final\ Drive\ Ratio} |
| **Output Syntax** | Must strictly adhere to SiiNunit format (e.g., `torque_curve[]: (1200, 1)`, `ratios[0]: -14.40`, `final_drive_ratio: 3.90`). |
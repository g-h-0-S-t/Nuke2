# Nuke 2

A High-Performance Bulk Tab Automation & Stress Testing Bookmarklet

---

## Introduction

Nuke 2 is a browser automation utility designed for high-throughput tab/window simulation and load testing. Featuring **Automated Scroll Simulation** and **Distributed Denial-of-Service (DoS) Simulation** modes, the tool offers a polished, persistent UI with live metrics panel, action controls, and a floating log window. All interactions are powered by modern standards and ergonomic design.

Strictly intended for legitimate testing, research, and engineering workflows.

---

## Features

- **Scroll Simulation Mode:**  
  Opens many tabs, scrolls each to the bottom, then closes them (for analytics, page view, or interaction testing).
- **DoS Simulation Mode:**  
  Generates bulk tab/window openings for resource impact or stress analysis.
- **Infinite Execution:**  
  Optionally loops tab automation for sustained workloads.
- **Apple-like UI/UX:**  
  - Persistent side panel, dark/light themes
  - Card-based live stats
  - Large buttons, modern design
  - Floating log window with action controls and batch progress

---

## Mermaid Diagram

```mermaid
flowchart TD
A["Start: User Launches Nuke 2"] --> B["User Configures: Tabs, Mode, Theme"]
B --> C{Mode Selected}
%% Log Window Actions
B --> L["Open Log Window"]
L --> L1["Pause"]
L --> L2["Resume"]
L --> L3["Stop"]
L --> L4["Clear Logs"]
L --> L5["Exit"]
L5 --> CLW["Close Log Window"]

%% Scroll Simulation Branch
C -->|Scroll Mode| D1["Open Tab(s)"]
D1 --> E1["Focus and Check DOM State"]
E1 --> F1["Scroll Tab to Bottom"]
F1 --> G1["Close Tab"]
G1 --> H1{More Tabs?}
H1 -->|Yes| D1
H1 -->|No| Z["Display Completion Status"]

%% DoS Simulation Branch
C -->|DoS Mode| D2["Open Tab(s) in Batch"]
D2 --> E2["Wait Random Dwell Time"]
E2 --> F2["Close Tab(s) Sequentially"]
F2 --> G2{Infinite Mode Active?}
G2 -->|Yes| D2
G2 -->|No| Z

%% Log Control Influence (can occur any time after launch)
L1 -.-> Z
L2 -.-> D1
L2 -.-> D2
L3 -.-> Z
L4 -.-> L
```

---

## Usage

1. **Install as Bookmarklet:**  
   - Copy the minified script to a new browser bookmark.
   - Allow pop-ups for the site to fully enable tab automation.

2. **Activate:**  
   - Navigate to any target page and click the “Nuke 2” bookmarklet.
   - Configure via the side panel:  
      - Tab Count (1–999),
      - Mode: Scroll Simulation or DoS Simulation,
      - Theme: Dark/Light
   - Press **Launch**.

3. **Monitor & Control:**  
   - View live statistics in the sidebar.
   - Open the floating log window for session events and actions:
     - Pause, Resume, Stop, Clear Logs, Exit.

4. **Terminate:**  
   - Use log window controls, all tabs are closed on stop/completion.

---

## Requirements

- Modern Chromium-based browser (Chrome, Edge, Opera).
- Pop-up permissions enabled.
- ES6+ JavaScript support required.
- Same-origin policies enforced by browser security.

---

## Limitations

- **Cross-origin restrictions:**  
  Tab interactions and scroll automation may not function for other domains due to browser security.
- **System resource intensity:**  
  Bulk tab automation can be RAM and CPU intensive. The tool closes tabs for stability on completion.
- **Intended use:**  
  For QA, engineering, and authorized testing only.

---

## Credits

- Author: g-h-0-S-t (GitHub)
- Based on: [Nuke](https://github.com/g-h-0-S-t/Nuke), [openTabsAndScroll](https://github.com/g-h-0-S-t/openTabsAndScroll), [Content Moderation Assistant](https://github.com/g-h-0-S-t/Content-Moderation-Assistant)
- License: MIT

---

## Disclaimer

Nuke 2 is provided exclusively for authorized, law-abiding research, testing, and automation. ***Misuse or illegal deployment is strictly prohibited and not the responsibility of the author.***

---

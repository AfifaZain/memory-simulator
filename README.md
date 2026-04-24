# 🧠 Virtual Memory Manager & Page Replacement Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()

An interactive web-based simulator designed to visualize Virtual Memory management concepts. This tool demonstrates how operating systems handle memory paging, page faults, and replacement strategies. It includes a comparative analysis with Android's specific memory mechanisms (LMK and zRAM).

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [Algorithms Explained](#-algorithms-explained)
- [Thrashing Demonstration](#-thrashing-demonstration)
- [Android Memory Comparison](#-android-memory-comparison)
- [Project Structure](#-project-structure)
- [Author](#-author)

## ✨ Features

- **5 Page Replacement Algorithms:** FIFO, LRU, Optimal, LFU, and Clock (Second Chance).
- **Real-time Visualization:** Animated memory frames showing Hits (Green) and Faults (Red).
- **Performance Metrics:** Calculates Page Faults, Hits, and Hit Ratio instantly.
- **Thrashing Mode:** A special button to generate reference strings that cause system thrashing.
- **Algorithm Comparison:** Dynamic bar chart to compare the efficiency of different algorithms.
- **Android Analysis:** Educational section comparing standard paging with Android's Low Memory Killer and zRAM.

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Structure |
| **CSS3** | Styling and Animations |
| **JavaScript (ES6)** | Simulation Logic |
| **Chart.js** | Performance Graphing |

## 🚀 Installation

1. **Clone the repository:**
   bash
   git clone https://github.com/your-username/memory-simulator.git
   
2. **Run Locally:**
   - Open `index.html` in any modern web browser.
   - No installation or server required.

## 📖 Usage Guide

1. **Input Reference String:** Enter a sequence of page numbers (e.g., `7, 0, 1, 2, 0, 3`).
2. **Set Frame Count:** Define how many physical memory frames are available (e.g., `3`).
3. **Select Algorithm:** Click one of the algorithm buttons (FIFO, LRU, etc.).
4. **Observe:**
   - Watch the **Memory Frames** update.
   - **Green Flash:** Page Hit (Process found in memory).
   - **Red Flash:** Page Fault (Process loaded from disk).
   - Check the **Metrics** panel for the Hit Ratio.
5. **Compare:** Run multiple algorithms on the same input to see which performs best on the comparison chart.

## 🧠 Algorithms Explained

### 1. FIFO (First-In, First-Out)
- **Logic:** Replaces the oldest page in memory.
- **Behavior:** Simple queue structure. Can suffer from Belady's Anomaly.

### 2. LRU (Least Recently Used)
- **Logic:** Replaces the page that has not been used for the longest time.
- **Behavior:** Requires tracking usage history. Generally performs better than FIFO.

### 3. Optimal
- **Logic:** Replaces the page that will not be used for the longest period in the future.
- **Behavior:** Theoretical best case. Impossible to implement in real OS (requires future knowledge), but used as a benchmark.

### 4. LFU (Least Frequently Used)
- **Logic:** Replaces the page with the smallest reference count.
- **Behavior:** Good for keeping frequently used pages, but slow to adapt if usage patterns change.

### 5. Clock (Second Chance)
- **Logic:** Uses a circular buffer and a "reference bit". If a page's bit is 1, it gets a "second chance" (bit set to 0) and the pointer moves. If 0, it is replaced.
- **Behavior:** Efficient approximation of LRU with low overhead.

## ⚠️ Thrashing Demonstration

Click the **"Enable Thrashing Mode"** button to automatically generate a reference string designed to cause **Thrashing**.
- **What is Thrashing?** A state where the system spends more time paging (swapping data in/out) than executing processes.
- **Result:** You will see a very low Hit Ratio and constant red flashes in the visualization.

## 📱 Android Memory Comparison

This project addresses **Objective 3** by comparing standard OS paging with Android's unique approach.

| Feature | Standard Paging (Simulated) | Android Mechanisms |
| :--- | :--- | :--- |
| **Replacement** | Swap to Disk/SSD | **zRAM** (Compressed RAM) |
| **Memory Full** | Slow down due to I/O | **LMK** (Kill Background Apps) |
| **Goal** | Virtual Memory Expansion | Responsiveness & Battery Life |

### Low Memory Killer (LMK)
Android does not always swap to disk. When memory is critical, the LMK service kills background processes based on an "OOM Score" to free up RAM instantly for the foreground app.

### zRAM
Android creates a compressed block device in RAM. Instead of writing pages to slow flash storage, the OS compresses them and keeps them in RAM. This trades CPU cycles for faster memory access.

## 📂 Project Structure

text
memory-simulator/
├── index.html          # Main UI
├── style.css           # Visual styles & animations
├── script.js           # Algorithm logic
└── README.md           # Documentation


## 👨‍💻 Author

**Afifa Zain Apurba**
- **Email:** afifa.zain@northsouth.edu
- **Institution:** North South University

---
*Built for Educational Purposes | Operating Systems Project*


### 4. How to Demonstrate This Project

1.  **Start with Basics:** Input `7, 0, 1, 2, 0, 3, 0, 4` with **3 Frames**.
2.  **Run FIFO:** Show how `7` is replaced first even if it might be needed soon.
3.  **Run LRU:** Show how the algorithm is smarter by keeping recently used pages.
4.  **Run Optimal:** Show that this has the fewest faults (theoretical best).
5.  **Thrashing Demo:** Click the **Thrashing Button**. Explain: *"If we try to run too many processes (pages) with too little RAM (frames), the CPU spends all its time swapping data. This is Thrashing."*
6.  **Android Section:** Point to the bottom section. Explain: *"Unlike our simulator which swaps to disk, Android uses zRAM (compression) and LMK (killing apps) to stay fast on mobile devices."*

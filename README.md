# 🎓 PDA Visualizer — Pushdown Automata Simulator

> **An interactive Next.js web application for visualizing and simulating Pushdown Automata (PDAs).**

![Status](https://img.shields.io/badge/status-production%20ready-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📖 Table of Contents

- [Quick Start](#-quick-start)
- [Features](#-features)
- [How to Use](#-how-to-use)
- [Configuration Guide](#-configuration-guide)
- [Examples](#-examples)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to **[http://localhost:3000](http://localhost:3000)**

---

## Features

| Feature | Description |
|---------|-------------|
|  **Visual State Diagram** | Canvas-based state machine with animated transitions |
|  **Stack Visualization** | Real-time stack operations (push/pop) |
|  **Input Tape Display** | Track read head position as input is consumed |
|  **Auto-Generate** | Create PDAs from natural language descriptions |
|  **Manual Configuration** | Fully editable states, alphabets, and transitions |
|  **Step Log** | Detailed explanation of each simulation step |
| 🌓 **Dark/Light Theme** | Toggle for comfortable viewing |
| ⌨️ **Keyboard Shortcuts** | Fast controls without mouse |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |

---

## 📖 How to Use

### Method 1: Use Pre-loaded Examples (Easiest)

1. **Click any example card** in the left sidebar:
   - **Balanced Parentheses** — for `()`, `(())`, etc.
   - **aⁿbⁿ Language** — for equal a's then b's
   - **wcwᴿ Palindrome** — for mirrored strings with center marker

2. **Enter test string** in the "Test String" input field

3. **Click ▶ Play** to run simulation

4. **Watch the result** — Green = ACCEPTED, Red = REJECTED

---

### Method 2: Auto-Generate from Description

1. In **Quick Builder** section, type a description:
   - `"balanced parentheses"`
   - `"equal number of a's and b's"`
   - `"palindrome with center marker"`

2. Click **⚡ Auto-Generate**

3. The PDA is created automatically!

4. Enter test string and click **▶ Play**

---

### Method 3: Manual Configuration (Full Control)

#### Step 1: Define States
In **Configuration** section:
- **States:** `a0, a1, a2*` (use `*` for accept states)
- **Input Alphabet:** `a, b, c`
- **Stack Alphabet:** `Z0, A, B`
- Click **💾 Update Configuration**

#### Step 2: Add Transitions
In **Add Transition** section:
- **From:** `a0`
- **Read:** `a` (or `ε` for epsilon)
- **Pop:** `Z0` (or `ε` for no pop)
- **Push:** `AZ0` (or leave empty for no push)
- **To:** `a0`
- Click **Add**

#### Step 3: Test
- Enter test string
- Click **▶ Play**

---

## ⚙️ Configuration Guide

### Understanding Transitions

Each transition has 5 parts:

```
δ(from_state, read_symbol, pop_symbol) → (to_state, push_symbols)
```

**Example:** `δ(a0, a, Z0) → (a0, AZ0)`

| Part | Meaning | Example |
|------|---------|---------|
| **From** | Current state | `a0` |
| **Read** | Symbol from input | `a` or `ε` (epsilon) |
| **Pop** | Symbol to remove from stack | `Z0` or `ε` |
| **To** | Next state | `a0` |
| **Push** | Symbols to add to stack | `AZ0` or `ε` |

### Epsilon (ε) Transitions

- **ε Read:** Don't consume input (automatic transition)
- **ε Pop:** Don't remove from stack (peek only)
- **ε Push:** Don't add to stack (stack unchanged)

### Stack Operations

| Operation | Pop | Push | Effect |
|-----------|-----|------|--------|
| Push A | ε | A | Add A on top |
| Pop A | A | ε | Remove A |
| Replace A with B | A | B | Swap symbols |
| No change | ε | ε | Stack unchanged |

---

## 📚 Examples

### Example 1: Balanced Parentheses ✅

**Language:** All strings with properly nested parentheses

**Configuration:**
- States: `q0, q1, q2*`
- Input Alphabet: `(, )`
- Stack Alphabet: `Z0, A`

**Test Cases:**
| Input | Result | Explanation |
|-------|--------|-------------|
| `(())` | ✅ ACCEPTED | Properly nested |
| `()()` | ✅ ACCEPTED | Two balanced pairs |
| `(()` | ❌ REJECTED | Missing closing paren |
| `())` | ❌ REJECTED | Extra closing paren |

---

### Example 2: aⁿbⁿ Language ✅

**Language:** Equal number of a's followed by equal number of b's

**Configuration:**
- States: `q0, q1, q2*`
- Input Alphabet: `a, b`
- Stack Alphabet: `Z0, A`

**Test Cases:**
| Input | Result | Explanation |
|-------|--------|-------------|
| `aabb` | ✅ ACCEPTED | 2 a's, 2 b's |
| `aaabbb` | ✅ ACCEPTED | 3 a's, 3 b's |
| `ab` | ✅ ACCEPTED | 1 a, 1 b |
| `aaab` | ❌ REJECTED | 3 a's, only 1 b |
| `abab` | ❌ REJECTED | a's and b's mixed |

---

### Example 3: wcwᴿ Palindrome ✅

**Language:** String, center marker `c`, then reverse of string

**Configuration:**
- States: `q0, q1, q2*`
- Input Alphabet: `a, b, c`
- Stack Alphabet: `Z0, A, B`

**Test Cases:**
| Input | Result | Explanation |
|-------|--------|-------------|
| `abcba` | ✅ ACCEPTED | `ab` + `c` + `ba` |
| `aacaa` | ✅ ACCEPTED | `a` + `c` + `a` |
| `abacaba` | ✅ ACCEPTED | `aba` + `c` + `aba` |
| `abcd` | ❌ REJECTED | No center marker |
| `abccba` | ❌ REJECTED | Extra `c` |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Step forward |
| `P` | Play / Pause |
| `R` | Reset simulation |

---

## 🎨 UI Components

### Sidebar (Left)
- **Quick Builder** — Auto-generate PDAs from descriptions
- **Examples** — Pre-loaded PDAs to try
- **Configuration** — Edit states and alphabets
- **Add Transition** — Create custom transitions
- **Transitions List** — View all transitions

### Main Area (Center)
- **Result Banner** — Shows ACCEPTED/REJECTED status
- **State Diagram** — Visual representation of PDA
- **Stack Panel** — Shows stack contents (bottom to top)
- **Input Tape** — Shows input with current position
- **Simulation Controls** — Play, Step, Reset, Speed
- **Step Log** — Detailed step-by-step explanation

---

## 🛠️ Troubleshooting

### Can't Type in Input Fields
**Solution:** Refresh the page (Ctrl+Shift+R or Ctrl+F5)

### State Diagram Not Updating
**Solution:** 
1. Click **💾 Update Configuration** after changing states
2. Wait 1-2 seconds for canvas to redraw

### Simulation Not Starting
**Solution:**
1. Make sure an example is loaded OR configuration is set
2. Enter a test string
3. Click ▶ Play button

### Transitions Not Working
**Solution:**
1. Check that state names match exactly (case-sensitive)
2. Use `ε` for epsilon transitions
3. Ensure stack alphabet includes all symbols used

### Canvas Shows Blank
**Solution:**
1. Click **🗑️ Clear All** then load an example
2. Or add states and click **Update Configuration**

---

## 📁 Project Structure

```
pda-visualizer/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with fonts
│   │   ├── page.tsx        # Main PDA Visualizer component
│   │   └── globals.css     # Global styles
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🖥️ Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS Variables
- **Visualization:** HTML5 Canvas API
- **Fonts:** Space Grotesk (UI) + JetBrains Mono (code)

---

## 🎯 Tips for Success

1. **Start with examples** — They're guaranteed to work
2. **Use Step mode** — To understand how transitions work
3. **Watch the Step Log** — Explains each transition in plain English
4. **Customize state names** — Use `a0`, `s1`, `state_A` — anything works!
5. **Clear All** — Use this to start fresh with your own PDA

---

## 📄 License

MIT License — Open source for educational purposes.

---

## 🙋 Need Help?

1. **Check EXAMPLES.md** — Sample data with exact configurations
2. **Try the examples** — Click example cards in sidebar
3. **Read Step Log** — Shows exactly what's happening
4. **Clear All + Reload** — Fixes most issues

---

**Happy Automata Learning! 🎓**

For more examples and test cases, see **[EXAMPLES.md](./EXAMPLES.md)**

<div align="center">

# 🎰 Lucky Draw

**A modern web-based lottery drawing application with three powerful modes.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white)](https://pages.github.com/)

<br>

[![Tests](https://img.shields.io/badge/tests-80%20passing-brightgreen?style=flat-square)](#testing)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#contributing)

<br>

**[Live Demo](https://scmlewis.github.io/lottery_tool/)** · **[Report Bug](https://github.com/scmlewis/lottery_tool/issues)** · **[Request Feature](https://github.com/scmlewis/lottery_tool/issues)**

</div>

---

## Features

### 🎡 Wheel Mode
- Create a lucky wheel with custom items
- Spin and draw random winners
- Remove winners after each draw option
- Track winner history with batch display

### 🎲 Number Mode
- Draw random numbers within a custom range
- Adjustable "Times Drawn" slider (1–20) for batch draws
- Exclude previously drawn numbers option
- Individual number box reveal animations
- Draw record history with grouped batches

### 👥 Group Mode
- Divide people into groups with two strategies:
  - **By Size** — Each group has N members
  - **By Count** — Divide into K equal groups
- Shuffle members before grouping
- Export groups as CSV
- Visual group cards with colored headers

### ✨ Across All Modes
- 🌙 Dark glassmorphism theme with per-mode accent colors
- 📱 Fully responsive design
- 💾 LocalStorage persistence (data saved in browser)
- ⚡ Smooth animations and transitions
- 🖥️ Fullscreen display mode for ceremonies
- 🔊 Sound effects and confetti
- 🧪 80 automated tests

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Markup** | Semantic HTML5 |
| **Styling** | CSS3 — Glassmorphism, gradients, flexbox, grid, animations |
| **Logic** | Vanilla JavaScript (ES modules, zero dependencies) |
| **Rendering** | Canvas API (wheel visualization) |
| **Persistence** | LocalStorage |
| **Testing** | Node.js built-in test runner (`node --test`) |
| **Hosting** | GitHub Pages |

---

## Quick Start

**[Open the app](https://scmlewis.github.io/lottery_tool/)** in any modern browser — no installation required!

1. **Wheel Mode** → Add items, click **Start Draw** to spin
2. **Number Mode** → Set range, adjust slider, click **Start Draw**
3. **Group Mode** → Add members, choose strategy, click **Start Grouping**

### Local Development

```bash
# Clone the repository
git clone https://github.com/scmlewis/lottery_tool.git
cd lottery_tool

# Start local server
node serve.js

# Open http://localhost:8080
```

---

## Project Structure

```
lottery_tool/
├── index.html              # Single-page app (all HTML)
├── styles.css              # All styles (glassmorphism dark theme)
├── js/
│   ├── app.js              # Main wiring, event listeners, list management
│   ├── state.js            # Shared state object and helpers
│   ├── storage.js          # LocalStorage persistence
│   ├── utils.js            # Utilities (shuffle, parse, debounce, toast)
│   ├── wheel.js            # Canvas wheel rendering and spin animation
│   ├── number.js           # Number draw logic, history, and lifecycle
│   ├── group.js            # Group management, algorithms, and CSV export
│   └── display.js          # Fullscreen mode, audio, confetti, overlay
├── tests/
│   ├── unit/               # Unit tests (utils, storage, state, group)
│   └── integration/        # Integration tests (number draw lifecycle)
├── serve.js                # Local development server (port 8080)
├── package.json            # Test runner configuration
└── .github/workflows/
    └── deploy.yml          # GitHub Pages deployment
```

---

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
node --test tests/integration/pickNumber.test.js
```

**80 tests** covering:
- Utility functions (shuffle, parse, debounce)
- Storage layer (get, save, settings)
- Grouping algorithms (by size, by count, preview)
- Number draw lifecycle (Promise API, persistence, exclude logic)

---

## Browser Compatibility

| Browser | Version |
|---------|---------|
| Chrome / Edge | 88+ |
| Firefox | 85+ |
| Safari | 14+ |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for random selection and group division tasks.**

</div>

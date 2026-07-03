# Lottery Tool 🎰

A web-based lottery drawing application with three powerful modes for different use cases.

## Features

### 🎡 Wheel Mode
- Create a lucky wheel with custom items
- Spin and draw random winners
- Option to remove winners after each draw
- Track winner history

### 🎲 Number Mode
- Draw random numbers within a custom range
- Adjust "Times Drawn" slider (1-20) to draw multiple numbers simultaneously
- Individual number box animations
- Batch history display showing grouped draws
- Exclude previously drawn numbers option

### 👥 Group Mode
- Divide people into groups quickly
- Two grouping strategies:
  - **By Size**: Each group has N members
  - **By Count**: Divide into K equal groups
- Shuffle members before grouping
- Export groups as CSV
- Visual group cards with colored headers and member avatars

## How to Use

Visit: **https://scmlewis.github.io/lottery_tool/**

Simply open the link in any modern web browser - no installation required!

### Quick Start

1. **Wheel Mode**: Add items, click "Start Draw" to spin
2. **Number Mode**: Set range, adjust "Times Drawn" slider, click start
3. **Group Mode**: Add members, choose grouping mode, click "Start Grouping"

## Features Highlights

- 🎨 Dark theme with teal accent colors
- 📱 Responsive design
- 💾 Local storage persistence (data saved in browser)
- ⚡ Smooth animations and transitions
- 🌐 No backend required - pure frontend

## Technical Stack

- **HTML5** - Semantic markup
- **CSS3** - Animations, gradients, flexbox, grid
- **Vanilla JavaScript** - No dependencies
- **Canvas API** - Wheel visualization
- **LocalStorage** - Data persistence

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## Files

- `index.html` - Main application file (contains all HTML, CSS, and JavaScript)
- `js/state.js` - State management and shared state object
- `js/storage.js` - LocalStorage persistence for lists and settings
- `js/wheel.js` - Canvas wheel rendering and spin animation
- `js/number.js` - Random number draw logic and history
- `js/group.js` - Group member management and CSV export
- `js/display.js` - Display mode, fullscreen, audio, confetti, and winner overlay
- `js/app.js` - Main app wiring, event listeners, and list management
- `js/utils.js` - Shared utilities (shuffle, parse, toast)
- `serve.js` - Optional local development server
- `.nojekyll` - GitHub Pages configuration

---

Built with ❤️ for random selection and group division tasks.

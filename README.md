# 🎥 Happy Recorder 3D





> An open-source Windows screen recorder with a joyful 3D interface.

**Happy Recorder 3D** is a Windows screen recording application designed to make recording, editing, tutorials, and developer workflows simple and enjoyable through a modern 3D interface.

---

## 📑 Table of Contents

* [✨ Features](#-features)
* [🚀 Quick Start](#-quick-start)

  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Development](#development)
* [🎯 Recording Modes](#-recording-modes)
* [🏗️ Architecture](#️-architecture)
* [🛠️ Technology Stack](#️-technology-stack)
* [📁 Project Structure](#-project-structure)
* [📝 Development Roadmap](#-development-roadmap)
* [🤝 Contributing](#-contributing)
* [🔒 Security](#-security)
* [📄 License](#-license)
* [🙏 Acknowledgments](#-acknowledgments)
* [📧 Contact](#-contact)

---

## ✨ Features

* 🎥 Screen, window, region, and monitor recording
* 📷 Camera recording with customizable position and size
* 🎙️ Microphone and system audio capture
* 🎵 Background music with trim, fade, and loop support
* ✂️ Lightweight video editor with trim, cut, split, crop, and speed controls
* 🌌 3D interface with Three.js visual effects and animations
* 📚 Built-in recording and editing tutorials
* 💻 Code snapshots with timestamps
* 🔀 Instant project and code snapshot forking
* ⏱️ No artificial recording-time limit
* 🆓 Free and open source

---

## 🚀 Quick Start

### Prerequisites

Before installing Happy Recorder 3D, make sure you have:

* **Node.js** v18 or later
* **npm** or **Yarn**
* **Windows 10 or Windows 11**
* **Visual Studio 2022** with the C++ workload installed

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/aldane-dev-create/happy-recorder-3d.git
cd happy-recorder-3d

npm install
```

Start the Windows application:

```bash
npm run windows
```

### Development

Start the Metro bundler:

```bash
npm start
```

Run the Windows application:

```bash
npm run windows
```

Run tests:

```bash
npm test
```

Lint the project:

```bash
npm run lint
```

Format the code:

```bash
npm run format
```

---

## 🎯 Recording Modes

| Mode           | Description                                  |
| -------------- | -------------------------------------------- |
| **Normal**     | Everyday screen recording                    |
| **Tutorial**   | Teaching with cursor effects and zoom        |
| **Project**    | School and work projects with metadata       |
| **Bug Report** | Developer-focused bug recording and tracking |

---

## 🏗️ Architecture

```text
                    HAPPY RECORDER 3D
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
           RECORD        EDIT        LIBRARY
              │            │
              └────────────┤
                           ↓
                        THREE.JS
```

The application is organized around three main areas:

* **Record** — Capture the screen, camera, microphone, and system audio.
* **Edit** — Make lightweight changes to recorded videos.
* **Library** — Manage recordings, projects, and snapshots.

Three.js provides the visual 3D layer used throughout the application.

---

## 🛠️ Technology Stack

| Technology                   | Purpose                              |
| ---------------------------- | ------------------------------------ |
| **React Native**             | Application UI                       |
| **React Native for Windows** | Windows desktop support              |
| **TypeScript**               | Type-safe application logic          |
| **Three.js**                 | 3D graphics, effects, and animations |
| **Native Windows APIs**      | Screen, camera, and audio capture    |

---

## 📁 Project Structure

```text
happy-recorder-3d/
├── src/
│   ├── screens/       # Main application screens
│   ├── components/    # Reusable UI components
│   ├── recording/     # Recording functionality
│   ├── editor/        # Video editing functionality
│   ├── three/         # Three.js 3D features
│   ├── services/      # Storage and native services
│   └── data/          # Static data and tutorials
│
├── windows/            # React Native Windows files
├── assets/             # Icons, music, and 3D assets
├── tests/              # Unit tests
│
├── CONTRIBUTING.md     # Contribution guidelines
├── SECURITY.md         # Security policy
├── LICENSE             # Project license
└── README.md           # Project documentation
```

---

## 📝 Development Roadmap

### v0.1 — MVP

* [x] 3D UI
* [x] Screen recording
* [x] Camera and microphone support
* [x] Recording library

### v0.2 — Editor

* [ ] Basic editor with trim and cut
* [ ] Background music
* [ ] Crop and playback speed controls

### v0.3 — Recording Modes

* [ ] Tutorial mode
* [ ] Project mode
* [ ] Bug Report mode
* [ ] Cursor and click effects

### v0.4 — 3D Features

* [ ] 3D elements and animations
* [ ] Enhanced 3D interface
* [ ] Additional visual effects

### v0.5 — Developer Features

* [ ] Code snapshots
* [ ] Project snapshots
* [ ] Fork and export functionality
* [ ] Timestamped development snapshots

### v1.0 — Production

* [ ] Stable recording and editing
* [ ] Microsoft Store packaging
* [ ] Complete documentation
* [ ] Production-ready release

---

## 🤝 Contributing

Contributions are welcome!

Please see [`CONTRIBUTING.md`](CONTRIBUTING.md) for contribution guidelines.

### Contribution Workflow

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes:

```bash
git commit -m "Add amazing feature"
```

4. Push your branch:

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request.

---

## 🔒 Security

Please refer to [`SECURITY.md`](SECURITY.md) for security policies and instructions for reporting vulnerabilities.

---

## 📄 License

Happy Recorder 3D is licensed under the **MIT License**.

See the [`LICENSE`](LICENSE) file for the full license text.

---

## 🙏 Acknowledgments

* [Three.js](https://threejs.org/) — 3D graphics and rendering
* [React Native](https://reactnative.dev/) — Application UI
* [React Native for Windows](https://microsoft.github.io/react-native-windows/) — Windows desktop support
* [Microsoft](https://www.microsoft.com/) — Windows APIs and development tools

---

## 📧 Contact

**GitHub Issues:** [Open an issue](https://github.com/aldane-dev-create/happy-recorder-3d/issues)

**Email:** [happy.recorder@example.com](mailto:happy.recorder@example.com)

---

<div align="center">

Made with ❤️ by **Aldane Hutchinson**

</div>

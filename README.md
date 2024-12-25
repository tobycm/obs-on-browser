# OBB - OBS on the Browser

Try it now at: [obb.tobycm.dev](https://obb.tobycm.dev)

Demo: [https://youtu.be/6pOYhUaqFQc](https://youtu.be/6pOYhUaqFQc)

## 💪 Features

- ✅ Lightweight
- ✅ Fast
- ✅ Simple UI

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh)
- [FFmpeg](https://ffmpeg.org)

### 0. Install ffmpeg

Debian/Ubuntu:

```sh
sudo apt install ffmpeg
```

Arch Linux:

```sh
sudo pacman -S ffmpeg
```

### 1. Clone the repository

```sh
git clone https://github.com/tobycm/obb
```

### 2. Install dependencies

```sh
cd web
bun i
cd ..

cd server
bun i
cd ..
```

### 3. Run the development server

```sh
cd web
bun run dev
```

in another terminal

```sh
cd server
bun run dev
```

Live at [localhost:5173](http://localhost:5173)

### 4. Build for production (web-only, optional)

```sh
cd web
bun run build
```

Files are output to the `web/dist` directory.

## 📚 Tech Stack

- [Bun](https://bun.sh) JavaScript Runtime
- [Vite](https://vitejs.dev) Build Tool
- [TypeScript](https://www.typescriptlang.org) Language
- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) Markup Language
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) Styling

## 📝 License

This project is licensed under the MIT License - see the [`LICENSE`](LICENSE) file for details.

## 🤝 Contributions

Any contribution is appreciated. Just create an issue/pull request and I will review it ASAP.

## 🔗 Share this project

If you like this project, please give it a ⭐ and share it with your friends!

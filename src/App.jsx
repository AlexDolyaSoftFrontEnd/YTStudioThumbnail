// commit: основной компонент приложения

import "./app.css";
import VideoThumbnail from "./components/YTStudioThumbnail/YTStudioThumbnail";

export default function App() {
  return (
    <main className="app">
      <VideoThumbnail />
    </main>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./YTStudioThumbnail.css";

const WIDTH = 1280;
const HEIGHT = 720;

export default function VideoEditor() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const chunksRef = useRef([]);

  const [videoFile, setVideoFile] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [exporting, setExporting] = useState(false);

  const videoUrl = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : null),
    [videoFile]
  );

  useEffect(() => {
    return () => videoUrl && URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, WIDTH, HEIGHT);
    } else {
      ctx.fillStyle = "var(--bg-canvas)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    if (video && video.readyState >= 2) {
      const scale = Math.max(
        WIDTH / video.videoWidth,
        HEIGHT / video.videoHeight
      );

      const w = video.videoWidth * scale;
      const h = video.videoHeight * scale;
      const x = (WIDTH - w) / 2;
      const y = (HEIGHT - h) / 2;

      ctx.drawImage(video, x, y, w, h);
    }
  }, [bgImage]);

  useEffect(() => {
    let raf;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  const exportVideo = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const stream = new MediaStream([
      ...canvas.captureStream(60).getVideoTracks(),
      ...video.captureStream().getAudioTracks(),
    ]);

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
      videoBitsPerSecond: 6_000_000,
    });

    chunksRef.current = [];

    recorder.ondataavailable = (e) =>
      e.data.size && chunksRef.current.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: "video/webm",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "video-export.webm";
      a.click();

      URL.revokeObjectURL(url);
      setExporting(false);
    };

    recorder.start();
    video.currentTime = 0;
    video.play();
    setExporting(true);

    video.onended = () => recorder.stop();
  };

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <label className="editor-btn">
          Upload Video
          <input
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => setVideoFile(e.target.files[0])}
          />
        </label>

        <label className="editor-btn">
          Background video
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const img = new Image();
              img.onload = () => setBgImage(img);
              img.src = URL.createObjectURL(e.target.files[0]);
            }}
          />
        </label>

        <button
          className="editor-btn editor-btn--primary"
          onClick={exportVideo}
          disabled={!videoFile || exporting}
        >
          {exporting ? "Exporting…" : "Download video"}
        </button>
      </div>

      <div className="editor-preview">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="editor-canvas"
        />
        <video
          ref={videoRef}
          src={videoUrl || undefined}
          className="editor-video"
          controls
        />
      </div>
    </div>
  );
}

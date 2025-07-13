import React, { useRef, useEffect, useState } from "react";
import axios from "axios";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [allImages, setAllImages] = useState([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
        };
      })
      .catch((err) => {
        console.error("Camera error:", err);
      });

    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await axios.get(
        "https://camera-capture-app-5lx6.onrender.com/all-images"
      );
      setAllImages(res.data);
    } catch (err) {
      console.error("Failed to fetch images:", err);
    }
  };

  const handleCapture = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");

    try {
      const res = await axios.post(
        "https://camera-capture-app-5lx6.onrender.com/all-images",
        {
          imageData,
        }
      );
      setAllImages((prev) => [
        ...prev,
        { filename: res.data.filename, url: res.data.imageUrl },
      ]);
    } catch (err) {
      console.error("Failed to save image:", err);
    }
  };

  const deleteImage = async (filename) => {
    try {
      await axios.delete(
        `https://camera-capture-app-5lx6.onrender.com/delete-image/${filename}`
      );
      setAllImages((prev) => prev.filter((img) => img.filename !== filename));
    } catch (err) {
      console.error("Failed to delete image:", err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>📸 Live Camera Feed & Snapshot Saver</h1>

      <video ref={videoRef} style={styles.video} />
      <br />
      <button onClick={handleCapture} style={styles.captureBtn}>
        📷 Capture Frame
      </button>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {allImages.length > 0 && (
        <div style={styles.galleryContainer}>
          <h2 style={styles.subheading}>🖼 Saved Snapshots</h2>
          <div style={styles.grid}>
            {allImages.map((img) => (
              <div key={img.filename} style={styles.card}>
                <img src={img.url} alt="Snapshot" style={styles.image} />
                <button
                  onClick={() => deleteImage(img.filename)}
                  style={styles.deleteBtn}
                >
                  🗑 Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "2rem",
    fontFamily: "Segoe UI, sans-serif",
    backgroundColor: "#f4f4f4",
    minHeight: "100vh",
  },
  heading: {
    color: "#333",
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  video: {
    width: "90%",
    maxWidth: "600px",
    borderRadius: "12px",
    border: "4px solid #333",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  captureBtn: {
    marginTop: "1rem",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
  },
  galleryContainer: {
    marginTop: "3rem",
  },
  subheading: {
    color: "#444",
    marginBottom: "1rem",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    width: "200px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  image: {
    width: "100%",
    borderRadius: "8px",
    objectFit: "cover",
  },
  deleteBtn: {
    marginTop: "10px",
    padding: "0.5rem 1rem",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default App;

// ImageProcessor.jsx
import { useRef, useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import './ImageProcessor.css';

const ImageProcessor = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fps, setFps] = useState(0);
  const [model, setModel] = useState(null);
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
      } catch (err) {
        console.error('Error loading model:', err);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    let stream = null;
    let animationFrame = null;
    let lastTimestamp = 0;
    let frameCount = 0;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    const detectObjects = async (video, ctx) => {
      if (!model) return [];
      
      const predictions = await model.detect(video);
      
      predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x, y - 20, prediction.class.length * 10, 20);
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText(
          `${prediction.class} ${Math.round(prediction.score * 100)}%`,
          x, 
          y - 5
        );
      });

      return predictions;
    };

    const processFrame = async (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      frameCount++;

      if (timestamp - lastTimestamp >= 1000) {
        setFps(Math.round(frameCount * 1000 / (timestamp - lastTimestamp)));
        frameCount = 0;
        lastTimestamp = timestamp;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const newDetections = await detectObjects(video, ctx);
        setDetections(newDetections);
      }

      if (isProcessing) {
        animationFrame = requestAnimationFrame(processFrame);
      }
    };

    if (isProcessing) {
      startCamera();
      animationFrame = requestAnimationFrame(processFrame);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isProcessing, model]);

  return (
    <div className="container">
      <div className="video-container">
        <video ref={videoRef} className="hidden-video" autoPlay playsInline />
        <canvas ref={canvasRef} width={640} height={480} className="video-canvas" />
        <div className="fps-counter">{fps} FPS</div>
      </div>

      <div className="controls">
        <button
          onClick={() => setIsProcessing(!isProcessing)}
          className="control-button"
          disabled={!model}
        >
          <Camera className="button-icon" />
          <span>{isProcessing ? 'Stop' : 'Start'} Processing</span>
        </button>
      </div>

      <div className="detections">
        <h3 className="detections-title">Detected Objects:</h3>
        <div className="detections-list">
          {detections.map((det, idx) => (
            <div key={idx} className="detection-item">
              {det.class} - Confidence: {Math.round(det.score * 100)}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageProcessor;
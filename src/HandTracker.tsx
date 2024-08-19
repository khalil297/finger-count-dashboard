import React, { useRef, useEffect, useState } from 'react';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs';

const HandTracker: React.FC<{ onFingerCountChange: (count: number) => void }> = ({ onFingerCountChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [model, setModel] = useState<handpose.HandPose | null>(null);
  const [lastRecordedTime, setLastRecordedTime] = useState<number>(0);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await handpose.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const countFingers = (landmarks: number[][]) => {
    let fingerCount = 0;

    // Thumb: Check if it's above the palm
    if (landmarks[4][1] < landmarks[3][1]) fingerCount++;

    // Other fingers: Check if the tip is above the joint
    for (let i = 8; i <= 20; i += 4) {
      if (landmarks[i][1] < landmarks[i - 2][1]) fingerCount++;
    }

    return fingerCount;
  };

  const handleVideoOnPlay = () => {
    let lastTimestamp = Date.now();
    const interval = 1000; // 2 seconds

    const detectHands = async () => {
      if (model && videoRef.current) {
        const predictions = await model.estimateHands(videoRef.current);

        if (predictions.length > 0) {
          const fingers = countFingers(predictions[0].landmarks);
          const currentTime = Date.now();
          
          // Record data every 2 seconds
          if (currentTime - lastTimestamp >= interval) {
            onFingerCountChange(fingers);
            setLastRecordedTime(currentTime);
            lastTimestamp = currentTime;
          }
        } else {
          // No hand detected
          const currentTime = Date.now();
          if (currentTime - lastTimestamp >= interval) {
            onFingerCountChange(0);
            setLastRecordedTime(currentTime);
            lastTimestamp = currentTime;
          }
        }
      }
      requestAnimationFrame(detectHands);
    };
    detectHands();
  };

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        videoRef.current!.srcObject = stream;
        videoRef.current!.addEventListener('loadeddata', () => {
          videoRef.current!.play().then(() => {
            handleVideoOnPlay();
          }).catch((error) => console.error('Video play was interrupted:', error));
        });
      });
    }
  }, [model]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <video ref={videoRef} style={{ width: '640px', height: '480px', borderRadius: '8px', border: '2px solid #ccc' }} />
    </div>
  );
};

export default HandTracker;

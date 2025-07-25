import React, { useRef, useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, LinearProgress } from '@mui/material';

import courseConfig from '../../config/courseConfig';

interface VideoMeditationTestProps {
  maxDurationMinutes?: number; // default 60
  onComplete: (result: any) => void;
  onCancel: () => void;
}

// Helper: Calculate eye aspect ratio (EAR) for eye closure detection
/**
 *
 * @param landmarks
 * @param left
 */
function getEAR(landmarks: any, left: boolean) {
  const idx = left ? [33, 160, 158, 133, 153, 144] : [362, 385, 387, 263, 373, 380];
  const p = idx.map((i) => landmarks[i]);
  if (p.some((x) => !x)) return 0;
  /**
   *
   * @param a
   * @param b
   */
  const dist = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);
  const ear = (dist(p[1], p[5]) + dist(p[2], p[4])) / (2 * dist(p[0], p[3]));
  return ear;
}

/**
 *
 * @param root0
 * @param root0.maxDurationMinutes
 * @param root0.onComplete
 * @param root0.onCancel
 */
const VideoMeditationTest: React.FC<VideoMeditationTestProps> = ({
  maxDurationMinutes = 60,
  onComplete,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permission, setPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [recording, setRecording] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  // Metrics
  const [eyeClosedPercent, setEyeClosedPercent] = useState(0);
  const [headMovement, setHeadMovement] = useState(0);
  const [handStability, setHandStability] = useState(0);
  // Time series for analytics
  const [metrics, setMetrics] = useState<any[]>([]);

  // For movement tracking
  const lastHeadPos = useRef<{ x: number; y: number } | null>(null);
  const totalHeadMovement = useRef(0);
  const lastHandPos = useRef<{ x: number; y: number }[]>([]);
  const totalHandMovement = useRef(0);
  const eyeClosedFrames = useRef(0);
  const totalFrames = useRef(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (recording && startTime) {
      timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [recording, startTime]);

  React.useEffect(() => {
    if (elapsed >= maxDurationMinutes * 60 && recording) {
      handleStop();
    }
  }, [elapsed, recording, maxDurationMinutes]);

  // --- MediaPipe setup ---
  React.useEffect(() => {
    if (!recording || !videoRef.current) return;
    let faceMesh: any = null;
    let hands: any = null;
    let raf: number;
    let running = true;

    /**
     *
     */
    async function setup() {
      // Dynamic import for MediaPipe modules
      const [{ FaceMesh }, { Hands }] = await Promise.all([
        import('@mediapipe/face_mesh'),
        import('@mediapipe/hands'),
      ]);
      // FaceMesh
      faceMesh = new FaceMesh({
        /**
         *
         * @param file
         */
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      await faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      await faceMesh.initialize();
      // Hands
      hands = new Hands({
        /**
         *
         * @param file
         */
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      await hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      await hands.initialize();
      // Start loop
      processFrame();
    }

    /**
     *
     */
    async function processFrame() {
      if (!videoRef.current || !running) return;
      const video = videoRef.current;
      // Draw to canvas for overlay
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }
      // FaceMesh
      if (faceMesh) {
        await faceMesh.send({ image: video });
        faceMesh.onResults((res: any) => {
          if (res.multiFaceLandmarks && res.multiFaceLandmarks.length > 0) {
            const landmarks = res.multiFaceLandmarks[0];
            // Eye closure
            const leftEAR = getEAR(landmarks, true);
            const rightEAR = getEAR(landmarks, false);
            const eyesClosed = leftEAR < 0.18 && rightEAR < 0.18; // threshold
            totalFrames.current++;
            if (eyesClosed) eyeClosedFrames.current++;
            // Head movement
            const nose = landmarks[1];
            if (nose) {
              if (lastHeadPos.current) {
                const dist = Math.hypot(
                  nose.x - lastHeadPos.current.x,
                  nose.y - lastHeadPos.current.y,
                );
                totalHeadMovement.current += dist;
              }
              lastHeadPos.current = { x: nose.x, y: nose.y };
            }
          }
        });
      }
      // Hands
      if (hands) {
        await hands.send({ image: video });
        hands.onResults((res: any) => {
          if (res.multiHandLandmarks && res.multiHandLandmarks.length > 0) {
            const handCenters = res.multiHandLandmarks.map((landmarks: any) => {
              // Use wrist (0) as hand center
              return landmarks[0];
            });
            if (handCenters.length > 0) {
              if (lastHandPos.current.length === handCenters.length) {
                handCenters.forEach((h: any, i: number) => {
                  const prev = lastHandPos.current[i];
                  if (prev) {
                    const dist = Math.hypot(h.x - prev.x, h.y - prev.y);
                    totalHandMovement.current += dist;
                  }
                });
              }
              lastHandPos.current = handCenters;
            }
          }
        });
      }
      // Update metrics every second
      if (totalFrames.current > 0 && totalFrames.current % 30 === 0) {
        const eyeClosedPct = (eyeClosedFrames.current / totalFrames.current) * 100;
        setEyeClosedPercent(eyeClosedPct);
        setHeadMovement(totalHeadMovement.current);
        setHandStability(1 / (1 + totalHandMovement.current)); // Lower movement = higher stability
        setMetrics((m) => [
          ...m,
          {
            t: elapsed,
            eyeClosed: eyeClosedPct,
            headMove: totalHeadMovement.current,
            handMove: totalHandMovement.current,
          },
        ]);
      }
      raf = requestAnimationFrame(processFrame);
    }
    setup();
    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      if (faceMesh && faceMesh.close) faceMesh.close();
      if (hands && hands.close) hands.close();
    };
  }, [recording]);

  /**
   *
   */
  const handleStart = async () => {
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(mediaStream);
      setPermission('granted');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setRecording(true);
      setStartTime(Date.now());
      setElapsed(0);
      // Reset metrics
      setEyeClosedPercent(0);
      setHeadMovement(0);
      setHandStability(0);
      setMetrics([]);
      lastHeadPos.current = null;
      totalHeadMovement.current = 0;
      lastHandPos.current = [];
      totalHandMovement.current = 0;
      eyeClosedFrames.current = 0;
      totalFrames.current = 0;
    } catch (err) {
      setPermission('denied');
      setError('Camera access denied. Please allow camera permission to proceed.');
    }
  };

  /**
   *
   */
  const handleStop = () => {
    setRecording(false);
    setStartTime(null);
    setElapsed(0);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    // Pass metrics for analytics
    onComplete({
      success: true,
      message: 'Test completed',
      metrics,
      eyeClosedPercent,
      headMovement,
      handStability,
    });
  };

  /**
   *
   */
  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setRecording(false);
    setStartTime(null);
    setElapsed(0);
    onCancel();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Video Test of Meditation
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!recording && permission !== 'granted' && (
        <Button variant="contained" color="primary" onClick={handleStart} sx={{ mb: 2 }}>
          Allow Camera & Start Test
        </Button>
      )}
      <Box
        sx={{
          width: 360,
          height: 270,
          background: '#222',
          borderRadius: 2,
          mb: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 8,
            background: '#222',
          }}
        />
        <canvas
          ref={canvasRef}
          width={360}
          height={270}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        />
        {recording && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: 14,
            }}
          >
            Recording... {Math.floor(elapsed / 60)}:{('0' + (elapsed % 60)).slice(-2)} /{' '}
            {maxDurationMinutes}:00
          </Box>
        )}
      </Box>
      {recording && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <Typography variant="body2">Eyes Closed: {eyeClosedPercent.toFixed(1)}%</Typography>
          <LinearProgress variant="determinate" value={eyeClosedPercent} sx={{ mb: 1 }} />
          <Typography variant="body2">Head Movement: {headMovement.toFixed(3)}</Typography>
          <Typography variant="body2">Hand Stability: {handStability.toFixed(3)}</Typography>
        </Box>
      )}
      {recording && (
        <Button variant="contained" color="secondary" onClick={handleStop} sx={{ mb: 2 }}>
          Stop & Submit Test
        </Button>
      )}
      <Button onClick={handleCancel} color="inherit">
        Cancel
      </Button>
    </Box>
  );
};

export default VideoMeditationTest;

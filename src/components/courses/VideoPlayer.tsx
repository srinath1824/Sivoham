import React, { useEffect } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import Hls from 'hls.js';

import { USE_CDN_HLS } from '../../config/constants';

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoUrl: string;
  watchedSeconds: number;
  videoDuration: number;
  videoEnded: boolean;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onEnded: () => void;
  poster?: string;
  sx?: any;
  setWatchedSeconds: React.Dispatch<React.SetStateAction<number>>;
  setVideoDuration: React.Dispatch<React.SetStateAction<number>>;
  setVideoEnded: React.Dispatch<React.SetStateAction<boolean>>;
  dayNumber?: number;
}

// Feature flag for HLS.js adaptive streaming
const USE_HLS_PLAYER = true; // Set to false to use only native video

/**
 *
 * @param root0
 * @param root0.videoRef
 * @param root0.videoUrl
 * @param root0.watchedSeconds
 * @param root0.videoDuration
 * @param root0.videoEnded
 * @param root0.onTimeUpdate
 * @param root0.onLoadedMetadata
 * @param root0.onEnded
 * @param root0.poster
 * @param root0.sx
 * @param root0.setWatchedSeconds
 * @param root0.setVideoDuration
 * @param root0.setVideoEnded
 * @param root0.dayNumber
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoRef,
  videoUrl,
  watchedSeconds,
  videoDuration,
  videoEnded,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  poster = '/images/guruji_Rays.jpg',
  sx,
  setWatchedSeconds,
  setVideoDuration,
  setVideoEnded,
  dayNumber,
}) => {
  useEffect(() => {
    if (USE_HLS_PLAYER && videoRef.current && videoUrl && videoUrl.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          // Optionally auto-play
        });
        return () => {
          hls.destroy();
        };
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        videoRef.current.src = videoUrl;
      }
    }
  }, [videoUrl, videoRef]);

  return (
    <Box sx={{ my: 3, ...sx }}>
      <Box
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(222,107,47,0.07)',
          background: '#fff',
        }}
      >
        <video
          ref={videoRef}
          key={videoUrl}
          src={!USE_HLS_PLAYER || !videoUrl.endsWith('.m3u8') ? videoUrl : undefined}
          controls
          controlsList="nodownload"
          style={{ width: '100%', borderRadius: 8, fontFamily: 'Lora, serif' }}
          poster={poster}
          onTimeUpdate={(e) => setWatchedSeconds((e.target as HTMLVideoElement).currentTime)}
          onLoadedMetadata={(e) => setVideoDuration((e.target as HTMLVideoElement).duration)}
          onEnded={(e) => {
            console.log('Video ended');
            setVideoEnded(true);
            if (onEnded) onEnded();
          }}
          onSeeking={(e) => {
            const video = e.target as HTMLVideoElement;
            if (video.currentTime > watchedSeconds) {
              video.currentTime = watchedSeconds;
            }
          }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Watched: {Math.floor(watchedSeconds)} / {Math.floor(videoDuration)} seconds
        {videoEnded && ' (Completed)'}
      </Typography>
    </Box>
  );
};

export default VideoPlayer;

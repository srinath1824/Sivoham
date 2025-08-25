import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, IconButton, Dialog, DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  videoUrl: string;
}

export default function YouTubeShorts() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const { t } = useTranslation();

  // YouTube API configuration - replace with your API key and channel handle
  const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || '';
  const CHANNEL_HANDLE = process.env.REACT_APP_YOUTUBE_CHANNEL_HANDLE || 'SivaKundaliniSadhanaChannel';

  useEffect(() => {
    fetchYouTubeShorts();
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [YOUTUBE_API_KEY, CHANNEL_HANDLE]);

  const fetchYouTubeShorts = useCallback(async () => {
    if (!YOUTUBE_API_KEY || !CHANNEL_HANDLE) {
      setError('YouTube API configuration missing');
      setLoading(false);
      return;
    }

    try {
      // First get channel ID from handle
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?key=${YOUTUBE_API_KEY}&forHandle=${CHANNEL_HANDLE}&part=id`
      );
      
      if (!channelResponse.ok) {
        throw new Error('Failed to get channel information');
      }
      
      const channelData = await channelResponse.json();
      if (!channelData.items || channelData.items.length === 0) {
        throw new Error('Channel not found');
      }
      
      const channelId = channelData.items[0].id;
      
      // Then fetch videos
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${channelId}&part=snippet&order=date&maxResults=25&type=video&videoDuration=short`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch YouTube videos');
      }

      const data = await response.json();
      
      const videoList: YouTubeVideo[] = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));

      setVideos(videoList);
    } catch (err: any) {
      setError(err.message || 'Failed to load YouTube videos');
    } finally {
      setLoading(false);
    }
  }, [YOUTUBE_API_KEY, CHANNEL_HANDLE]);

  const handleVideoClick = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setPlayerOpen(true);
  };

  const handleClosePlayer = () => {
    setPlayerOpen(false);
    setSelectedVideo(null);
  };

  const handleArrowClick = (direction: 'left' | 'right') => {
    const container = document.querySelector('.youtube-scroll-container');
    if (container) {
      const cardWidth = window.innerWidth >= 768 ? 244 : 320; // Responsive card width
      const newScrollLeft = direction === 'left' 
        ? Math.max(0, container.scrollLeft - cardWidth)
        : Math.min(container.scrollWidth - container.clientWidth, container.scrollLeft + cardWidth);
      container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
    setCurrentVideo(prev => direction === 'left' ? Math.max(0, prev - 1) : Math.min(videos.length - 1, prev + 1));
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading YouTube videos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, px: { xs: 2, md: 4 } }}>
      <Box sx={{ textAlign: 'left', mb: 6 }}>
        <h2 className="section-heading">{t('home.testimonials')}</h2>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Lora, serif',
            fontSize: { xs: '1.1rem', md: '1.15rem' },
            color: '#222',
            mb: 4,
            textAlign: 'left'
          }}
        >
          Some experiences of those who attended Siva Kundalini Sadhana programs.
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', mx: 'auto' }}>
        {videos.length > (isMobile ? 1 : 5) && currentVideo > 0 && (
          <IconButton
            onClick={() => handleArrowClick('left')}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 40,
              height: 40,
              backgroundColor: '#de6b2f',
              color: 'white',
              opacity: 0.7,
              zIndex: 1,
              '&:hover': { backgroundColor: '#b45309', opacity: 1 }
            }}
          >
            ‹
          </IconButton>
        )}
        {videos.length > (isMobile ? 1 : 5) && currentVideo < videos.length - (isMobile ? 1 : 5) && (
          <IconButton
            onClick={() => handleArrowClick('right')}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 40,
              height: 40,
              backgroundColor: '#de6b2f',
              color: 'white',
              opacity: 0.7,
              zIndex: 1,
              '&:hover': { backgroundColor: '#b45309', opacity: 1 }
            }}
          >
            ›
          </IconButton>
        )}
        <Box
          className="youtube-scroll-container"
          sx={{
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollSnapType: 'x mandatory'
          }}
        >
          <Box sx={{ display: 'flex', gap: 3, pb: 1 }}>
            {videos.map((video) => (
              <Card
                key={video.id}
                sx={{
                  width: { xs: 300, md: 220 },
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(222,107,47,0.15)'
                  },
                  borderRadius: 3,
                  overflow: 'hidden',
                  scrollSnapAlign: 'start'
                }}
                onClick={() => handleVideoClick(video)}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={video.thumbnail}
                    alt={video.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.3)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <IconButton
                      sx={{
                        background: 'rgba(222,107,47,0.9)',
                        color: 'white',
                        '&:hover': { background: 'rgba(222,107,47,1)' }
                      }}
                    >
                      <PlayArrowIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                  </Box>
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Lora, serif',
                      fontWeight: 600,
                      color: '#222',
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.3,
                      fontSize: '1rem'
                    }}
                  >
                    {video.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Lora, serif',
                      color: '#666',
                      fontSize: '0.85rem'
                    }}
                  >
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      {videos.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>No videos available at the moment.</Typography>
        </Box>
      )}
      
      {/* YouTube Player Dialog */}
      <Dialog
        open={playerOpen}
        onClose={handleClosePlayer}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: '#000',
            borderRadius: 2
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleClosePlayer}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedVideo && (
            <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
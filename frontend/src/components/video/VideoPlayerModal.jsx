import React, { useRef, useState } from 'react';
import { 
  X, 
  Video, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Calendar, 
  Truck, 
  Eye, 
  HardDrive,
  Download,
  AlertCircle
} from 'lucide-react';

export default function VideoPlayerModal({ video, onClose }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [videoError, setVideoError] = useState(false);

  if (!video) return null;

  const videoSrc = video.videoUrl?.startsWith('http')
    ? video.videoUrl
    : video.videoUrl
    ? video.videoUrl
    : `/api/evidence/videos/${video.videoFilename}`;

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-card max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/60 bg-surface-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-inner bg-accent-soft text-accent flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-content leading-tight">
                {video.title || 'Municipal Truck Dashcam Stream'}
              </h3>
              <p className="text-xs text-content-muted flex items-center gap-2 mt-0.5">
                <span>Vehicle: <strong className="text-content">{video.vehicleId || 'VH-001'}</strong></span>
                <span>•</span>
                <span>Camera: <strong className="text-content">{video.cameraDirection || 'Front'}</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-content-muted hover:text-content rounded-full hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Canvas */}
        <div className="relative bg-black flex items-center justify-center min-h-[300px] sm:min-h-[420px] max-h-[520px] overflow-hidden">
          {videoError ? (
            <div className="text-center p-8 space-y-3">
              <AlertCircle className="w-12 h-12 text-warning mx-auto" />
              <p className="text-sm font-semibold text-white">Playback Stream Unavailable</p>
              <p className="text-xs text-gray-400 max-w-sm">
                Unable to load video stream from <code>{videoSrc}</code>.
              </p>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              playsInline
              className="w-full h-full max-h-[500px] object-contain"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={(e) => {
                console.error('[VideoPlayerModal] Error playing video:', e);
                setVideoError(true);
              }}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Video Controls & Metadata Bar */}
        <div className="p-4 sm:p-5 bg-surface border-t border-border/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Speed selection */}
            <div className="flex items-center gap-1.5 bg-surface-muted px-2.5 py-1 rounded-pill border border-border/50">
              <span className="text-content-muted font-medium">Speed:</span>
              {[0.5, 1, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    playbackRate === speed
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-content-muted hover:text-content'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Metadata pills */}
            <div className="flex items-center gap-3 text-content-muted flex-wrap">
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-accent" />
                <span>Size: {formatFileSize(video.fileSize)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span>{new Date(video.startedAt || video.createdAt || Date.now()).toLocaleString()}</span>
              </div>
              {videoSrc && (
                <a
                  href={videoSrc}
                  download={video.videoFilename || 'dashcam-recording.mp4'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1 bg-surface-muted hover:bg-surface-hover text-content rounded-pill border border-border/60 transition-colors"
                >
                  <Download className="w-3 h-3 text-accent" />
                  <span>Download MP4</span>
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <p className="text-xs text-content-muted bg-surface-muted/50 p-3 rounded-inner border border-border/40">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

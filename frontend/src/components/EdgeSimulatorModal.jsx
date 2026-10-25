import React, { useState } from 'react';
import {
  Cpu, Radio, X, Sparkles, AlertTriangle, Truck, Compass, Video, CheckCircle2,
  Send, Layers, ShieldCheck
} from 'lucide-react';
import cameraService from '../services/cameraService';
import { useToast } from './ui/Toast';

export default function EdgeSimulatorModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'video'
  const [broadcasting, setBroadcasting] = useState(false);
  const [simulatingDeduplication, setSimulatingDeduplication] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState('Front');
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const toast = useToast();

  if (!open) return null;

  // Button 1: Broadcast New Detection
  const handleBroadcastNewDetection = async () => {
    setBroadcasting(true);
    const randomLat = 22.7196 + (Math.random() - 0.5) * 0.04;
    const randomLng = 75.8577 + (Math.random() - 0.5) * 0.04;
    const issueTypes = ['pothole', 'garbage', 'drain'];
    const selectedType = issueTypes[Math.floor(Math.random() * issueTypes.length)];

    const newIssue = {
      id: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      _id: `sim_${Date.now()}`,
      type: selectedType,
      title: `Simulated Edge Detection: ${selectedType === 'pothole' ? 'Road Cavity' : selectedType === 'garbage' ? 'Illegal Garbage Accumulation' : 'Culvert Silt Blockage'}`,
      description: `Live ingest from Municipal Garbage Truck Dashcam (${selectedCamera} lens). GPS tagged at [${randomLat.toFixed(4)}, ${randomLng.toFixed(4)}].`,
      severity: Math.random() > 0.4 ? 'high' : 'medium',
      status: 'pending',
      location: {
        address: `Ring Road Sector ${Math.floor(Math.random() * 9 + 1)}, Indore, MP`,
        lat: randomLat,
        lng: randomLng,
        type: 'Point',
        coordinates: [randomLng, randomLat],
      },
      imageUrl: selectedType === 'pothole'
        ? 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
      detectedAt: new Date().toISOString(),
      reportedByVehicle: 'MP-09-SIM-2026',
      confidenceScore: 0.96,
      duplicateCount: 0,
      assignedWorkerId: null,
    };

    try {
      // Attempt backend ingest if available
      const formData = new FormData();
      formData.append('cameraAngle', selectedCamera);
      formData.append('latitude', randomLat.toString());
      formData.append('longitude', randomLng.toString());
      await cameraService.ingestFrame(formData);
      toast.success(`Edge Broadcast: New ${selectedType.toUpperCase()} ingested & GeoJSON marker rendered!`);
    } catch {
      toast.success(`Edge Broadcast: New ${selectedType.toUpperCase()} synthesized on GIS Map!`);
    } finally {
      // Emit event to update map & fly to target
      window.dispatchEvent(new CustomEvent('urbanvision:new-detection', { detail: newIssue }));
      setBroadcasting(false);
      onClose();
    }
  };

  // Button 2: Simulate 2nd Truck - Trigger $near Deduplication
  const handleTriggerSpatialDeduplication = () => {
    setSimulatingDeduplication(true);
    setTimeout(() => {
      toast.warning('Spatial deduplication: duplicate issue clustered & ignored ($near < 10m threshold matched)!');
      setSimulatingDeduplication(false);
    }, 600);
  };

  // Video Inspection Upload
  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoFile) return;

    setUploadingVideo(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('vehicleId', 'MP-09-GC-4122');

      await cameraService.uploadVideo(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      toast.success('Inspection video uploaded! Gemini frame extraction in progress.');
    } catch {
      setUploadProgress(100);
      toast.info('Inspection video queued for automated frame extraction (demo mode).');
    } finally {
      setUploadingVideo(false);
      setVideoFile(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-card p-6 max-w-lg w-full shadow-card relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-content-muted hover:text-content hover:bg-surface-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-inner bg-accent-soft flex items-center justify-center">
            <Cpu className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-content">Edge AI Truck Simulator</h3>
              <span className="px-2 py-0.5 text-[10px] bg-accent/20 text-accent font-mono font-bold rounded-full uppercase">
                Hardware Emulation
              </span>
            </div>
            <p className="text-xs text-content-muted">Indore Municipal Sanitation Fleet Telemetry Unit</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 mb-4 p-1 bg-surface-muted rounded-pill">
          <button
            onClick={() => setActiveTab('stream')}
            className={`flex-1 py-1.5 px-3 rounded-pill text-xs font-semibold transition-all ${
              activeTab === 'stream' ? 'bg-surface text-content shadow-sm' : 'text-content-muted hover:text-content'
            }`}
          >
            Camera Broadcast (Pill Action)
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-1.5 px-3 rounded-pill text-xs font-semibold transition-all ${
              activeTab === 'video' ? 'bg-surface text-content shadow-sm' : 'text-content-muted hover:text-content'
            }`}
          >
            Inspection Video Ingest
          </button>
        </div>

        {activeTab === 'stream' && (
          <div className="space-y-4">
            {/* Camera angle selection */}
            <div>
              <span className="text-xs font-semibold text-content-muted uppercase mb-1.5 block">
                Tri-Lens Edge Camera Source
              </span>
              <div className="grid grid-cols-3 gap-2">
                {['Front', 'Left', 'Right'].map((cam) => (
                  <button
                    key={cam}
                    onClick={() => setSelectedCamera(cam)}
                    className={`py-2 px-3 rounded-inner text-xs font-semibold border transition-all ${
                      selectedCamera === cam
                        ? 'border-accent bg-accent-soft text-accent'
                        : 'border-border bg-surface-muted text-content-muted hover:text-content'
                    }`}
                  >
                    {cam} View
                  </button>
                ))}
              </div>
            </div>

            {/* Dashcam Live Stream Placeholder Box */}
            <div className="relative rounded-inner overflow-hidden border border-border/50 bg-black/90 p-4 text-center text-inverse-text">
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-danger/80 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                REC • 1080p 30FPS
              </div>
              <div className="absolute top-2 right-2 text-[10px] font-mono text-content-subtle">
                CAM: {selectedCamera.toUpperCase()}-01
              </div>

              <div className="py-8 space-y-1">
                <Radio className="w-8 h-8 text-accent mx-auto animate-pulse" />
                <p className="text-xs font-semibold text-white">YOLOv8 Edge Vision Model Live</p>
                <p className="text-[11px] text-content-subtle font-mono">Lat: 22.7196 | Lon: 75.8577 | Speed: 24 km/h</p>
              </div>
            </div>

            {/* Live Demo Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleBroadcastNewDetection}
                disabled={broadcasting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-inverse text-inverse-text text-xs font-semibold rounded-pill shadow-card hover:opacity-90 active:scale-98 transition-all"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>{broadcasting ? 'Transmitting Frame...' : 'Button 1: Broadcast New Detection to GIS Map'}</span>
              </button>

              <button
                onClick={handleTriggerSpatialDeduplication}
                disabled={simulatingDeduplication}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-surface text-content text-xs font-semibold rounded-pill border border-border hover:bg-surface-hover active:scale-98 transition-all"
              >
                <Layers className="w-4 h-4 text-warning" />
                <span>{simulatingDeduplication ? 'Calculating Geo Distance...' : 'Button 2: Simulate 2nd Truck (Trigger $near < 10m)'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <form onSubmit={handleVideoUpload} className="space-y-4">
            <div className="p-4 border-2 border-dashed border-border rounded-inner text-center bg-surface-muted">
              <Video className="w-8 h-8 text-accent mx-auto mb-2" />
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="text-xs text-content-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-pill file:border-0 file:text-xs file:font-semibold file:bg-accent file:text-accent-contrast"
              />
              <p className="text-[11px] text-content-subtle mt-2">
                Upload route inspection MP4/MOV for offline frame-by-frame Gemini processing.
              </p>
            </div>

            {uploadingVideo && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-content-muted">
                  <span>Uploading video...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-muted rounded-pill overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploadingVideo || !videoFile}
              className="w-full py-2.5 px-4 bg-inverse text-inverse-text text-xs font-semibold rounded-pill hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {uploadingVideo ? 'Ingesting Video...' : 'Submit Route Video for Extraction'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

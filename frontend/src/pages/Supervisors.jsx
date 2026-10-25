import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  ShieldCheck, 
  Video, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Upload, 
  FileText, 
  Calendar, 
  Phone, 
  Mail, 
  Building2, 
  HardHat, 
  Play, 
  Layers, 
  RefreshCw, 
  UserCheck, 
  Check, 
  Sparkles,
  ArrowRight,
  Loader2,
  Trash2,
  Droplets,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoPlayerModal from '../components/video/VideoPlayerModal';

export default function Supervisors() {
  const { id: routeSupervisorId } = useParams();
  const navigate = useNavigate();
  const { user: currentAuthUser, loginWithAccount } = useAuth();

  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(routeSupervisorId || null);
  const [supervisorDetail, setSupervisorDetail] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'videos' | 'upload' | 'workers' | 'logs'
  const [selectedVideoForModal, setSelectedVideoForModal] = useState(null);
  const [error, setError] = useState(null);

  // Upload Video Form State
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: '',
    cameraDirection: 'Front',
    vehicleId: 'VH-001',
    videoFile: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // 1. Fetch supervisors list
  const fetchSupervisors = useCallback(async () => {
    try {
      setLoadingList(true);
      setError(null);
      const res = await api.supervisors.list();
      if (res.data?.supervisors) {
        setSupervisors(res.data.supervisors);
        // If no supervisor selected yet, pick the one from route or first one
        if (!selectedSupervisorId && res.data.supervisors.length > 0) {
          const defaultId = routeSupervisorId || res.data.supervisors[0]._id;
          setSelectedSupervisorId(defaultId);
        }
      }
    } catch (err) {
      console.error('[Supervisors] Error fetching supervisors:', err);
      setError(err.message || 'Failed to load supervisors list');
    } finally {
      setLoadingList(false);
    }
  }, [routeSupervisorId, selectedSupervisorId]);

  useEffect(() => {
    fetchSupervisors();
  }, [fetchSupervisors]);

  // 2. Fetch specific supervisor profile and associated data
  const fetchSupervisorDetail = useCallback(async (id) => {
    if (!id) return;
    try {
      setLoadingDetail(true);
      setUploadError(null);
      setUploadSuccess(false);
      const res = await api.supervisors.getById(id);
      if (res.data) {
        setSupervisorDetail(res.data);
      }
    } catch (err) {
      console.error('[Supervisors] Error fetching supervisor detail:', err);
      setError(`Failed to load supervisor data: ${err.message}`);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSupervisorId) {
      fetchSupervisorDetail(selectedSupervisorId);
    }
  }, [selectedSupervisorId, fetchSupervisorDetail]);

  const handleSelectSupervisor = (id) => {
    setSelectedSupervisorId(id);
    navigate(`/supervisors/${id}`);
  };

  // Switch authenticated session to this supervisor
  const handleImpersonate = async (sup) => {
    try {
      await loginWithAccount(sup.email, 'Password123');
    } catch (e) {
      console.warn('Could not auto-login with default password, proceeding:', e);
    }
  };

  // Video Upload Handler
  const handleVideoUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFormData.videoFile) {
      setUploadError('Please select a video file (.mp4 or .webm)');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('video', uploadFormData.videoFile);
      formData.append('supervisorId', selectedSupervisorId);
      formData.append('title', uploadFormData.title || `Dashcam Road Run - ${new Date().toLocaleTimeString()}`);
      formData.append('description', uploadFormData.description || 'Routine garbage truck inspection sweep');
      formData.append('cameraDirection', uploadFormData.cameraDirection);
      formData.append('vehicleId', uploadFormData.vehicleId);
      if (supervisorDetail?.supervisor?.assignedArea) {
        formData.append('assignedArea', supervisorDetail.supervisor.assignedArea);
      }

      await api.supervisors.uploadVideo(formData);

      setUploadSuccess(true);
      setUploadFormData({
        title: '',
        description: '',
        cameraDirection: 'Front',
        vehicleId: 'VH-001',
        videoFile: null,
      });

      // Refresh data
      fetchSupervisorDetail(selectedSupervisorId);
      fetchSupervisors();

      // Switch to videos tab after successful upload
      setTimeout(() => {
        setActiveTab('videos');
      }, 1000);
    } catch (err) {
      console.error('[Supervisors] Upload error:', err);
      setUploadError(err.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const currentSupervisor = supervisorDetail?.supervisor;
  const tasks = supervisorDetail?.tasks || [];
  const videos = supervisorDetail?.videos || [];
  const workers = supervisorDetail?.workers || [];
  const activityLogs = supervisorDetail?.activityLogs || [];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-surface rounded-card shadow-card border border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-pill bg-accent-soft text-accent flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Municipal Command & Control
            </span>
            <span className="text-xs text-content-muted">Indore Municipal Corporation</span>
          </div>
          <h1 className="text-2xl font-semibold text-content mt-2 tracking-tight">
            Supervisor Workspaces & Video Archive
          </h1>
          <p className="text-sm text-content-muted mt-1">
            Review isolated supervisory zones, assigned field tasks, truck dashcam video streams and real-time audit logs.
          </p>
        </div>

        <button
          onClick={() => {
            fetchSupervisors();
            if (selectedSupervisorId) fetchSupervisorDetail(selectedSupervisorId);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-surface text-content text-xs font-medium rounded-pill border border-border shadow-sm hover:bg-surface-hover active:scale-95 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-accent ${loadingList || loadingDetail ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-danger-soft border border-danger/30 rounded-inner text-xs text-danger flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-semibold underline">Dismiss</button>
        </div>
      )}

      {/* Supervisor Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supervisors.map((sup) => {
          const isSelected = sup._id === selectedSupervisorId;
          const isCurrentSession = currentAuthUser?.email === sup.email;

          return (
            <div
              key={sup._id}
              onClick={() => handleSelectSupervisor(sup._id)}
              className={`p-5 rounded-card border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-surface border-accent shadow-card ring-2 ring-accent/30'
                  : 'bg-surface border-border/60 hover:border-accent/40 hover:bg-surface-hover shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                    isSelected ? 'bg-accent text-white' : 'bg-surface-muted text-content'
                  }`}>
                    {sup.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-content flex items-center gap-1.5">
                      {sup.name}
                      {isCurrentSession && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-accent-soft text-accent rounded-pill uppercase tracking-wider font-semibold">
                          Active
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-content-muted">{sup.assignedArea || 'Municipal Sector'}</p>
                    <p className="text-[11px] font-mono text-content-subtle mt-0.5">{sup.employeeId}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill ${
                    sup.activeTasksCount > 0 ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success'
                  }`}>
                    {sup.activeTasksCount} Active Tasks
                  </span>
                  <span className="text-[10px] text-content-subtle mt-1 flex items-center gap-1">
                    <Video className="w-3 h-3 text-accent" />
                    {sup.videosCount} Videos
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-content-muted">
                <span className="truncate max-w-[180px]">{sup.email}</span>
                <span className="text-accent font-medium flex items-center gap-1 text-[11px]">
                  {isSelected ? 'Viewing' : 'Select'}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Supervisor Detailed Workspace */}
      {loadingDetail ? (
        <div className="p-12 bg-surface rounded-card border border-border/60 flex flex-col items-center justify-center gap-3 shadow-card">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm font-medium text-content">Loading supervisor workspace & isolated records...</p>
        </div>
      ) : currentSupervisor ? (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Profile Banner */}
          <div className="p-6 bg-surface rounded-card shadow-card border border-border/60 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-surface">
                {currentSupervisor.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-content">{currentSupervisor.name}</h2>
                  <span className="px-2.5 py-0.5 bg-accent-soft text-accent text-xs font-semibold rounded-pill">
                    {currentSupervisor.department || 'Road & Infrastructure Dept'}
                  </span>
                  <span className="px-2.5 py-0.5 bg-surface-muted text-content-muted text-xs font-mono rounded-pill border border-border/50">
                    ID: {currentSupervisor.employeeId}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-content-muted flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <strong>Zone:</strong> {currentSupervisor.assignedArea}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-accent" />
                    {currentSupervisor.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-accent" />
                    {currentSupervisor.phone || '+91 98260 00000'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => handleImpersonate(currentSupervisor)}
                className="flex items-center gap-2 px-4 py-2 bg-inverse text-inverse-text text-xs font-medium rounded-pill hover:opacity-90 transition-opacity shadow-sm"
                title="Switch active logged-in user to this supervisor"
              >
                <UserCheck className="w-4 h-4 text-accent" />
                <span>Act as {currentSupervisor.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-surface rounded-card border border-border/60 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-inner bg-accent-soft text-accent flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-content-muted font-medium">Assigned Tasks</p>
                <p className="text-xl font-bold text-content">{currentSupervisor.stats?.totalTasks || 0}</p>
              </div>
            </div>

            <div className="p-4 bg-surface rounded-card border border-border/60 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-inner bg-warning-soft text-warning flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-content-muted font-medium">Active Tasks</p>
                <p className="text-xl font-bold text-content">{currentSupervisor.stats?.activeTasks || 0}</p>
              </div>
            </div>

            <div className="p-4 bg-surface rounded-card border border-border/60 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-inner bg-success-soft text-success flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-content-muted font-medium">Resolved Tasks</p>
                <p className="text-xl font-bold text-content">{currentSupervisor.stats?.resolvedTasks || 0}</p>
              </div>
            </div>

            <div className="p-4 bg-surface rounded-card border border-border/60 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-inner bg-accent-soft text-accent flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-content-muted font-medium">Inspection Videos</p>
                <p className="text-xl font-bold text-content">{videos.length}</p>
              </div>
            </div>
          </div>

          {/* Workspace Tabs */}
          <div className="border-b border-border/60 flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'tasks', label: `Assigned Tasks (${tasks.length})`, icon: FileText },
              { id: 'videos', label: `Dashcam Videos (${videos.length})`, icon: Video },
              { id: 'upload', label: 'Upload Inspection Video', icon: Upload },
              { id: 'workers', label: `Field Workers (${workers.length})`, icon: HardHat },
              { id: 'logs', label: `Audit Log (${activityLogs.length})`, icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-accent text-accent bg-accent-soft/20 rounded-t-lg'
                      : 'border-transparent text-content-muted hover:text-content hover:bg-surface-hover/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Assigned Tasks */}
          {activeTab === 'tasks' && (
            <div className="bg-surface rounded-card border border-border/60 shadow-card overflow-hidden">
              <div className="p-4 bg-surface-muted/60 border-b border-border/60 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-content flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  Maintenance Tasks Dispatched by {currentSupervisor.name}
                </h3>
                <span className="text-xs text-content-muted">
                  Strictly filtered to assignedBy: {currentSupervisor.name}
                </span>
              </div>

              {tasks.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <FileText className="w-10 h-10 text-content-muted mx-auto" />
                  <p className="text-sm font-medium text-content">No tasks assigned by this supervisor yet.</p>
                  <p className="text-xs text-content-muted">
                    Open the GIS Map, click on any detected issue, and dispatch it to a worker.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-muted text-content-muted uppercase tracking-wider font-semibold border-b border-border/60">
                      <tr>
                        <th className="px-4 py-3">Task / Issue Code</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Assigned Worker</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Assigned Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-content">
                      {tasks.map((task) => (
                        <tr key={task._id} className="hover:bg-surface-hover transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-mono font-semibold text-content block">
                              {task.taskCode || task._id.substring(0, 8)}
                            </span>
                            <span className="text-[11px] text-content-muted">
                              {task.issueId?.issueCode || 'Civic Issue'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-medium capitalize">
                              {task.issueId?.type || 'Road Anomaly'}
                            </span>
                            <span className="text-[10px] text-content-muted block truncate max-w-[200px]">
                              {task.issueId?.address || 'Indore Urban Road'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-[10px]">
                                {task.workerId?.name ? task.workerId.name[0] : 'W'}
                              </div>
                              <div>
                                <p className="font-medium text-content">{task.workerId?.name || 'Unassigned'}</p>
                                <p className="text-[10px] text-content-muted">{task.workerId?.employeeId || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded-pill font-semibold uppercase text-[10px] ${
                              task.priority === 'Critical'
                                ? 'bg-danger-soft text-danger'
                                : task.priority === 'High'
                                ? 'bg-warning-soft text-warning'
                                : 'bg-surface-muted text-content-muted'
                            }`}>
                              {task.priority || 'Medium'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded-pill font-semibold text-[10px] ${
                              task.status === 'Resolved'
                                ? 'bg-success-soft text-success'
                                : task.status === 'InProgress'
                                ? 'bg-accent-soft text-accent'
                                : task.status === 'UnderReview'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-warning-soft text-warning'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-content-muted font-mono text-[11px]">
                            {new Date(task.assignedAt || task.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Inspection Videos */}
          {activeTab === 'videos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-content">
                    Surveillance Dashcam Recordings ({videos.length})
                  </h3>
                  <p className="text-xs text-content-muted">
                    Recordings captured by municipal inspection vehicles in {currentSupervisor.assignedArea}.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-pill shadow-sm hover:opacity-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Video</span>
                </button>
              </div>

              {videos.length === 0 ? (
                <div className="p-12 bg-surface rounded-card border border-border/60 text-center space-y-3 shadow-card">
                  <Video className="w-12 h-12 text-content-muted mx-auto" />
                  <p className="text-sm font-semibold text-content">No surveillance videos uploaded yet</p>
                  <p className="text-xs text-content-muted max-w-sm mx-auto">
                    Upload an inspection video from the garbage truck camera to index road frames and trigger AI verification.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 bg-accent text-white text-xs font-medium rounded-pill shadow-sm"
                  >
                    Upload First Video
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {videos.map((vid) => {
                    const videoSrc = vid.videoUrl || `/api/evidence/videos/${vid.videoFilename}`;
                    return (
                      <div
                        key={vid._id}
                        className="bg-surface rounded-card border border-border/60 shadow-card overflow-hidden flex flex-col group hover:border-accent/40 transition-colors"
                      >
                        {/* Inline HTML5 Video Preview */}
                        <div className="relative bg-black h-48 flex items-center justify-center overflow-hidden">
                          <video
                            src={videoSrc}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Video Meta Info */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 bg-accent-soft text-accent text-[10px] font-semibold rounded-pill uppercase tracking-wider">
                                {vid.cameraDirection || 'Front'} Camera
                              </span>
                              <span className="font-mono text-[11px] text-content-subtle">
                                {vid.vehicleId || 'VH-001'}
                              </span>
                            </div>

                            <h4 className="text-sm font-semibold text-content line-clamp-1">
                              {vid.title || 'Municipal Dashcam Inspection'}
                            </h4>

                            {vid.description && (
                              <p className="text-xs text-content-muted line-clamp-2">
                                {vid.description}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-content-muted">
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Calendar className="w-3 h-3 text-accent" />
                              {new Date(vid.startedAt || vid.createdAt).toLocaleDateString()}
                            </span>
                            <button
                              onClick={() => setSelectedVideoForModal(vid)}
                              className="flex items-center gap-1 text-accent font-medium hover:underline text-xs"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Enlarge</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Upload Inspection Video */}
          {activeTab === 'upload' && (
            <div className="max-w-2xl bg-surface rounded-card border border-border/60 shadow-card p-6 space-y-5">
              <div>
                <h3 className="text-base font-semibold text-content flex items-center gap-2">
                  <Upload className="w-5 h-5 text-accent" />
                  Upload Truck Dashcam Inspection Video
                </h3>
                <p className="text-xs text-content-muted mt-1">
                  Upload MP4 or WebM video footage captured by the garbage truck's triple-camera setup for {currentSupervisor.name} ({currentSupervisor.assignedArea}).
                </p>
              </div>

              {uploadSuccess && (
                <div className="p-4 bg-success-soft border border-success/30 rounded-inner text-xs text-success flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Inspection video uploaded and indexed successfully into MongoDB!</span>
                </div>
              )}

              {uploadError && (
                <div className="p-4 bg-danger-soft border border-danger/30 rounded-inner text-xs text-danger flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleVideoUploadSubmit} className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-content">Video Title / Route Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Morning Sweep - Rajwada Circle to MG Road"
                    value={uploadFormData.title}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-surface-muted border border-border rounded-inner focus:outline-none focus:ring-1 focus:ring-accent text-content"
                  />
                </div>

                {/* Camera Direction & Vehicle ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-content">Camera Perspective</label>
                    <select
                      value={uploadFormData.cameraDirection}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, cameraDirection: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-surface-muted border border-border rounded-inner focus:outline-none focus:ring-1 focus:ring-accent text-content"
                    >
                      <option value="Front">Front-Facing Camera</option>
                      <option value="Left">Left-Facing Camera</option>
                      <option value="Right">Right-Facing Camera</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-content">Inspection Vehicle ID</label>
                    <input
                      type="text"
                      placeholder="e.g. TRK-IND-01"
                      value={uploadFormData.vehicleId}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, vehicleId: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-surface-muted border border-border rounded-inner focus:outline-none focus:ring-1 focus:ring-accent text-content"
                    />
                  </div>
                </div>

                {/* File picker */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-content">Select Video File (.mp4 or .webm)</label>
                  <div className="border-2 border-dashed border-border/80 hover:border-accent rounded-card p-6 text-center bg-surface-muted/40 cursor-pointer transition-colors">
                    <input
                      type="file"
                      id="videoFileInput"
                      accept="video/mp4,video/webm"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadFormData({ ...uploadFormData, videoFile: file });
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="videoFileInput" className="cursor-pointer block space-y-2">
                      <Video className="w-10 h-10 text-accent mx-auto animate-pulse" />
                      <div className="text-xs text-content font-medium">
                        {uploadFormData.videoFile ? (
                          <span className="text-accent font-semibold">
                            Selected: {uploadFormData.videoFile.name} ({(uploadFormData.videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        ) : (
                          <span>Click to browse video file or drag and drop</span>
                        )}
                      </div>
                      <p className="text-[11px] text-content-muted">
                        Supported: MP4, WebM (Max: 100MB)
                      </p>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={uploading || !uploadFormData.videoFile}
                    className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white text-xs font-semibold rounded-pill shadow-sm hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading & Streaming Video...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Inspection Video</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 4: Field Workers */}
          {activeTab === 'workers' && (
            <div className="bg-surface rounded-card border border-border/60 shadow-card overflow-hidden">
              <div className="p-4 bg-surface-muted/60 border-b border-border/60 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-content flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-accent" />
                  Assigned Municipal Field Personnel
                </h3>
                <span className="text-xs text-content-muted">{workers.length} Personnel Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
                {workers.map((worker) => (
                  <div
                    key={worker._id}
                    className="p-4 bg-surface-muted rounded-inner border border-border/60 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs">
                        {worker.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-content">{worker.name}</h4>
                        <p className="text-[10px] font-mono text-content-subtle">{worker.employeeId}</p>
                      </div>
                    </div>

                    <div className="text-[11px] text-content-muted space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-accent" />
                        <span>{worker.assignedArea || currentSupervisor.assignedArea}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-accent" />
                        <span>{worker.phone || '+91 98765 43210'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Audit Log Activity Stream */}
          {activeTab === 'logs' && (
            <div className="bg-surface rounded-card border border-border/60 shadow-card overflow-hidden">
              <div className="p-4 bg-surface-muted/60 border-b border-border/60">
                <h3 className="text-sm font-semibold text-content flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  Audit Trail & Governance Logs for {currentSupervisor.name}
                </h3>
              </div>

              {activityLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-content-muted">
                  No audit activity logs recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {activityLogs.map((log) => (
                    <div key={log._id} className="p-4 flex items-start justify-between gap-4 text-xs hover:bg-surface-hover transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-content font-mono uppercase text-[11px] px-2 py-0.5 bg-surface-muted rounded">
                            {log.action}
                          </span>
                          <span className="text-content-muted">{log.entityType}</span>
                        </div>
                        <p className="text-content-muted text-[11px]">
                          Target: <strong className="text-content font-mono">{log.entityId}</strong>
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-content-subtle whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Video Modal Player */}
      {selectedVideoForModal && (
        <VideoPlayerModal
          video={selectedVideoForModal}
          onClose={() => setSelectedVideoForModal(null)}
        />
      )}
    </div>
  );
}

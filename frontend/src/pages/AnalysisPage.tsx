import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SupportedCrop, PlantAnalysisResult } from '../data/types';
import { plantService } from '../services/plantService';
import { recommendationService, FusedRecommendationItem } from '../services/recommendationService';
import { useLanguage } from '../context/LanguageContext';
import {
  Upload,
  Scan,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  X,
  Bug,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Eye,
  BarChart3,
  Info,
  Layers,
  Bot
} from 'lucide-react';

export const AnalysisPage: React.FC = () => {
  const { language } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<SupportedCrop>('Tomato');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<PlantAnalysisResult | null>(null);
  const [fusedRecs, setFusedRecs] = useState<FusedRecommendationItem[]>([]);
  
  // UX State handlers
  const [invalidFileError, setInvalidFileError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const supportedCrops: SupportedCrop[] = ['Tomato', 'Potato', 'Rice', 'Maize'];

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvalidFileError(null);
    setApiError(null);
    setAnalysisResult(null);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = plantService.validatePlantImage(file);
      
      if (!validation.isValid) {
        setInvalidFileError(validation.errorReason || 'Invalid image file.');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Sample Image Presets for quick testing (100% offline local assets)
  const handleSelectSample = (crop: SupportedCrop) => {
    setSelectedCrop(crop);
    setInvalidFileError(null);
    setApiError(null);
    setAnalysisResult(null);
    setSelectedFile(null);
    setPreviewUrl(`/samples/${crop.toLowerCase()}.jpg`);
  };

  // Support 10-Step Automated Demo Flow trigger
  useEffect(() => {
    const handleDemoFlow = () => {
      handleSelectSample('Tomato');
      setTimeout(() => {
        const btn = document.getElementById('btn-run-analysis');
        if (btn) (btn as HTMLButtonElement).click();
      }, 350);
    };
    window.addEventListener('start-demo-flow', handleDemoFlow);
    return () => window.removeEventListener('start-demo-flow', handleDemoFlow);
  }, []);

  // Clear uploaded image
  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setInvalidFileError(null);
    setApiError(null);
  };

  // Trigger Analysis Workflow
  const handleRunAnalysis = async () => {
    if (!previewUrl) return;

    try {
      setAnalyzing(true);
      setApiError(null);

      const imagePayload = selectedFile || previewUrl;
      const result = await plantService.analyzePlant(imagePayload, selectedCrop);
      setAnalysisResult(result);

      // Phase 9: Trigger Plant + Soil Fusion Evaluation
      try {
        const fusionResp = await recommendationService.evaluateFusion({
          crop_type: selectedCrop,
          disease_prediction: result.disease,
          disease_confidence: result.confidence,
          plant_health_status: result.healthStatus,
          lang: language,
        });
        setFusedRecs(fusionResp.recommendations);
      } catch (fErr) {
        console.warn('Fusion recommendation fallback:', fErr);
      }
    } catch (err: unknown) {
      setApiError((err as Error).message || 'Failed to complete plant analysis.');
      setAnalysisResult(null);
      setFusedRecs([]);
    } finally {
      setAnalyzing(false);
    }
  };

  // Reset to analyze another image
  const handleResetWorkflow = () => {
    setFusedRecs([]);
    handleClearImage();
  };

  // Visual Theme Helper based on Health Status
  const getHealthTheme = (status: 'healthy' | 'warning' | 'disease_detected') => {
    switch (status) {
      case 'healthy':
        return {
          bg: '#ffffff',
          border: '1.5px solid #059669',
          text: '#065f46',
          title: 'Healthy Plant Foliage',
          icon: <CheckCircle2 size={24} color="#059669" />,
          badgeVariant: 'healthy' as const,
        };
      case 'warning':
        return {
          bg: '#ffffff',
          border: '1.5px solid #d4af37',
          text: '#855810',
          title: 'Warning / Low Confidence',
          icon: <AlertTriangle size={24} color="#b8860b" />,
          badgeVariant: 'warning' as const,
        };
      case 'disease_detected':
      default:
        return {
          bg: '#ffffff',
          border: '1.5px solid #e11d48',
          text: '#9f1239',
          title: 'Disease Symptoms Detected',
          icon: <Bug size={24} color="#e11d48" />,
          badgeVariant: 'disease_detected' as const,
        };
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 700 }}>AI Plant Disease Vision Analysis</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Real PyTorch transfer learning model with Grad-CAM explainability and class probability estimates.
          </p>
        </div>
        <span
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            color: 'var(--emerald-300)',
            fontSize: '0.775rem',
            fontWeight: 600,
          }}
        >
          Phase 5 · PyTorch Vision & Grad-CAM
        </span>
      </div>

      {/* AI Safety Disclaimer Banner */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#93c5fd',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}
      >
        <Info size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>AI Safety Notice:</strong> Model predictions reflect estimated probabilities ("Likely condition") and are not guaranteed medical or agricultural diagnoses.
        </span>
      </div>

      <div className="grid-2">
        {/* Left Column: Upload, Crop Selection & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="1. Select Crop & Upload Leaf Image">
            {/* Supported Crop Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Target Crop Category
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                {supportedCrops.map((crop) => {
                  const isSelected = selectedCrop === crop;
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => {
                        setSelectedCrop(crop);
                        if (previewUrl && !selectedFile) {
                          handleSelectSample(crop);
                        }
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '1px solid var(--emerald-400)' : '1px solid var(--border-glass)',
                        backgroundColor: isSelected ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: isSelected ? 'var(--emerald-300)' : 'var(--text-primary)',
                        fontWeight: isSelected ? 600 : 500,
                        fontSize: '0.95rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {crop}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Invalid Image Format Error Banner */}
            {invalidFileError && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#f87171',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{invalidFileError}</span>
              </div>
            )}

            {/* Drag & Drop File Input Area */}
            {!previewUrl ? (
              <div
                style={{
                  border: '2px dashed var(--gold-500)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: '#faf6ee',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 10px rgba(212, 175, 55, 0.08)',
                }}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                  }}
                />
                <Upload size={40} color="#b8860b" style={{ marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                  Click or drag leaf photograph here
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Supports JPG, PNG, WEBP (Max 10MB)
                </p>
              </div>
            ) : (
              /* Image Preview Box */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Input Image Ready
                  </span>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={14} /> Remove Image
                  </button>
                </div>

                <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '240px', border: '1px solid var(--border-glass)' }}>
                  <img
                    src={previewUrl}
                    alt="Plant Leaf Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Scanning Animation Overlay when Analyzing */}
                  {analyzing && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.88)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <RefreshCw size={36} color="#b8860b" className="spin" />
                      <span style={{ fontWeight: 700, color: '#855810', fontSize: '0.95rem' }}>
                        Running PyTorch Forward Pass & Grad-CAM...
                      </span>
                      <div
                        style={{
                          width: '80%',
                          height: '3px',
                          background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                          boxShadow: '0 0 15px #d4af37',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <button
                  id="btn-run-analysis"
                  type="button"
                  className="btn-primary"
                  onClick={handleRunAnalysis}
                  disabled={analyzing}
                  style={{ width: '100%', marginTop: '1.25rem' }}
                >
                  {analyzing ? (
                    <>Processing Vision Inference...</>
                  ) : (
                    <>
                      <Scan size={18} /> Analyze {selectedCrop} Foliage
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Quick Sample Presets Bar */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                Quick Testing Presets:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {supportedCrops.map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => handleSelectSample(crop)}
                    style={{
                      padding: '0.35rem 0.7rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)',
                      fontSize: '0.775rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      cursor: 'pointer',
                    }}
                  >
                    <ImageIcon size={12} /> Sample {crop}
                  </button>
                ))}
              </div>
            </div>

          </Card>
        </div>

        {/* Right Column: Result Card & States */}
        <div>
          {/* 1. Error State View */}
          {apiError && (
            <Card title="Analysis Error">
              <div
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  backgroundColor: 'rgba(244, 63, 94, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                }}
              >
                <AlertTriangle size={42} color="#f87171" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f87171', marginBottom: '0.4rem' }}>
                  Inference Execution Failed
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '360px', margin: '0 auto 1.5rem auto' }}>
                  {apiError}
                </p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleRunAnalysis}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <RotateCcw size={16} /> Retry Analysis
                </button>
              </div>
            </Card>
          )}

          {/* 2. Loading State Placeholder View */}
          {analyzing && (
            <Card title="Computer Vision Neural Pass...">
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <RefreshCw size={44} color="var(--emerald-400)" className="spin" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Evaluating {selectedCrop} Foliage
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                  Extracting spatial activation maps, calculating class softmax distribution, and generating Grad-CAM heatmaps...
                </p>
              </div>
            </Card>
          )}

          {/* 3. Result Output View (Low Confidence Safeguard vs High Confidence Prediction) */}
          {!analyzing && !apiError && analysisResult && (() => {
            const isLowConf = analysisResult.isLowConfidence || analysisResult.confidence < 50.0;
            const theme = getHealthTheme(analysisResult.healthStatus);

            if (isLowConf) {
              return (
                <Card title="AI Diagnostic Result" glow>
                  <div
                    style={{
                      padding: '1.5rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                      <AlertTriangle size={28} color="#fbbf24" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Low Confidence Notice (Estimated Confidence: {analysisResult.confidence}%)
                        </span>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem', lineHeight: '1.4' }}>
                          Unable to confidently identify the condition. Please capture a clearer image or consult an agricultural expert.
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Capture & Diagnostic Recommendations
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {analysisResult.recommendedActions.map((action, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: '#faf6ee',
                            border: '1.5px solid var(--border-subtle)',
                            fontSize: '0.85rem',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                          }}
                        >
                          <ShieldCheck size={16} color="#b8860b" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleResetWorkflow}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <RotateCcw size={16} /> Upload Clearer Image
                  </button>
                </Card>
              );
            }

            return (
              <Card title="Model Diagnostic Output" glow>
                {/* Visual Distinction Header */}
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: theme.bg,
                    border: theme.border,
                    marginBottom: '1.5rem',
                    boxShadow: '0 2px 10px rgba(212, 175, 55, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {theme.icon}
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          AI Diagnostic Status
                        </span>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {theme.title}
                        </h3>
                      </div>
                    </div>
                    <Badge variant={analysisResult.severity}>{analysisResult.severity} Severity</Badge>
                  </div>
                </div>

                {/* Structured Metadata Grid */}
                <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: '#faf6ee', border: '1.5px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Crop Type</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{analysisResult.cropType}</span>
                  </div>

                  <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: '#faf6ee', border: '1.5px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Estimated Confidence</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#855810' }}>
                        {analysisResult.confidence}%
                      </span>
                      <div style={{ flex: 1, height: '6px', borderRadius: 'var(--radius-full)', background: 'rgba(212, 175, 55, 0.15)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${analysisResult.confidence}%`, background: 'linear-gradient(90deg, #d4af37, #b8860b)' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Likely Condition Name */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--emerald-400)', textTransform: 'uppercase' }}>
                    Likely Condition (AI Prediction)
                  </span>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                    {analysisResult.disease}
                  </h4>
                  {analysisResult.scientificName && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Scientific Classification: {analysisResult.scientificName}
                    </p>
                  )}
                </div>

                {/* Grad-CAM Explainability Heatmap View */}
                {analysisResult.gradcamImage && (
                  <div style={{ marginBottom: '1.5rem', background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-glass)', boxShadow: '0 2px 10px rgba(212, 175, 55, 0.08)' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#996515', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Eye size={16} color="#b8860b" /> Grad-CAM Visual Attention Map
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '160px', height: '160px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1.5px solid #d4af37', flexShrink: 0 }}>
                        <img src={analysisResult.gradcamImage} alt="Grad-CAM Heatmap" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: '1.5', flex: 1, minWidth: '200px' }}>
                        Red and warm highlighted regions depict spatial leaf features where the PyTorch model backbone registered highest activation gradients during feature extraction.
                      </p>
                    </div>
                  </div>
                )}

                {/* Class Probabilities Distribution */}
                {analysisResult.classProbabilities && Object.keys(analysisResult.classProbabilities).length > 0 && (
                  <div style={{ marginBottom: '1.5rem', background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-glass)', boxShadow: '0 2px 10px rgba(212, 175, 55, 0.08)' }}>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#996515', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <BarChart3 size={16} color="#b8860b" /> Class Probability Distribution
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {Object.entries(analysisResult.classProbabilities)
                        .filter(([_, prob]) => prob > 1.0) // Show top classes > 1%
                        .sort(([_, a], [__, b]) => b - a)
                        .slice(0, 4)
                        .map(([className, prob]) => (
                          <div key={className}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{className}</span>
                              <span style={{ color: '#855810', fontWeight: 700 }}>{prob}%</span>
                            </div>
                            <div style={{ height: '5px', borderRadius: 'var(--radius-full)', background: 'rgba(212, 175, 55, 0.15)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${prob}%`, background: 'linear-gradient(90deg, #d4af37, #b8860b)' }} />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Explanation Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#996515', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} color="#b8860b" /> Diagnostic Explanation
                  </h5>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', background: '#faf6ee', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border-glass)' }}>
                    {analysisResult.explanation}
                  </p>
                </div>

                {/* Recommended Actions */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#996515', marginBottom: '0.5rem' }}>
                    Recommended Next Steps
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {analysisResult.recommendedActions.map((action, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#faf6ee',
                          border: '1.5px solid var(--border-subtle)',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                        }}
                      >
                        <ShieldCheck size={16} color="#b8860b" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phase 9: Plant + Soil Cross-Domain Fused Guidance */}
                {fusedRecs && fusedRecs.length > 0 && (
                  <div style={{ marginBottom: '1.75rem', background: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1.5px solid #d4af37', boxShadow: '0 4px 18px rgba(212, 175, 55, 0.12)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#855810', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                        <Layers size={18} color="#b8860b" /> Plant & Soil Fused Guidance (Phase 9)
                      </h5>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #d4af37', color: '#7c4f13', fontWeight: 700 }}>
                        Cross-Domain Intelligence
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {fusedRecs.map((rec) => (
                        <div
                          key={rec.id}
                          style={{
                            padding: '0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: '#faf6ee',
                            border: '1.5px solid rgba(212, 175, 55, 0.35)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                              {rec.recommendation}
                            </span>
                            <Badge variant={rec.severity === 'urgent' ? 'urgent' : rec.severity === 'high' ? 'warning' : 'healthy'}>
                              {rec.stressType}
                            </Badge>
                          </div>
                          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0 0 0.4rem 0', lineHeight: '1.4' }}>
                            <strong>Reason:</strong> {rec.reason}
                          </p>
                          <p style={{ fontSize: '0.85rem', color: '#855810', fontWeight: 600, margin: 0, lineHeight: '1.4' }}>
                            <strong>Action:</strong> {rec.suggestedAction}
                          </p>

                          {rec.supportingSensorValues && Object.keys(rec.supportingSensorValues).length > 0 && (
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.45rem', borderTop: '1px dashed rgba(212, 175, 55, 0.35)', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: '#7c4f13', fontWeight: 700 }}>
                                Supporting Telemetry:
                              </span>
                              {Object.entries(rec.supportingSensorValues).map(([k, v]) => (
                                <span key={k} style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid #d4af37', color: '#1c1917', fontWeight: 600 }}>
                                  {k}: {String(v)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Step 10: Seamless Farmer AI Assistant Launcher */}
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-agri-chat', { detail: { crop: selectedCrop } }))}
                      style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Bot size={18} /> Ask Farmer AI Assistant About This Result
                    </button>
                  </div>
                )}

                {/* Control Action: Analyze Another Image */}
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleResetWorkflow}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <RotateCcw size={16} /> Analyze Another Image
                </button>
              </Card>
            );
          })()}

          {/* 4. Initial Ready State Placeholder */}
          {!analyzing && !apiError && !analysisResult && (
            <Card title="Diagnostic Result Interface">
              <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Scan size={52} color="var(--border-glass)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Awaiting Plant Image Input
                </h3>
                <p style={{ fontSize: '0.875rem', maxWidth: '340px', margin: '0 auto 1.25rem auto' }}>
                  Select one of the 4 supported crops (Tomato, Potato, Rice, Maize) and upload an image to run vision model inference.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

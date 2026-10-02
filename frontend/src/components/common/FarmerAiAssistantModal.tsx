import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSensorData } from '../../hooks/useSensorData';
import { assistantService, AssistantAnswer } from '../../services/assistantService';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Sprout,
  Trash2,
  AlertTriangle,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface FarmerAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCrop?: string;
}

interface ChatMessage {
  id: string;
  sender: 'farmer' | 'assistant';
  text: string;
  time: string;
  structured?: AssistantAnswer;
}

export const FarmerAiAssistantModal: React.FC<FarmerAiAssistantModalProps> = ({
  isOpen,
  onClose,
  initialCrop = 'Tomato',
}) => {
  const { t, language } = useLanguage();
  const { readings: liveSensors } = useSensorData('esp32-field-node-01', 3000);
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showDetailedCards, setShowDetailedCards] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isTelugu = language === 'te';

  const defaultGreeting = isTelugu
    ? 'నమస్కారం రైతు సోదరులారా! నేను మీ నిజ-సమయ పొల సమాచారంతో కూడిన ఏఐ సహాయకుడిని. మీ పంటకు సంబంధించి ఆకులు పసుపుబారడం, తెగుళ్లు, నీటి తడి లేదా ఎరువుల గురించి ఏదైనా అడగండి.'
    : 'Namaste! I am your AgriAI Field Assistant. I analyze your live crop diagnostics and real-time soil probe readings to answer your farming questions. Ask me anything about leaf yellowing, disease spots, watering, or fertilizers.';

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: defaultGreeting,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Update greeting when language switches
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === 'assistant') {
      setMessages([
        {
          id: 'msg-welcome',
          sender: 'assistant',
          text: defaultGreeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [language, defaultGreeting]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const quickQuestions = isTelugu
    ? [
        'నా టమోటా ఆకులు ఎందుకు పసుపు రంగులోకి మారుతున్నాయి?',
        'ప్రస్తుతం నేలలో తేమ మరియు నీటి తడి సరిగ్గా ఉందా?',
        'ఆకులపై ఉన్న మచ్చలను ఎలా నివారించాలి?',
        'ప్రస్తుతం నా పంటకు ఎరువులు వేయవలసిన అవసరం ఉందా?',
      ]
    : [
        'Why are my tomato leaves turning yellow?',
        'Is my soil moisture and watering adequate right now?',
        'What should I do about the leaf disease spots?',
        'Does my crop need fertilizer or compost right now?',
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `farmer-${Date.now()}`,
      sender: 'farmer',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      // Phase 10 Context-Aware Analysis Request
      const answer = await assistantService.askAssistant({
        question: text,
        crop_type: selectedCrop,
        lang: language,
        soil_moisture: liveSensors?.moisturePercent,
        soil_temperature: liveSensors?.temperatureCelsius,
        ph: liveSensors?.phLevel,
        nitrogen: liveSensors?.npk?.nitrogenMgKg,
        phosphorus: liveSensors?.npk?.phosphorusMgKg,
        potassium: liveSensors?.npk?.potassiumMgKg,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: answer.fullResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structured: answer,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Safe fallback
      const fallbackText = isTelugu
        ? 'క్షమించండి, సర్వర్‌లో సాంకేతిక సమస్య ఏర్పడింది. దయచేసి కాసేపటి తర్వాత మళ్ళీ ప్రయత్నించండి.'
        : 'I apologize, but I encountered a communication error with the agronomic server. Please try asking again in a moment.';

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          sender: 'assistant',
          text: fallbackText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: defaultGreeting,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const toggleStructuredCard = (msgId: string) => {
    setShowDetailedCards((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '740px',
          height: '85vh',
          maxHeight: '780px',
          backgroundColor: '#ffffff',
          border: '2px solid #d4af37',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 60px rgba(184, 134, 11, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.1rem 1.4rem',
            borderBottom: '1.5px solid var(--border-glass)',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            boxShadow: '0 2px 10px rgba(212, 175, 55, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                border: '1.5px solid #fef08a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(212, 175, 55, 0.35)',
              }}
            >
              <Bot size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {t('chat.title')}
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#7c4f13',
                    fontWeight: 700,
                  }}
                >
                  Phase 10 · Context-Aware
                </span>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: 0 }}>
                {t('chat.subtitle')}
              </p>
            </div>
          </div>

          {/* Header Controls: Crop Picker & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#ffffff', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid #d4af37' }}>
              <Sprout size={14} color="#b8860b" />
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="Tomato" style={{ background: '#ffffff', color: '#1c1917' }}>Tomato</option>
                <option value="Potato" style={{ background: '#ffffff', color: '#1c1917' }}>Potato</option>
                <option value="Rice" style={{ background: '#ffffff', color: '#1c1917' }}>Rice</option>
                <option value="Maize" style={{ background: '#ffffff', color: '#1c1917' }}>Maize</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleClearChat}
              title={t('btn.clearChat')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Trash2 size={16} />
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Live Context Telemetry Status Bar */}
        <div
          style={{
            padding: '0.45rem 1.4rem',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            borderBottom: '1px solid rgba(52, 211, 153, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Cpu size={14} color="var(--emerald-400)" />
            <span>
              <strong>Active Context:</strong> {selectedCrop} • Soil Moisture:{' '}
              {liveSensors?.moisturePercent != null ? `${liveSensors.moisturePercent.toFixed(1)}%` : '--'} • pH:{' '}
              {liveSensors?.phLevel != null ? liveSensors.phLevel.toFixed(2) : '--'}
            </span>
          </div>
          <span style={{ color: 'var(--emerald-300)', fontWeight: 600 }}>
            {isTelugu ? 'నైజ-సమయ సెన్సార్ల ఆధారంగా సమాధానాలు' : 'Answers conditioned on live sensor telemetry'}
          </span>
        </div>

        {/* Chat History Messages */}
        <div
          style={{
            flex: 1,
            padding: '1.25rem 1.4rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {messages.map((msg) => {
            const isFarmer = msg.sender === 'farmer';
            const isExpanded = showDetailedCards[msg.id];

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isFarmer ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '1rem 1.25rem',
                    borderRadius: isFarmer
                      ? 'var(--radius-md) var(--radius-md) 0 var(--radius-md)'
                      : 'var(--radius-md) var(--radius-md) var(--radius-md) 0',
                    background: isFarmer ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)' : '#ffffff',
                    border: isFarmer ? '1.5px solid #fef08a' : '1.5px solid #d4af37',
                    color: isFarmer ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    boxShadow: isFarmer ? '0 4px 14px rgba(212, 175, 55, 0.35)' : '0 4px 16px rgba(184, 134, 11, 0.1)',
                  }}
                >
                  {/* Message Sender Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.4rem',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isFarmer ? '#ffffff' : '#996515',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      {isFarmer ? 'You (Farmer)' : 'AgriAI Assistant'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: isFarmer ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)' }}>
                      {msg.time}
                    </span>
                  </div>

                  {/* Message Body Content */}
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                  {/* Phase 10 Structured 4-Point Breakdown Accordion */}
                  {msg.structured && (
                    <div style={{ marginTop: '0.85rem', borderTop: isFarmer ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(212, 175, 55, 0.25)', paddingTop: '0.6rem' }}>
                      <button
                        type="button"
                        onClick={() => toggleStructuredCard(msg.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isFarmer ? '#ffffff' : '#996515',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0',
                        }}
                      >
                        <Layers size={14} />
                        {isExpanded
                          ? isTelugu ? 'వివరణాత్మక పట్టికను మూసివేయి' : 'Hide Structured Breakdown'
                          : isTelugu ? 'వివరణాత్మక పాయింట్లను చూడండి (4 Points)' : 'View Structured 4-Point Breakdown'}
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isExpanded && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: '#faf6ee',
                            border: '1.5px solid rgba(212, 175, 55, 0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.65rem',
                            fontSize: '0.825rem',
                            color: '#1c1917',
                          }}
                        >
                          {/* 1. Possible Reason */}
                          <div>
                            <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '0.15rem' }}>
                              1. {isTelugu ? 'సాధ్యమయ్యే కారణం (Possible Reason):' : 'Possible Reason:'}
                            </strong>
                            <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                              {msg.structured.possibleReason}
                            </p>
                          </div>

                          {/* 2. Evidence from Plant Image */}
                          <div>
                            <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '0.15rem' }}>
                              2. {isTelugu ? 'ఆకు ఫోటో ఆధారాలు (Evidence from Plant Image):' : 'Evidence from Plant Image:'}
                            </strong>
                            <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                              {msg.structured.evidenceFromPlantImage}
                            </p>
                          </div>

                          {/* 3. Relevant Soil Measurements */}
                          <div>
                            <strong style={{ color: '#34d399', display: 'block', marginBottom: '0.15rem' }}>
                              3. {isTelugu ? 'నేల సెన్సార్ కొలతలు (Relevant Soil Measurements):' : 'Relevant Soil Measurements:'}
                            </strong>
                            <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                              {msg.structured.relevantSoilMeasurements}
                            </p>
                          </div>

                          {/* 4. Recommended Next Step */}
                          <div>
                            <strong style={{ color: '#a78bfa', display: 'block', marginBottom: '0.15rem' }}>
                              4. {isTelugu ? 'చేయవలసిన పనులు (Recommended Next Step):' : 'Recommended Next Step:'}
                            </strong>
                            <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                              {msg.structured.recommendedNextStep}
                            </p>
                          </div>

                          {/* Safety / Certainty Disclaimer Notice */}
                          <div style={{ marginTop: '0.35rem', paddingTop: '0.45rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <AlertTriangle size={13} color="#f59e0b" style={{ flexShrink: 0 }} />
                            <span>{msg.structured.safetyDisclaimer}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator Animation */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-400)', fontSize: '0.85rem' }}>
              <Sparkles size={16} className="spin" />
              <span>{isTelugu ? 'ఏఐ మీ పొలం డేటాను పరిశీలిస్తోంది...' : 'AgriAI is analyzing your crop & soil telemetry...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Farmer Questions Bar */}
        <div
          style={{
            padding: '0.6rem 1.4rem',
            borderTop: '1.5px solid var(--border-glass)',
            backgroundColor: '#faf6ee',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <span style={{ fontSize: '0.725rem', color: '#855810', fontWeight: 700 }}>
            {t('chat.suggestedHeader')}
          </span>
          <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isTyping}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid rgba(212, 175, 55, 0.45)',
                  backgroundColor: '#ffffff',
                  color: '#855810',
                  fontWeight: 600,
                  fontSize: '0.775rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(212, 175, 55, 0.1)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Row */}
        <div
          style={{
            padding: '1rem 1.4rem',
            borderTop: '1.5px solid var(--border-glass)',
            backgroundColor: '#ffffff',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              isTelugu
                ? 'మీ ప్రశ్నను ఇక్కడ అడగండి (ఉదా: నా టమోటా ఆకులు ఎందుకు పసుపు రంగులోకి మారుతున్నాయి?)...'
                : 'Ask a question (e.g. Why are my tomato leaves turning yellow?)...'
            }
            disabled={isTyping}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--border-glass)',
              backgroundColor: '#fbf9f4',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />

          <button
            type="button"
            className="btn-primary"
            onClick={() => handleSendMessage()}
            disabled={isTyping || !inputText.trim()}
            style={{
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
            }}
          >
            <Send size={16} />
            {t('btn.sendMessage')}
          </button>
        </div>
      </div>
    </div>
  );
};

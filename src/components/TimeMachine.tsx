/**
 * TimeMachine — Jump to famous astronomical events.
 *
 * Browse and time-travel to historical and future events,
 * seeing actual planet positions for those dates.
 */

import { useState, useCallback } from 'react'
import { useStore } from '../store/store'
import { TIME_EVENTS, getCategoryColor } from '../data/timeEvents'
import type { TimeEvent } from '../data/timeEvents'

const styles = {
  panel: {
    position: 'absolute' as const,
    top: 20,
    right: 20,
    width: 310,
    maxHeight: 'calc(100vh - 40px)',
    background: 'rgba(8, 8, 28, 0.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    zIndex: 150,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
    animation: 'slideInRight 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    padding: '16px 18px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#FFD700',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 4,
  },
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '8px 10px',
  },
  eventCard: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
    marginBottom: 6,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  eventName: {
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  eventDate: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  eventDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 6,
    lineHeight: 1.5,
  },
  badge: {
    fontSize: 9,
    padding: '2px 6px',
    borderRadius: 4,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  jumpBtn: {
    marginTop: 8,
    padding: '6px 14px',
    borderRadius: 7,
    border: 'none',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    fontSize: 16,
    padding: '4px 8px',
    borderRadius: 6,
    transition: 'all 0.2s',
  },
  nowBtn: {
    padding: '6px 12px',
    borderRadius: 7,
    border: '1px solid rgba(0, 255, 136, 0.25)',
    background: 'rgba(0, 255, 136, 0.1)',
    color: '#00ff88',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
}

interface TimeMachineProps {
  open: boolean
  onClose: () => void
}

export function TimeMachine({ open, onClose }: TimeMachineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const setElapsedDays = useStore((s) => s.setElapsedDays)
  const setPaused = useStore((s) => s.setPaused)
  const setCameraTarget = useStore((s) => s.setCameraTarget)
  const setActiveEvent = useStore((s) => s.setActiveEvent)
  const activeEvent = useStore((s) => s.activeEvent)
  const elapsedDays = useStore((s) => s.elapsedDays)

  const handleJump = useCallback((event: TimeEvent) => {
    setElapsedDays(event.elapsedDays)
    setPaused(true)
    setActiveEvent(event.id)
    if (event.focusPlanet) {
      setCameraTarget(event.focusPlanet)
    }
  }, [setElapsedDays, setPaused, setCameraTarget, setActiveEvent])

  const handleReturnToNow = useCallback(() => {
    setElapsedDays(0)
    setActiveEvent(null)
    setPaused(false)
  }, [setElapsedDays, setActiveEvent, setPaused])

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => prev === id ? null : id)
  }, [])

  if (!open) return null

  // Current date display
  const j2000 = new Date(2000, 0, 1, 12, 0, 0)
  const currentDate = new Date(j2000.getTime() + elapsedDays * 24 * 60 * 60 * 1000)
  const dateStr = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={styles.title}>
            ⏳ Time Machine
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {activeEvent && (
              <button
                style={styles.nowBtn}
                onClick={handleReturnToNow}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 255, 136, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)'
                }}
              >
                ↩ J2000
              </button>
            )}
            <button
              style={styles.closeBtn}
              onClick={onClose}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
            >
              ✕
            </button>
          </div>
        </div>
        <div style={styles.subtitle}>
          Current: {dateStr} · Jump to historic astronomical events
        </div>
      </div>

      <div style={styles.list}>
        {TIME_EVENTS.map((event) => {
          const catColor = getCategoryColor(event.category)
          const isActive = activeEvent === event.id
          const isExpanded = expandedId === event.id

          return (
            <div
              key={event.id}
              style={{
                ...styles.eventCard,
                borderColor: isActive
                  ? `${catColor}60`
                  : 'rgba(255,255,255,0.06)',
                background: isActive
                  ? `${catColor}12`
                  : 'rgba(255,255,255,0.02)',
              }}
              onClick={() => handleToggleExpand(event.id)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                  e.currentTarget.style.transform = 'translateX(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }
              }}
            >
              <div style={{ ...styles.eventName, color: isActive ? catColor : '#ddd' }}>
                <span>{event.emoji}</span>
                <span style={{ flex: 1 }}>{event.name}</span>
                <span style={{
                  ...styles.badge,
                  background: `${catColor}20`,
                  color: catColor,
                }}>
                  {event.category}
                </span>
              </div>
              <div style={styles.eventDate}>
                {event.date}
                {isActive && (
                  <span style={{ color: '#00ff88', marginLeft: 8, fontWeight: 600 }}>
                    ● VIEWING
                  </span>
                )}
              </div>

              {isExpanded && (
                <>
                  <div style={styles.eventDesc}>{event.description}</div>
                  <button
                    style={{
                      ...styles.jumpBtn,
                      background: isActive ? 'rgba(255,255,255,0.1)' : `${catColor}25`,
                      color: isActive ? '#aaa' : catColor,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isActive) handleJump(event)
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = `${catColor}40`
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = `${catColor}25`
                    }}
                  >
                    {isActive ? '✓ Currently viewing' : '⏭ Jump to event'}
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* slideInRight is defined in index.css */}
    </div>
  )
}

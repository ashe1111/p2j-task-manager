'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            if (typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('Pomodoro Timer Ended!', {
                  body: isBreak ? 'Break time is over, keep going!' : 'Focus time is over, take a break!',
                });
              }
            }

            if (isBreak) {
              setMinutes(25);
              setIsBreak(false);
            } else {
              setMinutes(5);
              setIsBreak(true);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, minutes, seconds, isBreak]);

  const handleStart = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setMinutes(isBreak ? 5 : 25);
    setSeconds(0);
  };

  const progress = isBreak
    ? ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100
    : ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl shadow-lg p-6 border border-orange-100 dark:border-orange-800">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-6 h-6 text-orange-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Pomodoro {isBreak ? '(Break)' : '(Focus)'}
        </h3>
      </div>

      <div className="relative">
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-900 dark:text-white mb-4 font-mono">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
            <div
              className={`h-full transition-all duration-1000 ${
                isBreak
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : 'bg-gradient-to-r from-orange-400 to-red-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-3">
            {!isActive ? (
              <Button
                onClick={handleStart}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full w-14 h-14"
              >
                <Play className="w-6 h-6" />
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-full w-14 h-14"
              >
                <Pause className="w-6 h-6" />
              </Button>
            )}

            <Button
              onClick={handleReset}
              variant="outline"
              className="rounded-full w-14 h-14 border-2"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
        {isBreak ? 'Short break, recover energy' : 'Stay focused, resist distractions'}
      </p>
    </Card>
  );
}

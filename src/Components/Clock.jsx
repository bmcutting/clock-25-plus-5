import React from "react";
import { useState, useEffect, useRef } from "react";

export default function Clock() {
  const [breakLength, setBreakLength] = useState(5);
  const [sessionLength, setSessionLength] = useState(25);
  const [mode, setMode] = useState("Session"); // "Session" | "Break"
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  const intervalRef = useRef(null);
  const modeRef = useRef(mode);
  const breakRef = useRef(breakLength);
  const sessionRef = useRef(sessionLength);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { breakRef.current = breakLength; }, [breakLength]);
  useEffect(() => { sessionRef.current = sessionLength; }, [sessionLength]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const startInterval = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 0) return prev - 1;

        return 0;
      });
    }, 1000);
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleStartStop = () => {
    if (isRunning) {
      stopInterval();
      setIsRunning(false);
    } else {
      setIsRunning(true);
      startInterval();
    }
  };

  useEffect(() => {
    if (timeLeft !== 0) return;
    if (!isRunning && intervalRef.current === null) {
      return;
    }

    const audio = document.getElementById("beep");
    if (audio) {
      try { audio.play(); } catch (e) {console.log(e); /* ignore */ }
    }
    stopInterval();
    setIsRunning(false);

    const newMode = modeRef.current === "Session" ? "Break" : "Session";

    setMode(newMode);
    modeRef.current = newMode;

    const labelEl = document.getElementById("timer-label");
    if (labelEl) labelEl.textContent = newMode;

    const nextTime = newMode === "Session" ? sessionRef.current * 60 : breakRef.current * 60;
    const t = setTimeout(() => {
      setTimeLeft(nextTime);
      setIsRunning(true);
      setTimeout(() => startInterval(), 20);
    }, 1000);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const reset = () => {
    stopInterval();
    setBreakLength(5);
    setSessionLength(25);
    setTimeLeft(25 * 60);
    setMode("Session");
    modeRef.current = "Session";
    setIsRunning(false);
    const audioEl = document.getElementById("beep");
    if (audioEl) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
    const labelEl = document.getElementById("timer-label");
    if (labelEl) labelEl.textContent = "Session";
  };

  const decrementBreak = () => {
    if (breakLength > 1) {
      const newVal = breakLength - 1;
      setBreakLength(newVal);
      if (!isRunning && mode === "Break") setTimeLeft(newVal * 60);
    }
  };
  const incrementBreak = () => {
    if (breakLength < 60) {
      const newVal = breakLength + 1;
      setBreakLength(newVal);
      if (!isRunning && mode === "Break") setTimeLeft(newVal * 60);
    }
  };
  const decrementSession = () => {
    if (sessionLength > 1) {
      const newVal = sessionLength - 1;
      setSessionLength(newVal);
      if (!isRunning && mode === "Session") setTimeLeft(newVal * 60);
    }
  };
  const incrementSession = () => {
    if (sessionLength < 60) {
      const newVal = sessionLength + 1;
      setSessionLength(newVal);
      if (!isRunning && mode === "Session") setTimeLeft(newVal * 60);
    }
  };

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <section id="clock" className="container mt-4">
      <div className="mb-3 text-center">
        <div id="break-label" className="mb-2 fw-bold">Break Length</div>
        <div className="d-flex justify-content-center gap-2">
          <button id="break-decrement" className="btn btn-secondary" onClick={decrementBreak}>-</button>
          <div id="break-length" className="px-3">{breakLength}</div>
          <button id="break-increment" className="btn btn-secondary" onClick={incrementBreak}>+</button>
        </div>
      </div>

      <div className="mb-3 text-center">
        <div id="session-label" className="mb-2 fw-bold">Session Length</div>
        <div className="d-flex justify-content-center gap-2">
          <button id="session-decrement" className="btn btn-secondary" onClick={decrementSession}>-</button>
          <div id="session-length" className="px-3">{sessionLength}</div>
          <button id="session-increment" className="btn btn-secondary" onClick={incrementSession}>+</button>
        </div>
      </div>

      <div className="mb-3 text-center">
        <div id="timer-label" className="mb-2 fw-bold">{mode}</div>
        <div id="time-left" className="fs-3">{formatTime(timeLeft)}</div>
        <div id="timer-controls" className="d-flex justify-content-center gap-2">
          <button id="start_stop" className="btn btn-primary" onClick={toggleStartStop}>
            {isRunning ? "Stop" : "Start"}
          </button>
          <button id="reset" className="btn btn-secondary" onClick={reset}>Reset</button>
        </div>
      </div>

      <audio
        id="beep"
        preload="auto"
        src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
      />
    </section>
  );
}

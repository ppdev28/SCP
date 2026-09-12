import { useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { T } from "../lib/tokens";

const INITIAL_FONT_SIZE = 16;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 28;

const TERMINAL_LINES = [
  { text: "pepe@ppserver:~$ ", type: "prompt", command: "ls" },
  {
    text: "backups  chrome-backup  cloudflared.deb  data  devops-lab  docker  Downloads  errors  go  Multimedia  projects  snap",
    type: "output",
  },
  { text: "", type: "output" },
  { text: "pepe@ppserver:~$ ", type: "prompt", command: "cd proyectos/" },
  { text: "", type: "output" },
  {
    text: "pepe@ppserver:~/proyectos$ ",
    type: "prompt",
    command: "ls",
  },
  {
    text: "'HK Pro'  HouseKeepingProject  padel-planet  SCP  soma-backend",
    type: "output",
  },
  { text: "", type: "output" },
  {
    text: "pepe@ppserver:~/proyectos$ ",
    type: "prompt",
    command: "ls -l -a",
  },
  { text: "total 28", type: "output" },
  {
    text: "drwxrwxr-x  7 pepe pepe 4096 ago 13 11:50 .",
    type: "output",
  },
  {
    text: "drwxr-x--- 31 pepe pepe 4096 sep 11 17:55 ..",
    type: "output",
  },
  {
    text: "drwxrwxr-x  6 pepe pepe 4096 jul 15 18:14 'HK Pro'",
    type: "output",
  },
  {
    text: "drwxrwxr-x  3 pepe pepe 4096 jul 15 18:10 HouseKeepingProject",
    type: "output",
  },
  {
    text: "drwxrwxr-x 17 pepe pepe 4096 sep  9 11:55 padel-planet",
    type: "output",
  },
  {
    text: "drwxrwxr-x  7 pepe pepe 4096 sep 11 17:45 SCP",
    type: "output",
  },
  {
    text: "drwxrwxr-x 13 pepe pepe 4096 ago 19 10:10 soma-backend",
    type: "output",
  },
  { text: "", type: "output" },
  { text: "pepe@ppserver:~/proyectos$ ", type: "prompt", command: "" },
] as const;

type Appearance = "Black" | "Dim" | "White";

const APPEARANCE = {
  Black: { background: "#000000", foreground: "#e5e7eb" },
  Dim: { background: "#101217", foreground: "#d5d8df" },
  White: { background: "#f7f7f7", foreground: "#20242c" },
} as const;

function colorizeOutput(line: string) {
  const parts = line.split(/(\b(?:HK Pro|HouseKeepingProject|padel-planet|SCP|soma-backend|projects|backups|chrome-backup|data|devops-lab|docker|Downloads|errors|go|Multimedia|snap)\b)/g);

  return parts.map((part, index) => {
    const isDirectory = /^(HK Pro|HouseKeepingProject|padel-planet|SCP|soma-backend|projects|backups|chrome-backup|data|devops-lab|docker|Downloads|errors|go|Multimedia|snap)$/.test(part);
    return (
      <span key={`${part}-${index}`} style={{ color: isDirectory ? "#5eb5ff" : "inherit" }}>
        {part}
      </span>
    );
  });
}

export default function TerminalView() {
  const [fontSize, setFontSize] = useState(INITIAL_FONT_SIZE);
  const [appearance, setAppearance] = useState<Appearance>("Black");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const theme = APPEARANCE[appearance];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const focusTerminal = () => inputRef.current?.focus();

  const decreaseFont = () =>
    setFontSize((size) => Math.max(MIN_FONT_SIZE, size - 1));

  const increaseFont = () =>
    setFontSize((size) => Math.min(MAX_FONT_SIZE, size + 1));

  const reset = () => {
    setFontSize(INITIAL_FONT_SIZE);
    setAppearance("Black");
    setInput("");
    requestAnimationFrame(focusTerminal);
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: T.bg,
        color: T.text,
      }}
    >
      <style>{`
        @keyframes coreops-terminal-cursor {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 48,
          padding: "0 18px 0 20px",
          borderBottom: `1px solid ${T.border}`,
          background: T.raised,
          flexShrink: 0,
          gap: 18,
        }}
      >
        <span
          style={{
            color: T.textSub,
            fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          pepe@ppserver: ~/proyectos
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: T.textDim,
            fontSize: 11,
            whiteSpace: "nowrap",
          }}
        >
          <span>Font size</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={decreaseFont}
              disabled={fontSize <= MIN_FONT_SIZE}
              aria-label="Decrease font size"
              style={{
                width: 24,
                height: 24,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${T.border}`,
                borderRadius: 4,
                background: "transparent",
                color: fontSize <= MIN_FONT_SIZE ? T.textDim : T.textSub,
                cursor: fontSize <= MIN_FONT_SIZE ? "not-allowed" : "pointer",
                opacity: fontSize <= MIN_FONT_SIZE ? 0.5 : 1,
              }}
            >
              <Minus size={12} />
            </button>
            <span
              style={{
                width: 24,
                textAlign: "center",
                color: T.textSub,
                fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 11,
              }}
            >
              {fontSize}
            </span>
            <button
              type="button"
              onClick={increaseFont}
              disabled={fontSize >= MAX_FONT_SIZE}
              aria-label="Increase font size"
              style={{
                width: 24,
                height: 24,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${T.border}`,
                borderRadius: 4,
                background: "transparent",
                color: fontSize >= MAX_FONT_SIZE ? T.textDim : T.textSub,
                cursor: fontSize >= MAX_FONT_SIZE ? "not-allowed" : "pointer",
                opacity: fontSize >= MAX_FONT_SIZE ? 0.5 : 1,
              }}
            >
              <Plus size={12} />
            </button>
          </div>

          <span>Appearance</span>
          <select
            value={appearance}
            onChange={(event) => setAppearance(event.target.value as Appearance)}
            aria-label="Terminal appearance"
            style={{
              height: 26,
              minWidth: 74,
              padding: "0 7px",
              border: `1px solid ${T.border}`,
              borderRadius: 4,
              background: T.bg,
              color: T.textSub,
              fontSize: 11,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="Black">Black</option>
            <option value="Dim">Dim</option>
            <option value="White">White</option>
          </select>

          <button
            type="button"
            onClick={reset}
            style={{
              height: 26,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "0 7px",
              border: "none",
              background: "transparent",
              color: T.textDim,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={11} />
            Reset
          </button>
        </div>
      </div>

      <div
        ref={terminalRef}
        onClick={focusTerminal}
        tabIndex={0}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          background: theme.background,
          color: theme.foreground,
          padding: "18px 20px 28px",
          cursor: "text",
          outline: "none",
        }}
      >
        <div
          style={{
            minWidth: "max-content",
            fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize,
            lineHeight: 1.5,
            fontVariantLigatures: "none",
            letterSpacing: 0,
          }}
        >
          {TERMINAL_LINES.map((line, index) => {
            const prompt = line.type === "prompt";
            const command = prompt ? line.command : "";
            const promptText = prompt ? line.text : "";
            const userHost = promptText.startsWith("pepe@ppserver");
            const pathMatch = promptText.match(/:(~(?:\/proyectos)?)\$ $/);

            return (
              <div key={`${line.text}-${index}`} style={{ whiteSpace: "pre" }}>
                {prompt ? (
                  <>
                    <span style={{ color: "#63d471" }}>
                      {userHost ? "pepe" : ""}
                    </span>
                    <span style={{ color: "#9aa4b2" }}>
                      {userHost ? "@ppserver" : ""}
                    </span>
                    <span style={{ color: "#63d471" }}>
                      {pathMatch?.[1] ?? ""}
                    </span>
                    <span style={{ color: "#e5e7eb" }}>$ </span>
                    {command && (
                      <span style={{ color: theme.foreground }}>{command}</span>
                    )}
                    {index === TERMINAL_LINES.length - 1 && (
                      <>
                        <span style={{ color: "#e5e7eb" }}>{input}</span>
                        <span
                          aria-hidden="true"
                          style={{
                            display: "inline-block",
                            width: `${Math.max(fontSize * 0.58, 7)}px`,
                            height: `${fontSize * 1.05}px`,
                            marginLeft: 1,
                            verticalAlign: "-0.15em",
                            background: "#e5e7eb",
                            animation: "coreops-terminal-cursor 1s step-end infinite",
                          }}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <span>{colorizeOutput(line.text)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

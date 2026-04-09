import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

loadManrope("normal", {
  weights: ["500", "700", "800"],
});

loadJetBrainsMono("normal", {
  weights: ["500", "700"],
});

type ShotCardProps = {
  title: string;
  subtitle: string;
  image: string;
  stars: string;
  behind: string;
  x: number;
  y: number;
  rotation: number;
  from: number;
};

const colors = {
  bg: "#0a1020",
  panel: "rgba(10, 17, 36, 0.78)",
  panelBorder: "rgba(255,255,255,0.12)",
  text: "#f4f7fb",
  muted: "rgba(244,247,251,0.72)",
  accent: "#9ae6b4",
  warning: "#ffd166",
  danger: "#ff6b6b",
  cyan: "#7dd3fc",
};

const frameMap = {
  collage: 0,
  pain: 90,
  branches: 180,
  workflow: 270,
  loop: 390,
  claude: 540,
  outro: 630,
};

const lineStyle: React.CSSProperties = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 28,
  lineHeight: 1.5,
  whiteSpace: "pre",
};

const codeLines = [
  "jobs:",
  "  sync:",
  "    uses: DJRHails/patch-stack-action/.github/workflows/patch-stack-sync.yml@main",
  "    with:",
  "      upstream_repo: openclaw/openclaw",
  "      fork_repo: your-org/your-openclaw-fork",
  "      fork_upstream_branch: upstream",
];

const steps = [
  "Mirror upstream/main into fork/upstream",
  "Discover every patch/* branch in the fork",
  "Rebase patches onto parents in dependency order",
  "Rebuild fork/main as upstream + local base + stack",
  "Clean up patches already merged upstream",
];

const ShotCard: React.FC<ShotCardProps> = ({
  title,
  subtitle,
  image,
  stars,
  behind,
  x,
  y,
  rotation,
  from,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({
    fps,
    frame: frame - from,
    config: {
      damping: 18,
      mass: 0.9,
    },
  });
  const drift = interpolate(frame, [from, from + 120], [0, -20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + drift,
        width: 470,
        height: 360,
        padding: 14,
        borderRadius: 28,
        background: "rgba(11, 18, 34, 0.78)",
        border: `1px solid ${colors.panelBorder}`,
        boxShadow: "0 28px 80px rgba(0,0,0,0.35)",
        transform: `scale(${0.82 + entrance * 0.18}) rotate(${rotation}deg)`,
        opacity: entrance,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          color: colors.text,
          fontFamily: "Manrope, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 27, fontWeight: 800 }}>{title}</span>
          <span style={{ fontSize: 17, color: colors.muted }}>{subtitle}</span>
        </div>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            fontSize: 17,
            fontWeight: 700,
          }}
        >
          {stars}
        </div>
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 240,
          overflow: "hidden",
          borderRadius: 20,
          border: `1px solid ${colors.panelBorder}`,
          background: "#dfe7ef",
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top left",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,
            padding: "12px 14px",
            borderRadius: 18,
            background: "rgba(10, 16, 32, 0.82)",
            color: colors.text,
            fontFamily: "Manrope, sans-serif",
          }}
        >
          <div style={{ fontSize: 13, letterSpacing: 1.2, textTransform: "uppercase", color: colors.warning }}>
            Divergence
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{behind}</div>
        </div>
      </div>
    </div>
  );
};

const TitleBlock: React.FC<{ eyebrow: string; title: string; body: string; align?: "left" | "center" }> = ({
  eyebrow,
  title,
  body,
  align = "left",
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        width: align === "center" ? 980 : 780,
        textAlign: align,
      }}
    >
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          textTransform: "uppercase",
          letterSpacing: 2,
          fontSize: 20,
          color: colors.cyan,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontFamily: "Manrope, sans-serif",
          fontWeight: 800,
          fontSize: 76,
          lineHeight: 1,
          color: colors.text,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "Manrope, sans-serif",
          fontWeight: 500,
          fontSize: 30,
          lineHeight: 1.35,
          color: colors.muted,
        }}
      >
        {body}
      </div>
    </div>
  );
};

const StepRow: React.FC<{ label: string; index: number; frameStart: number }> = ({ label, index, frameStart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    fps,
    frame: frame - frameStart - index * 18,
    config: {
      damping: 20,
      mass: 0.8,
    },
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        transform: `translateX(${(1 - progress) * 60}px)`,
        opacity: progress,
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 999,
          background: "linear-gradient(135deg, #8bd3ff, #9ae6b4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#08111f",
          fontSize: 24,
          fontFamily: "JetBrains Mono, monospace",
          fontWeight: 700,
        }}
      >
        {index + 1}
      </div>
      <div
        style={{
          flex: 1,
          padding: "18px 22px",
          borderRadius: 18,
          border: `1px solid ${colors.panelBorder}`,
          background: "rgba(255,255,255,0.06)",
          color: colors.text,
          fontFamily: "Manrope, sans-serif",
          fontSize: 27,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const BranchPill: React.FC<{ branch: string; x: number; y: number; accent?: boolean }> = ({ branch, x, y, accent = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({
    fps,
    frame: frame - frameMap.branches,
    config: {
      damping: 16,
      mass: 0.7,
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        padding: "18px 22px",
        borderRadius: 20,
        background: accent ? "linear-gradient(135deg, rgba(125,211,252,0.22), rgba(154,230,180,0.24))" : "rgba(255,255,255,0.06)",
        border: `1px solid ${accent ? "rgba(125,211,252,0.4)" : colors.panelBorder}`,
        color: colors.text,
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 24,
        transform: `scale(${0.9 + reveal * 0.1})`,
        opacity: reveal,
      }}
    >
      {branch}
    </div>
  );
};

export const OpenClawForkPromo: React.FC = () => {
  const frame = useCurrentFrame();

  const bgShift = interpolate(frame, [0, 720], [0, 1]);
  const vignetteOpacity = interpolate(frame, [0, 720], [0.2, 0.45]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${20 + bgShift * 45}% ${15 + bgShift * 10}%, rgba(56, 189, 248, 0.20), transparent 30%), radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.12), transparent 28%), linear-gradient(145deg, #060b16 0%, ${colors.bg} 45%, #0f1728 100%)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, rgba(6,11,22,0.05), rgba(6,11,22,${vignetteOpacity}))`,
        }}
      />

      <Sequence from={frameMap.collage} durationInFrames={120} premountFor={30}>
        <AbsoluteFill>
          <ShotCard
            title="jiulingyun/openclaw-cn"
            subtitle="Most recognizable high-signal fork"
            image="screenshots/jiulingyun-openclaw-cn.png"
            stars="3.1k stars"
            behind="9052 commits behind"
            x={110}
            y={118}
            rotation={-5}
            from={0}
          />
          <ShotCard
            title="DenchHQ/DenchClaw"
            subtitle="Commercial fork, still drifting hard"
            image="screenshots/DenchHQ-DenchClaw.png"
            stars="515 stars"
            behind="3738 commits behind"
            x={560}
            y={82}
            rotation={3}
            from={8}
          />
          <ShotCard
            title="AtomicBot-ai/atomicbot"
            subtitle="Serious fork, still nearly 3k behind"
            image="screenshots/AtomicBot-ai-atomicbot.png"
            stars="115 stars"
            behind="2959 commits behind"
            x={1045}
            y={180}
            rotation={-2}
            from={16}
          />
          <div
            style={{
              position: "absolute",
              left: 84,
              bottom: 84,
            }}
          >
            <TitleBlock
              eyebrow="The problem"
              title="OpenClaw forks drift fast."
              body="Once a fork picks up local features, upstream changes turn into constant branch surgery."
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={frameMap.pain} durationInFrames={90} premountFor={30}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            paddingLeft: 110,
            paddingRight: 110,
          }}
        >
          <TitleBlock
            eyebrow="Why this hurts"
            title="The first patch is easy. The fourth patch is maintenance debt."
            body="Rebase the fork. Fix stacked branches. Rebuild main. Clean up what landed upstream. Repeat."
          />
          <div
            style={{
              marginTop: 44,
              display: "flex",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            {["Manual rebases", "Stale fork/main", "Patch branch drift", "Merged upstream but still in your fork"].map((item) => (
              <div
                key={item}
                style={{
                  padding: "14px 18px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${colors.panelBorder}`,
                  color: colors.text,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={frameMap.branches} durationInFrames={90} premountFor={30}>
        <AbsoluteFill style={{ padding: "82px 90px" }}>
          <TitleBlock
            eyebrow="No config graph"
            title="Dependencies come from branch names."
            body="Patch parents are inferred from the branch path, so the stack is encoded in Git itself."
          />
          <BranchPill branch="patch/fix-auth" x={90} y={360} accent />
          <BranchPill branch="patch/fix-auth--token-refresh" x={420} y={450} />
          <BranchPill branch="patch/fix-auth--token-refresh--cleanup" x={860} y={540} />
          <BranchPill branch="patch/perf-improvement" x={1080} y={350} />
          <svg width="1600" height="900" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path d="M360 392 C 410 392, 420 480, 420 480" stroke="rgba(125,211,252,0.7)" strokeWidth="5" fill="none" />
            <path d="M760 480 C 840 480, 860 568, 860 568" stroke="rgba(125,211,252,0.7)" strokeWidth="5" fill="none" />
          </svg>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={frameMap.workflow} durationInFrames={120} premountFor={30}>
        <AbsoluteFill
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "88px 90px",
            gap: 48,
          }}
        >
          <div style={{ flex: 1 }}>
            <TitleBlock
              eyebrow="Tiny install surface"
              title="Drop in one caller workflow."
              body="Point it at upstream and your fork. The reusable workflow handles the patch-stack mechanics."
            />
          </div>
          <div
            style={{
              width: 760,
              padding: 34,
              borderRadius: 28,
              background: "rgba(6, 12, 24, 0.88)",
              border: `1px solid ${colors.panelBorder}`,
              boxShadow: "0 28px 80px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 24,
              }}
            >
              {["#ff5f57", "#ffbd2e", "#28c840"].map((color) => (
                <div
                  key={color}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    background: color,
                  }}
                />
              ))}
            </div>
            {codeLines.map((line) => (
              <div key={line} style={lineStyle}>
                <span style={{ color: line.includes("patch-stack-sync.yml") ? colors.accent : colors.text }}>{line}</span>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={frameMap.loop} durationInFrames={150} premountFor={30}>
        <AbsoluteFill style={{ padding: "86px 90px" }}>
          <TitleBlock
            eyebrow="What runs"
            title="patch-stack-action automates the rebase loop."
            body="Mirror upstream. Discover active patches. Rebase in dependency order. Rebuild the fork. Remove stale branches."
          />
          <div
            style={{
              marginTop: 54,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              width: 1180,
            }}
          >
            {steps.map((step, index) => (
              <StepRow key={step} label={step} index={index} frameStart={frameMap.loop + 12} />
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={frameMap.claude} durationInFrames={90} premountFor={30}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: 90,
          }}
        >
          <div
            style={{
              width: 1120,
              padding: "44px 48px",
              borderRadius: 30,
              background: "linear-gradient(145deg, rgba(255,107,107,0.10), rgba(125,211,252,0.10))",
              border: `1px solid rgba(255,255,255,0.14)`,
              boxShadow: "0 28px 80px rgba(0,0,0,0.28)",
            }}
          >
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color: colors.warning,
                fontSize: 20,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Conflict path
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: "Manrope, sans-serif",
                fontSize: 68,
                fontWeight: 800,
                color: colors.text,
                lineHeight: 1.02,
              }}
            >
              Git handles the normal path.
              <br />
              Claude only steps in when rebases break.
            </div>
            <div
              style={{
                marginTop: 22,
                fontFamily: "Manrope, sans-serif",
                fontSize: 30,
                lineHeight: 1.35,
                color: colors.muted,
              }}
            >
              That keeps the product honest: automation first, AI only for the exceptional branch-conflict case.
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={frameMap.outro} durationInFrames={90} premountFor={30}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: 80,
          }}
        >
          <TitleBlock
            eyebrow="Outcome"
            title="Keep an OpenClaw fork alive without manual rebase work."
            body="patch-stack-action keeps fork/main equal to upstream mirror + preserved local base commits + your active patches applied in order."
            align="center"
          />
          <div
            style={{
              marginTop: 36,
              padding: "18px 24px",
              borderRadius: 999,
              border: `1px solid ${colors.panelBorder}`,
              background: "rgba(255,255,255,0.06)",
              color: colors.text,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 24,
            }}
          >
            github.com/DJRHails/patch-stack-action
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

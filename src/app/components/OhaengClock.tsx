import { useState, useEffect, useRef, useCallback } from 'react';
import svgPaths from '../../imports/svg-3q65vljgkw';
import { getOhaengData } from './ohaeng-calendar';
import { OHAENG_COLORS } from './ohaeng-calendar';

// ---------- Orbit path for sec animation (combined decorative bezier curves in screen coords relative to center) ----------
const SEC_ORBIT_PATH =
  'M-179.12,166.74 C-208.48,135.31 -151.00,33.91 -50.74,-59.76 C49.53,-153.42 154.60,-203.88 183.96,-172.46 C213.29,-141.14 155.81,-39.73 55.55,53.94 C-44.72,147.60 -149.79,198.06 -179.15,166.64 Z';

// ---------- Vertical ellipse path for hour/min animation ----------
const TIME_ORBIT_PATH =
  'M0,-290 A150.5,290,0,1,1,0.01,290 A150.5,290,0,1,1,0,-290';

// ---------- Sub-components ----------

function Year({ fillColor }: { fillColor: string }) {
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute h-[181.061px] left-[calc(50%-125.19px)] top-[calc(50%-362.47px)] w-[26.459px]"
      data-name="year"
    >
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26.4593 181.061">
        <path d={svgPaths.p13a0200} fill={fillColor} id="Vector" />
      </svg>
    </div>
  );
}

function Month({ fillColor }: { fillColor: string }) {
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%-79.95px)] size-[246.1px] top-[calc(50%-89.29px)] opacity-90"
      data-name="month"
    >
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 246.1 246.1">
        <path d={svgPaths.p4e43880} fill={fillColor} id="Vector" />
      </svg>
    </div>
  );
}

function DayShape({ fillColor }: { fillColor: string }) {
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+52.01px)] size-[302.922px] top-[calc(50%+86.75px)] opacity-90"
      data-name="day"
    >
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 302.922 302.922">
        <path d={svgPaths.p11da8000} fill={fillColor} id="Vector" />
      </svg>
    </div>
  );
}

// Mon12 – show bars 1..currentMonth with full opacity, rest hidden
function Mon12({ currentMonth }: { currentMonth: number }) {
  // Mon12 items definition: position, viewBox, pathKey, dataName
  const items: Array<{
    inset: string;
    vw: string;
    vh: string;
    pathKey: keyof typeof svgPaths;
    name: string;
    num: number;
  }> = [
    { inset: '0 76.72% 0 0', vw: '8.35557', vh: '36.9038', pathKey: 'p4b00400', name: '1', num: 1 },
    { inset: '0 38.36%', vw: '8.35556', vh: '36.9038', pathKey: 'p242799f0', name: '2', num: 2 },
    { inset: '0 0 0 76.72%', vw: '8.35557', vh: '36.9038', pathKey: 'p4b00400', name: '3', num: 3 },
    { inset: '207.31% 177.56% -207.31% -100.84%', vw: '32', vh: '32', pathKey: 'p4b00400', name: '4', num: 4 },
    { inset: '207.31% 139.2% -207.31% -62.47%', vw: '32', vh: '32', pathKey: 'p242799f0', name: '5', num: 5 },
    { inset: '207.31% 100.84% -207.31% -24.11%', vw: '32', vh: '32', pathKey: 'p4b00400', name: '6', num: 6 },
    { inset: '63.69% 219.35% -63.69% -142.62%', vw: '32', vh: '32', pathKey: 'p4b00400', name: '7', num: 7 },
    { inset: '63.69% 180.98% -63.69% -104.26%', vw: '32', vh: '32', pathKey: 'p242799f0', name: '8', num: 8 },
    { inset: '63.69% 142.62% -63.69% -65.9%', vw: '32', vh: '32', pathKey: 'p4b00400', name: '9', num: 9 },
    { inset: '-153.09% -56.44% 153.09% 133.16%', vw: '32', vh: '32', pathKey: 'p4b00400', name: '10', num: 10 },
    { inset: '-153.09% -94.8% 153.09% 171.52%', vw: '32', vh: '32', pathKey: 'p242799f0', name: '11', num: 11 },
    { inset: '-153.09% -133.16% 153.09% 209.88%', vw: '32', vh: '32', pathKey: 'p4b00400', name: '12', num: 12 },
  ];

  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute h-[36.904px] left-[calc(50%-56.28px)] top-[calc(50%-120.05px)] w-[35.898px]"
      data-name="mon12"
    >
      {items.map((item) => {
        const visible = item.num <= currentMonth;
        return (
          <div
            key={item.name}
            className="absolute"
            style={{ inset: item.inset }}
            data-name={item.name}
          >
            <svg
              className="absolute block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox={`0 0 ${item.vw} ${item.vh}`}
            >
              <path
                d={svgPaths[item.pathKey]}
                fill="#212121"
                opacity={visible ? 1 : 0}
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

// Day31 – show bars 1..currentDay as black, rest as gray
function Day31({ currentDay }: { currentDay: number }) {
  // Day31 items: position data extracted from Figma
  const items: Array<{
    inset: string;
    vw: string;
    vh: string;
    pathKey: keyof typeof svgPaths;
    name: string;
    num: number;
  }> = [
    { inset: '0 93.75% 86.06% 0', vw: '4.17778', vh: '16.0149', pathKey: 'p3e9dfb00', name: '1', num: 1 },
    { inset: '0 78.13% 86.06% 15.62%', vw: '4.17781', vh: '16.0149', pathKey: 'p242e470', name: '2', num: 2 },
    { inset: '0 62.5% 86.06% 31.25%', vw: '4.17778', vh: '16.0149', pathKey: 'p3e9dfb00', name: '3', num: 3 },
    { inset: '0 46.87% 86.06% 46.87%', vw: '4.17781', vh: '16.0149', pathKey: 'p242e470', name: '4', num: 4 },
    { inset: '0 31.25% 86.06% 62.5%', vw: '4.17778', vh: '16.0149', pathKey: 'p3e9dfb00', name: '5', num: 5 },
    { inset: '0 15.62% 86.06% 78.13%', vw: '4.17781', vh: '16.0149', pathKey: 'p242e470', name: '6', num: 6 },
    { inset: '0 0 86.06% 93.75%', vw: '4.17778', vh: '16.0149', pathKey: 'p3e9dfb00', name: '7', num: 7 },
    { inset: '21.52% 93.75% 64.55% 0', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '8', num: 8 },
    { inset: '21.52% 78.13% 64.55% 15.62%', vw: '4.17781', vh: '16.0148', pathKey: 'p2dce9180', name: '9', num: 9 },
    { inset: '21.52% 62.5% 64.55% 31.25%', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '10', num: 10 },
    { inset: '21.52% 46.87% 64.55% 46.87%', vw: '4.17781', vh: '16.0148', pathKey: 'p2dce9180', name: '11', num: 11 },
    { inset: '21.52% 31.25% 64.55% 62.5%', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '12', num: 12 },
    { inset: '21.52% 15.62% 64.55% 78.13%', vw: '4.17781', vh: '16.0148', pathKey: 'p2dce9180', name: '13', num: 13 },
    { inset: '21.52% 0 64.55% 93.75%', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '14', num: 14 },
    { inset: '43.03% 93.75% 43.03% 0', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '15', num: 15 },
    { inset: '43.03% 78.13% 43.03% 15.62%', vw: '4.17781', vh: '16.0148', pathKey: 'p2dce9180', name: '16', num: 16 },
    { inset: '43.03% 62.5% 43.03% 31.25%', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '17', num: 17 },
    { inset: '43.03% 46.87%', vw: '4.17781', vh: '16.0148', pathKey: 'p2dce9180', name: '18', num: 18 },
    { inset: '43.03% 31.25% 43.03% 62.5%', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '19', num: 19 },
    { inset: '43.03% 15.62% 43.03% 78.13%', vw: '4.17781', vh: '16.0148', pathKey: 'p2dce9180', name: '20', num: 20 },
    { inset: '43.03% 0 43.03% 93.75%', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '21', num: 21 },
    { inset: '64.55% 93.75% 21.52% 0', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '22', num: 22 },
    { inset: '64.55% 78.13% 21.52% 15.62%', vw: '4.17781', vh: '16.0148', pathKey: 'p2dce9180', name: '23', num: 23 },
    { inset: '64.55% 62.5% 21.52% 31.25%', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '24', num: 24 },
    { inset: '64.55% 46.87% 21.52% 46.87%', vw: '4.17781', vh: '16.0148', pathKey: 'p2dce9180', name: '25', num: 25 },
    { inset: '64.55% 31.25% 21.52% 62.5%', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '26', num: 26 },
    { inset: '64.55% 15.62% 21.52% 78.13%', vw: '4.17781', vh: '16.0148', pathKey: 'p2dce9180', name: '27', num: 27 },
    { inset: '64.55% 0 21.52% 93.75%', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '28', num: 28 },
    { inset: '86.06% 93.75% 0 0', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '29', num: 29 },
    { inset: '86.06% 78.13% 0 15.62%', vw: '4.17781', vh: '16.0148', pathKey: 'p2dce9180', name: '30', num: 30 },
    { inset: '86.06% 62.5% 0 31.25%', vw: '4.17778', vh: '16.0148', pathKey: 'p30a47e00', name: '31', num: 31 },
  ];

  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute h-[114.889px] left-[calc(50%+115.6px)] mix-blend-multiply top-[calc(50%+204.32px)] w-[66.845px]"
      data-name="day31"
    >
      {items.map((item) => {
        const color = item.num <= currentDay ? '#212121' : '#C2C2C2';
        return (
          <div key={item.name} className="absolute" style={{ inset: item.inset }} data-name={item.name}>
            <svg
              className="absolute block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox={`0 0 ${item.vw} ${item.vh}`}
            >
              <path d={svgPaths[item.pathKey]} fill={color} />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

// Decorative orbit strokes
function OrbitStroke1() {
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute h-[348.533px] left-[calc(50%-1.62px)] top-[calc(50%-7.73px)] w-[370.755px]"
      data-name="Vector"
    >
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 371.11 348.878">
        <path d={svgPaths.p28e44540} stroke="#212121" strokeMiterlimit="10" strokeWidth="0.41101" />
      </svg>
    </div>
  );
}

function OrbitStroke2() {
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute h-[348.533px] left-[calc(50%+6.05px)] top-[calc(50%+1.6px)] w-[370.755px]"
      data-name="Vector"
    >
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 371.11 348.878">
        <path d={svgPaths.p34eb4a80} stroke="#212121" strokeMiterlimit="10" strokeWidth="0.41101" />
      </svg>
    </div>
  );
}

// Hour circle (animated position, stroke color from ohaeng) - inside stroke 4px
function HourDot({ x, y, strokeColor }: { x: number; y: number; strokeColor: string }) {
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute size-[60px]"
      style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
      data-name="hour"
    >
      <div className="absolute inset-[-2.83%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 76.6209 76.6209">
          <defs>
            <clipPath id="hourClip">
              <path d={svgPaths.pb051000} />
            </clipPath>
          </defs>
          <path
            d={svgPaths.pb051000}
            fill="#212121"
            stroke={strokeColor}
            strokeMiterlimit="10"
            strokeWidth="8"
            clipPath="url(#hourClip)"
          />
        </svg>
      </div>
    </div>
  );
}

// Min circle (animated position, stroke color from ohaeng) - inside stroke 4px
function MinDot({ x, y, strokeColor }: { x: number; y: number; strokeColor: string }) {
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute size-[40px]"
      style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
      data-name="min"
    >
      <div className="absolute inset-[-4.68%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48.0318 48.0318">
          <defs>
            <clipPath id="minClip">
              <path d={svgPaths.pd245540} />
            </clipPath>
          </defs>
          <path
            d={svgPaths.pd245540}
            fill="#212121"
            stroke={strokeColor}
            strokeMiterlimit="10"
            strokeWidth="8"
            clipPath="url(#minClip)"
          />
        </svg>
      </div>
    </div>
  );
}

// 오행 색상 순환: 목→화→토→금→수, 각 2초씩 (10초 1사이클) — ohaeng-calendar 컴포넌트 색상 사용
const OHAENG_CYCLE_COLORS = [
  OHAENG_COLORS.wood,   // 목 #00A651
  OHAENG_COLORS.fire,   // 화 #C40808
  OHAENG_COLORS.earth,  // 토 #F0FF00
  OHAENG_COLORS.metal,  // 금 #FFFFFF
  OHAENG_COLORS.water,  // 수 #212121
];

// Sec dot (animated position)
function SecDot({ x, y, fillColor }: { x: number; y: number; fillColor: string }) {
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute size-[23.049px]"
      style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
      data-name="sec"
    >
      <svg className="absolute block size-full opacity-90" fill="none" preserveAspectRatio="none" viewBox="0 0 23.0494 23.0494">
        <path
          d={svgPaths.p2a451900}
          style={{ fill: fillColor, transition: 'fill 1.5s ease-in-out' }}
        />
      </svg>
    </div>
  );
}

// ---------- Path position helper ----------
function getPointOnPath(pathEl: SVGPathElement | null, fraction: number): { x: number; y: number } {
  if (!pathEl) return { x: 0, y: 0 };
  const totalLength = pathEl.getTotalLength();
  const point = pathEl.getPointAtLength(((fraction % 1) + 1) % 1 * totalLength);
  return { x: point.x, y: point.y };
}

// ---------- Main component ----------
export default function OhaengClock() {
  const [now, setNow] = useState(new Date());
  const secPathRef = useRef<SVGPathElement>(null);
  const timePathRef = useRef<SVGPathElement>(null);
  const rafRef = useRef<number>(0);

  // Animated positions
  const [secPos, setSecPos] = useState({ x: 107.94, y: -0.39 });
  const [hourPos, setHourPos] = useState({ x: -96.74, y: 282.26 });
  const [minPos, setMinPos] = useState({ x: 85.96, y: -294.04 });

  const animate = useCallback(() => {
    const date = new Date();
    setNow(date);

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ms = date.getMilliseconds();

    // Sec: 60 seconds per revolution on secPath
    const secFraction = (seconds + ms / 1000) / 60;
    const sp = getPointOnPath(secPathRef.current, secFraction);
    setSecPos(sp);

    // Hour: 12 hours per revolution on timePath
    const hourFraction = ((hours % 12) + minutes / 60 + seconds / 3600) / 12;
    const hp = getPointOnPath(timePathRef.current, hourFraction);
    setHourPos(hp);

    // Min: 60 minutes per revolution on timePath
    const minFraction = (minutes + seconds / 60) / 60;
    const mp = getPointOnPath(timePathRef.current, minFraction);
    setMinPos(mp);

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  // Get ohaeng colors
  const ohaeng = getOhaengData(now);
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  return (
    <div className="bg-[#ededed] min-h-screen w-full">
      <div className="relative w-full min-h-screen max-w-[360px] mx-auto" data-name="test01">
        {/* Hidden SVGs for path calculations */}
        <svg
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <path
            ref={secPathRef}
            d={SEC_ORBIT_PATH}
          />
          <path
            ref={timePathRef}
            d={TIME_ORBIT_PATH}
          />
        </svg>

        {/* Main content container */}
        <div className="absolute inset-0" style={{ transform: 'translateY(30px)' }} data-name="con">
          {/* Orbit strokes (decorative) */}
          <OrbitStroke1 />

          {/* Static calendar elements */}
          <Year fillColor={ohaeng.yearColor} />
          <Month fillColor={ohaeng.monthColor} />
          <DayShape fillColor={ohaeng.dayColor} />
          <Mon12 currentMonth={currentMonth} />
          <Day31 currentDay={currentDay} />

          <OrbitStroke2 />

          {/* Animated time elements */}
          <HourDot x={hourPos.x} y={hourPos.y} strokeColor={ohaeng.hourStrokeColor} />
          <MinDot x={minPos.x} y={minPos.y} strokeColor={ohaeng.hourStrokeColor} />
          <SecDot x={secPos.x} y={secPos.y} fillColor={OHAENG_CYCLE_COLORS[Math.floor(now.getSeconds() / 2) % 5]} />
        </div>
      </div>
    </div>
  );
}
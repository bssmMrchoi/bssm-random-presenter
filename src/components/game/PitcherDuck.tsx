interface PitcherDuckProps {
  isWindup: boolean;
  isPitching: boolean;
}

export function PitcherDuck({ isWindup, isPitching }: PitcherDuckProps) {
  const rightWingCx = isWindup ? 90 : isPitching ? 104 : 95;
  const rightWingCy = isWindup ? 90 : isPitching ? 122 : 112;
  const leftWingCx = isWindup ? 18 : 25;
  const leftWingCy = isWindup ? 106 : 112;

  return (
    <div className={`pitcher-container ${isWindup ? "windup" : ""} ${isPitching ? "pitched" : ""}`}>
      <svg viewBox="0 0 120 188" width="120" height="188">
        {/* 몸통 */}
        <ellipse cx="60" cy="130" rx="32" ry="42" fill="white" stroke="#ddd" strokeWidth="0.5" />
        <path d="M 34,106 Q 60,101 86,106 L 88,164 Q 60,169 32,164 Z" fill="#1B3A6B" />
        <text x="60" y="131" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white" letterSpacing="1">Giants</text>
        <text x="60" y="149" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" opacity="0.8">18</text>

        {/* 왼쪽 날개 (글러브) */}
        <ellipse cx={leftWingCx} cy={leftWingCy} rx="13" ry="8"
          fill="#1B3A6B" stroke="#0f2548" strokeWidth="0.5"
          className="transition-all duration-400" />
        <ellipse cx={leftWingCx - 1} cy={leftWingCy + 1} rx="7" ry="5"
          fill="#7A3B10"
          className="transition-all duration-400" />

        {/* 오른쪽 날개 (투구) */}
        <ellipse cx={rightWingCx} cy={rightWingCy} rx="13" ry="8"
          fill="#1B3A6B" stroke="#0f2548" strokeWidth="0.5"
          className="transition-all duration-400" />

        {/* 다리 */}
        <rect x="50" y="169" width="8" height="10" rx="2" fill="#FF8C00" />
        <rect x="62" y="169" width="8" height="10" rx="2" fill="#FF8C00" />

        {/* 오리발 */}
        <ellipse cx="47" cy="180" rx="12" ry="4.5" fill="#FF8C00" />
        <ellipse cx="41" cy="178" rx="5" ry="3" fill="#FF8C00" />
        <ellipse cx="73" cy="180" rx="12" ry="4.5" fill="#FF8C00" />
        <ellipse cx="79" cy="178" rx="5" ry="3" fill="#FF8C00" />

        {/* 머리 */}
        <circle cx="60" cy="53" r="30" fill="white" stroke="#ddd" strokeWidth="0.5" />

        {/* 야구 모자 */}
        <ellipse cx="60" cy="31" rx="24" ry="17" fill="#1B3A6B" />
        <path d="M 34,39 L 90,39 Q 97,39 96,44 L 88,44 L 34,44 Z" fill="#122B52" />
        <text x="60" y="36" textAnchor="middle" fontSize="13" fontWeight="900" fill="white" fontFamily="Georgia, serif">G</text>

        {/* 부리 (오렌지 오리 부리) */}
        <path d="M 83,50 Q 100,47 107,52 Q 105,56 83,57 Z" fill="#FF8C00" />
        <path
          d={isPitching ? "M 83,55 Q 100,52 106,55 Q 104,61 83,59 Z" : "M 83,55 Q 100,53 106,54 Q 104,58 83,58 Z"}
          fill="#E67300"
          className="transition-all duration-300"
        />
        <path d="M 84,51 Q 98,48 105,52" fill="none" stroke="rgba(255,210,120,0.5)" strokeWidth="1" />

        {/* 눈 */}
        <circle cx="50" cy="48" r="8" fill="white" />
        <circle cx="50" cy="48" r="5.2" fill="#1a1a2e" />
        <circle cx="52.5" cy="45.5" r="1.8" fill="white" />
        <circle cx="69" cy="46" r="8" fill="white" />
        <circle cx="69" cy="46" r="5.2" fill="#1a1a2e" />
        <circle cx="71.5" cy="43.5" r="1.8" fill="white" />

        {isWindup && (
          <>
            <path d="M 43,41 Q 50,38 57,41" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
            <path d="M 62,39 Q 69,36 76,39" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {/* 볼터치 */}
        <ellipse cx="41" cy="55" rx="5" ry="3" fill="#FFB3B3" opacity="0.4" />
        <ellipse cx="79" cy="53" rx="5" ry="3" fill="#FFB3B3" opacity="0.4" />
      </svg>
    </div>
  );
}

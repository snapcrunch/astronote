const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={512}
    height={512}
    fill="none"
    {...props}
  >
    <defs>
      <linearGradient
        id="c"
        x1={120}
        x2={380}
        y1={120}
        y2={392}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#7C5CFF" />
        <stop offset={1} stopColor="#4CC9F0" />
      </linearGradient>
      <linearGradient
        id="a"
        x1={90}
        x2={422}
        y1={280}
        y2={230}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#9B87FF" />
        <stop offset={1} stopColor="#C9F2FF" />
      </linearGradient>
      <clipPath id="d">
        <circle cx={256} cy={256} r={128} />
      </clipPath>
      <filter
        id="b"
        width={512}
        height={512}
        x={0}
        y={0}
        filterUnits="userSpaceOnUse"
      >
        <feDropShadow dx={0} dy={12} floodOpacity={0.18} stdDeviation={16} />
      </filter>
    </defs>
    <ellipse
      cx={256}
      cy={272}
      stroke="url(#a)"
      strokeLinecap="round"
      strokeWidth={24}
      opacity={0.9}
      rx={178}
      ry={52}
      transform="rotate(-12 256 272)"
    />
    <g filter="url(#b)">
      <circle cx={256} cy={256} r={128} fill="url(#c)" />
      <g fill="#FFF" clipPath="url(#d)" opacity={0.22}>
        <ellipse
          cx={228}
          cy={210}
          rx={92}
          ry={26}
          transform="rotate(-15 228 210)"
        />
        <ellipse
          cx={286}
          cy={250}
          rx={110}
          ry={30}
          transform="rotate(-15 286 250)"
        />
        <ellipse
          cx={234}
          cy={304}
          rx={84}
          ry={24}
          transform="rotate(-15 234 304)"
        />
      </g>
      <g transform="rotate(10 -841.124 1444.176)">
        <rect width={122} height={122} fill="#FFF2A8" rx={16} />
        <path fill="#FFE36E" d="M92 0h14c8.837 0 16 7.163 16 16v14L92 0Z" />
        <rect
          width={62}
          height={8}
          x={22}
          y={36}
          fill="#D8C55A"
          opacity={0.9}
          rx={4}
        />
        <rect
          width={78}
          height={8}
          x={22}
          y={58}
          fill="#D8C55A"
          opacity={0.9}
          rx={4}
        />
        <rect
          width={54}
          height={8}
          x={22}
          y={80}
          fill="#D8C55A"
          opacity={0.9}
          rx={4}
        />
      </g>
      <g fill="#FFF" opacity={0.9}>
        <circle cx={160} cy={164} r={5} />
        <circle cx={356} cy={146} r={4} />
        <circle cx={372} cy={334} r={5} />
      </g>
    </g>
    <path
      stroke="url(#a)"
      strokeLinecap="round"
      strokeWidth={24}
      d="M92 292c30 42 98 68 174 68 69 0 130-21 162-55"
      opacity={0.95}
    />
  </svg>
);

export default SvgComponent;

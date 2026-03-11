interface LogoProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
}

const SVGComponent = ({ width = 512, height = 512, ...props }: LogoProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient
        id="planetGrad"
        x1={120}
        y1={120}
        x2={380}
        y2={392}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#7C5CFF" />
        <stop offset={1} stopColor="#4CC9F0" />
      </linearGradient>
      <linearGradient
        id="ringGrad"
        x1={90}
        y1={280}
        x2={422}
        y2={230}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#9B87FF" />
        <stop offset={1} stopColor="#C9F2FF" />
      </linearGradient>
      <filter
        id="shadow"
        x={0}
        y={0}
        width={512}
        height={512}
        filterUnits="userSpaceOnUse"
      >
        <feDropShadow dx={0} dy={12} stdDeviation={16} floodOpacity={0.18} />
      </filter>
      <clipPath id="planetClip">
        <circle cx={256} cy={256} r={128} />
      </clipPath>
    </defs>
    <ellipse
      cx={256}
      cy={272}
      rx={178}
      ry={52}
      transform="rotate(-12 256 272)"
      fill="none"
      stroke="url(#ringGrad)"
      strokeWidth={24}
      strokeLinecap="round"
      opacity={0.9}
    />
    <g filter="url(#shadow)">
      <circle cx={256} cy={256} r={128} fill="url(#planetGrad)" />
      <g clipPath="url(#planetClip)" opacity={0.22} fill="#FFFFFF">
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
      <g transform="translate(238 168) rotate(10)">
        <rect x={0} y={0} width={122} height={122} rx={16} fill="#FFF2A8" />
        <path
          d="M92 0H106C114.837 0 122 7.16344 122 16V30L92 0Z"
          fill="#FFE36E"
        />
        <rect
          x={22}
          y={36}
          width={62}
          height={8}
          rx={4}
          fill="#D8C55A"
          opacity={0.9}
        />
        <rect
          x={22}
          y={58}
          width={78}
          height={8}
          rx={4}
          fill="#D8C55A"
          opacity={0.9}
        />
        <rect
          x={22}
          y={80}
          width={54}
          height={8}
          rx={4}
          fill="#D8C55A"
          opacity={0.9}
        />
      </g>
      <g fill="#FFFFFF" opacity={0.9}>
        <circle cx={160} cy={164} r={5} />
        <circle cx={356} cy={146} r={4} />
        <circle cx={372} cy={334} r={5} />
      </g>
    </g>
    <path
      d="M92 292C122 334 190 360 266 360C335 360 396 339 428 305"
      fill="none"
      stroke="url(#ringGrad)"
      strokeWidth={24}
      strokeLinecap="round"
      opacity={0.95}
    />
  </svg>
);
export default SVGComponent;

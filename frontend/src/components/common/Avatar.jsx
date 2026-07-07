const Avatar = ({
  src,
  name = "",
  size = "md",
  online = false,
  className = "",
  ring = false,
}) => {
  const sizes = {
    xs: "w-7 h-7 text-xs",
    sm: "w-9 h-9 text-sm",
    md: "w-11 h-11 text-base",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
    "2xl": "w-28 h-28 md:w-36 md:h-36 text-3xl md:text-4xl",
  };

  const onlineDotSizes = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
    xl: "w-4 h-4",
    "2xl": "w-5 h-5",
  };

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const colors = [
    "from-[#2258d6] to-[#7458f0]",
    "from-[#7458f0] to-[#d6478f]",
    "from-[#0ea5e9] to-[#2258d6]",
    "from-[#12b76a] to-[#0d9488]",
    "from-[#f59e0b] to-[#ea580c]",
  ];

  // Deterministic color from name
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {ring ? (
        <div className="story-ring p-[2px] rounded-full">
          <div
            className={`${sizes[size]} rounded-full bg-[var(--color-bg)] p-[2px]`}
          >
            {src ? (
              <img
                src={src}
                alt={name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center font-semibold text-white`}
              >
                {initials || "?"}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`${sizes[size]} rounded-full overflow-hidden shrink-0 ring-1 ring-black/[0.04]`}
        >
          {src ? (
            <img src={src} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center font-semibold text-white`}
            >
              {initials || "?"}
            </div>
          )}
        </div>
      )}
      {online && (
        <span
          className={`absolute bottom-0 right-0 ${onlineDotSizes[size]} rounded-full bg-[var(--color-success)] border-2 border-[var(--color-surface)]`}
        />
      )}
    </div>
  );
};

export default Avatar;

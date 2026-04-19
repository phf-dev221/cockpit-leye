import type { HTMLAttributes } from "react";

const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`rounded-xl2 border border-white/60 bg-white/82 p-5 text-ink shadow-panel backdrop-blur-sm sm:p-6 ${className || ""}`}
      {...props}
    />
  );
};

export { Card };
export default Card;

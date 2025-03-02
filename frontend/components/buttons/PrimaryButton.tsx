import { ReactNode } from "react";

export const PrimaryButton = ({
  children,
  onClick,
  size = "small",
}: {
  children: ReactNode;
  onClick: () => void;
  size?: "big" | "small";
}) => {
  return (
    <div
      className={`${size === "small" ? "text-sm px-8 py-2 max-w-40" : "text-xl px-14 py-3 max-w-72"} 
      bg-amber-500 text-white cursor-pointer flex items-center justify-center rounded-full 
      hover:shadow-md border`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

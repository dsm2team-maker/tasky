import Image from "next/image";
import Link from "next/link";
import { routes } from "@/config/routes";

interface LogoProps {
  size?: "sm" | "base" | "lg";
  linkable?: boolean;
}

const sizes = {
  sm: { width: 32, height: 32, className: "h-8 w-auto" },
  base: { width: 40, height: 40, className: "h-10 w-auto" },
  lg: { width: 48, height: 48, className: "h-12 w-auto" },
};

export default function Logo({ size = "base", linkable = true }: LogoProps) {
  const { width, height, className } = sizes[size];

  const image = (
    <Image
      src="/images/logo-tasky.png"
      alt="Tasky"
      width={100}
      height={80}
      quality={100}
      priority
    />
  );

  if (!linkable) return image;

  return (
    <Link href={routes.public.home} className="flex items-center">
      {image}
    </Link>
  );
}

import Link from "next/link";
import type { ComponentProps } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
  };

/** Accessible Link styled as Button (Base UI render pattern). */
export function ButtonLink({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonLinkProps) {
  return (
    <Button
      nativeButton={false}
      variant={variant}
      size={size}
      className={cn(className)}
      render={<Link {...props} />}
    />
  );
}

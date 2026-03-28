'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  showLoginButton?: boolean;
}

export default function Navbar({ showLoginButton = true }: NavbarProps) {
  return (
    <nav className="flex justify-between items-center p-4">
      <Link href="/">
        <span className="text-primary font-bold text-xl cursor-pointer">ClearOwe</span>
      </Link>
      {showLoginButton && (
        <Button variant="default" asChild>
          <Link href="/login">Log in</Link>
        </Button>
      )}
    </nav>
  );
}

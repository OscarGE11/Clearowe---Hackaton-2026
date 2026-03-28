'use client';

import { SparkleIcon, UsersIcon, WalletIcon } from '@phosphor-icons/react';
import Navbar from '@/app/(components)/Navbar';
import FeatureCard from '@/app/(components)/FeatureCard';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar showLoginButton={true} />
      <hr className="border-border" />

      {/* Main Content */}
      <div className="text-center mt-16 px-4">
        <span className="inline-flex items-center bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold tracking-wide uppercase">
          <SparkleIcon size={12} className="text-primary mb-4" weight="fill" />
          Smart Expense Splitting
        </span>
        <h1 className="text-6xl font-extrabold mt-6 text-white leading-tight">
          Split expenses, <br /> not friendships.
        </h1>
        <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
          ClearOwe helps you effortlessly manage shared expenses with friends and family. Say
          goodbye to awkward money conversations and hello to clear, easy settlements.
        </p>

        {/* Cards Section */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 pb-16">
          <FeatureCard
            icon={<SparkleIcon size={48} className="text-primary mb-4" weight="fill" />}
            title="Smart Balance Sorting"
            description="Our intelligent algorithm minimizes the number of transactions needed to settle debts."
          />
          <FeatureCard
            icon={<UsersIcon size={48} className="text-primary mb-4" weight="fill" />}
            title="Group Splits"
            description="Easily create groups, add members, and split bills fairly, no matter how complex."
          />
          <FeatureCard
            icon={<WalletIcon size={48} className="text-primary mb-4" weight="fill" />}
            title="Effortless Tracking"
            description="Keep a clear record of who owes whom and track all your shared expenses in one place."
          />
        </div>
      </div>
    </div>
  );
}

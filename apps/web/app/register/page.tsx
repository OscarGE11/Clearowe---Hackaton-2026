import RegisterCard from './(components)/RegisterCard';
import Navbar from '@/app/(components)/Navbar';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar showLoginButton={false} />
      <hr className="border-border" />
      <div className="flex-1 w-full">
        <RegisterCard />
      </div>
    </div>
  );
}

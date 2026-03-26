import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginCard() {
  return (
    <>
      <div className="flex justify-center">
        <div className="flex flex-col w-1/2 gap-2">
          <Link href="/" className="text-white/40 hover:text-primary">
            <span>/Home page</span>
          </Link>
          <Card>
            <CardHeader>
              <h1 className="text-white text-center text-2xl">Login</h1>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input type="email" placeholder="Email..." />
              <Input type="password" placeholder="Password..." />
              <div className="flex justify-center">
                {" "}
                <Button variant="default">Log in</Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <span className="text-white/40">
                No account?{" "}
                <Link href="/register" className="text-primary underline">
                  Register
                </Link>
              </span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}

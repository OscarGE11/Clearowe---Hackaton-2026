"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AppHeader from "./(components)/AppHeader";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <AppHeader title="ClearOwe"></AppHeader>
      <div className="w-full flex gap-3 mt-20 items-start">
        <Card className="w-4/3">
          <CardHeader>
            <h1 className="font-bold text-xl text-white flex justify-center">
              Easily track who owes you money — and who you owe
            </h1>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Image
              src="/"
              alt="Imagen de como quedaría el final de un cálculo de deudas"
              width={12}
              height={12}
            ></Image>
          </CardContent>
        </Card>
        <Card className="w-1/2">
          <CardContent>
            <div className="font-bold text-lg text-white flex justify-center">
              It&apos;s easy, just create a group, enter the members, and start
              tracking!
            </div>
          </CardContent>
        </Card>
      </div>
      <footer className="flex justify-center mt-15">
        <Button className="w-fit rounded-md" asChild>
          <Link href="/login">Get Started</Link>
        </Button>
      </footer>
    </>
  );
}

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Next.js Starter</h1>
      <p className="mt-4 text-lg text-gray-600">
        Replace this with your application.
      </p>
      <div className="mt-8">
        <Button>Get started</Button>
      </div>
    </main>
  );
}
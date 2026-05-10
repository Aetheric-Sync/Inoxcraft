import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-medium">Page not found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link href="/dashboard" className="text-inox-600 underline underline-offset-4">
        Return to dashboard
      </Link>
    </div>
  );
}

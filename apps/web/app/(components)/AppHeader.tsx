export default function AppHeader({ title }: { title: string }) {
  return (
    <header>
      <h1 className="flex justify-center mt-5">
        <span className="text-9xl" style={{ textShadow: '10px 4px 8px rgba(0,0,0,0.9)' }}>
          {title}
        </span>
      </h1>
    </header>
  );
}

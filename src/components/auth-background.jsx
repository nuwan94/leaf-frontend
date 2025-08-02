import Bg from '@/assets/bg.jpg';

export function AuthBackground() {
  return (
    <div className="bg-muted relative hidden md:block">
      <img
        src={Bg}
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

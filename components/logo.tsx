import Image from 'next/image';
export function Logo() {
  return (
    <Image src="/logo.png" alt="Logo" loading="eager" width={40} height={40} />
  );
}
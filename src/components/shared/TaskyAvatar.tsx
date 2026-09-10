import Image from "next/image";

export default function TaskyAvatar() {
  return (
    <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-purple-100">
      <Image
        src="/images/logo-tasky.png"
        alt="Tasky"
        width={28}
        height={28}
        className="object-contain"
      />
    </div>
  );
}

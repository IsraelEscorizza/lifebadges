import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes}min`;
  if (hours < 24) return `há ${hours}h`;
  if (days < 7) return `há ${days}d`;
  return formatDate(date);
}

export function generateUsername(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
}

export const VALIDATION_THRESHOLD = 5;
export const CONTEST_REJECTION_THRESHOLD = 3;

export function getAchievementStatus(validates: number, contests: number) {
  if (validates >= VALIDATION_THRESHOLD) return "EARNED";
  if (contests >= CONTEST_REJECTION_THRESHOLD && contests > validates) return "CONTESTED";
  return "PENDING";
}

export const rarityConfig = {
  COMMON: { label: "Comum", color: "#9ca3af", bg: "bg-gray-100 text-gray-600" },
  UNCOMMON: { label: "Incomum", color: "#22c55e", bg: "bg-green-100 text-green-700" },
  RARE: { label: "Raro", color: "#3b82f6", bg: "bg-blue-100 text-blue-700" },
  EPIC: { label: "Épico", color: "#a855f7", bg: "bg-purple-100 text-purple-700" },
  LEGENDARY: { label: "Lendário", color: "#f59e0b", bg: "bg-secondary text-neon-500" },
} as const;

export const categoryConfig = {
  EDUCATION: { label: "Educação", icon: "📚" },
  CAREER: { label: "Carreira", icon: "💼" },
  PERSONAL: { label: "Pessoal", icon: "⭐" },
  TRAVEL: { label: "Viagens", icon: "✈️" },
  HEALTH: { label: "Saúde", icon: "💪" },
  RELATIONSHIPS: { label: "Relacionamentos", icon: "❤️" },
  FINANCE: { label: "Finanças", icon: "💰" },
  SPORTS: { label: "Esportes", icon: "🏅" },
  ARTS: { label: "Artes", icon: "🎨" },
  TECHNOLOGY: { label: "Tecnologia", icon: "💻" },
  OTHER: { label: "Outros", icon: "🌟" },
} as const;

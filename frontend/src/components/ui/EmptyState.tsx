import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-[#E8DFD6]">
      {Icon ? <Icon className="mx-auto mb-4 h-10 w-10 text-[#6B5E57]" /> : null}
      <p className="mb-2 font-medium">{title}</p>
      {description ? <p className="mb-4 text-sm text-[#6B5E57]">{description}</p> : null}
      {action}
    </div>
  );
}

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  tool: {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
  };
  onClick: () => void;
}

const colorClasses = {
  red: 'bg-red-100 group-hover:bg-red-200 text-red-600',
  blue: 'bg-blue-100 group-hover:bg-blue-200 text-blue-600',
  green: 'bg-green-100 group-hover:bg-green-200 text-green-600',
  indigo: 'bg-indigo-100 group-hover:bg-indigo-200 text-indigo-600',
  purple: 'bg-purple-100 group-hover:bg-purple-200 text-purple-600',
  yellow: 'bg-yellow-100 group-hover:bg-yellow-200 text-yellow-600',
  teal: 'bg-teal-100 group-hover:bg-teal-200 text-teal-600',
  cyan: 'bg-cyan-100 group-hover:bg-cyan-200 text-cyan-600',
  orange: 'bg-orange-100 group-hover:bg-orange-200 text-orange-600',
};

export function ToolCard({ tool, onClick }: ToolCardProps) {
  const IconComponent = tool.icon;
  const colorClass = colorClasses[tool.color as keyof typeof colorClasses] || colorClasses.red;

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="text-center">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors",
          colorClass
        )}>
          <IconComponent className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {tool.title}
        </h3>
        <p className="text-sm text-gray-600">
          {tool.description}
        </p>
      </div>
    </div>
  );
}

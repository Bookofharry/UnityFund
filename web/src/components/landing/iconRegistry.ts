// Explicit imports — only what the landing page actually uses.
// This allows tree-shaking; `import * as Icons` bundles all 1000+ icons.
import {
  Layers, Zap, CheckCircle, Shield, FileText, BarChart2,
  Calendar, PiggyBank, Heart, AlertCircle, Building2, RotateCcw, TrendingUp,
  Webhook, Lock, RefreshCw, Users, ClipboardList, KeyRound,
  Building, Folder, CheckCircle2,
  Star, Banknote,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ICONS: Record<string, LucideIcon> = {
  Layers, Zap, CheckCircle, Shield, FileText, BarChart2,
  Calendar, PiggyBank, Heart, AlertCircle, Building2, RotateCcw, TrendingUp,
  Webhook, Lock, RefreshCw, Users, ClipboardList, KeyRound,
  Building, Folder, CheckCircle2,
  Star, Banknote,
};

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? ICONS.Star;
}

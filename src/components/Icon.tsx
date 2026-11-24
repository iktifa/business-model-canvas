import {
  Accessibility, ArrowDown, ArrowRightLeft, ArrowUp, Bike, Boxes, Briefcase, Check, ChefHat, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, Coffee, Cog, Coins, Download, Dumbbell, Ellipsis, FileDown, FilePlus, FileText, FolderOpen,
  Gift, GraduationCap, GripVertical, Handshake, HeartHandshake, Image, Keyboard, Languages, LayoutTemplate, Lightbulb,
  Link, Map, MessagesSquare, Monitor, Moon, Palette, Plus, Printer, Receipt, Redo2, Rocket, RotateCcw, Shirt,
  ShoppingCart, Sparkles, Sprout, Stethoscope, Store, Sun, Trash2, Truck, Undo2, Users, UtensilsCrossed, X,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  accessibility: Accessibility, 'arrow-down': ArrowDown, 'arrow-up': ArrowUp, move: ArrowRightLeft, bike: Bike, boxes: Boxes,
  briefcase: Briefcase, check: Check, chef: ChefHat, 'chevron-down': ChevronDown, 'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight, help: CircleHelp, coffee: Coffee, cog: Cog, coins: Coins, download: Download,
  dumbbell: Dumbbell, more: Ellipsis, 'file-down': FileDown, 'file-plus': FilePlus, 'file-text': FileText,
  folder: FolderOpen, gift: Gift, graduation: GraduationCap, grip: GripVertical, handshake: Handshake,
  heart: HeartHandshake, image: Image, keyboard: Keyboard, languages: Languages, template: LayoutTemplate,
  lightbulb: Lightbulb, link: Link, map: Map, messages: MessagesSquare, monitor: Monitor, moon: Moon, palette: Palette,
  plus: Plus, printer: Printer, receipt: Receipt, redo: Redo2, rocket: Rocket, reset: RotateCcw, shirt: Shirt,
  cart: ShoppingCart, sparkles: Sparkles, sprout: Sprout, stethoscope: Stethoscope, store: Store, sun: Sun,
  trash: Trash2, truck: Truck, undo: Undo2, users: Users, utensils: UtensilsCrossed, x: X,
}

/** Decorative icon (aria-hidden). Give the parent control an accessible name. */
export default function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const C = ICONS[name] ?? Sparkles
  return <C size={size} strokeWidth={1.9} aria-hidden="true" focusable="false" className={className} />
}

import React from 'react';
import { FolderIcon, FolderOpenIcon, PackageIcon, PaletteIcon } from 'lucide-react';
import type { MediaFolder } from '../../types/media';
import { cn } from '../../utils/cn';

interface MediaFolderIconProps {
  folder: MediaFolder;
  open?: boolean;
  size?: number;
  className?: string;
}

const systemIcons: Record<string, typeof FolderIcon> = { brand: PaletteIcon, products: PackageIcon };

/** Default folders get their own icon on a tinted tile; your own folders get a plain folder icon. */
export function MediaFolderIcon({ folder, open, size = 15, className }: MediaFolderIconProps) {
  if (folder.system) {
    const Icon = systemIcons[folder.id] ?? FolderIcon;
    return (
      <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-action-soft text-action', className)} aria-hidden>
        <Icon size={size - 2} />
      </span>);

  }
  const Icon = open ? FolderOpenIcon : FolderIcon;
  return (
    <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center text-fg-subtle', className)} aria-hidden>
      <Icon size={size} />
    </span>);

}
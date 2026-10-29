import React from 'react';
import { MapPinIcon, UserRoundIcon } from 'lucide-react';
import type { BlockProps } from './blockProps';
import { fontsFor, mix } from './pageStyle';
import { cn } from '../../utils/cn';
import { MediaImage } from '../media/MediaImage';
import { VerifiedTick } from './VerifiedTick';

export function ProfileBlock({ block, theme }: BlockProps<'profile'>) {
  const { name, tagline, avatarUrl, avatarAlt, location } = block.content;
  const center = block.style.align === 'center';
  const fonts = fontsFor(theme);

  return (
    <div className={cn('flex flex-col gap-4 pt-6', center ? 'items-center text-center' : 'items-start text-left')}>
      {avatarUrl ?
      <MediaImage
        src={avatarUrl}
        alt={avatarAlt}
        className="h-24 w-24 rounded-full object-cover"
        style={{ boxShadow: `0 0 0 4px ${theme.surface}, 0 0 0 5px ${mix(theme.text, 10)}` }} /> :


      <div
        className="flex h-24 w-24 items-center justify-center rounded-full"
        style={{ background: mix(theme.text, 7), color: theme.mutedText }}
        aria-hidden>
        
          <UserRoundIcon size={32} />
        </div>
      }
      <div className={cn('flex flex-col gap-2', center && 'items-center')}>
        <h1
          className="text-[30px] font-medium leading-[1.1] tracking-[-0.015em]"
          style={{ fontFamily: fonts.display, color: theme.text }}>
          
          {name || 'Your name'}
          {name &&
          <>
              {' '}
              <VerifiedTick theme={theme} size={24} />
            </>
          }
        </h1>
        {tagline &&
        <p className="max-w-[40ch] text-[15px] leading-relaxed" style={{ color: theme.mutedText }}>
            {tagline}
          </p>
        }
        {location &&
        <p className="inline-flex items-center gap-1.5 text-[13px]" style={{ color: theme.mutedText }}>
            <MapPinIcon size={13} aria-hidden />
            {location}
          </p>
        }
      </div>
    </div>);

}
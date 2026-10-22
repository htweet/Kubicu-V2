import React, { useEffect, useState } from 'react';
import { isHexColor } from '../../../utils/contrast';
import { fieldControlClass } from '../../ui/Field';
import { cn } from '../../../utils/cn';

interface ColorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorField({ id, label, value, onChange }: ColorFieldProps) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={`${id}-hex`} className="text-label text-fg">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-sm border border-line-strong" style={{ background: value }}>
          <input
            type="color"
            aria-label={`${label} colour picker`}
            value={isHexColor(value) ? value : '#000000'}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
          
        </span>
        <input
          id={`${id}-hex`}
          value={text}
          spellCheck={false}
          onChange={(e) => {
            setText(e.target.value);
            const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
            if (isHexColor(v) && v.length === 7) onChange(v.toUpperCase());
          }}
          onBlur={() => setText(value)}
          className={cn(fieldControlClass, 'h-8 w-[92px] px-2 font-mono text-caption uppercase')} />
        
      </div>
    </div>);

}
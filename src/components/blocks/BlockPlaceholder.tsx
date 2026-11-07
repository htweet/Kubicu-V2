import React from "react";
import { PageTheme } from "../../types/page";
import { cardRadius, mix } from "./pageStyle";
import { BoxIcon } from "lucide-react";
import { useT } from "../../contexts/LocaleContext";
interface BlockPlaceholderProps {
  icon: BoxIcon;
  title: string;
  hint: string;
  theme: PageTheme;
  tall?: boolean;
}
/** Empty-block hint in the editor. Title and hint go through the translator (D503), so callers pass English. */
export function BlockPlaceholder({
  icon: Icon,
  title,
  hint,
  theme,
  tall
}: BlockPlaceholderProps) {
  const { t } = useT();
  return <div className={`flex flex-col items-center justify-center gap-1.5 px-6 text-center ${tall ? 'py-14' : 'py-6'}`} style={{
    borderRadius: cardRadius(theme),
    border: `1.5px dashed ${mix(theme.text, 22)}`,
    background: mix(theme.text, 3),
    color: theme.mutedText
  }}>
      <Icon size={20} aria-hidden />
      <p className="text-[14px] font-medium" style={{
      color: theme.text
    }}>
        {t(title)}
      </p>
      <p className="text-[12px]">{t(hint)}</p>
    </div>;
}

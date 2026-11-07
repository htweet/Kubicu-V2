import React from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplace } from "../../contexts/MarketplaceContext";
import { Button } from "../ui/Button";
import { BoxIcon } from "lucide-react";
/** A button on a core screen that opens an installed extension's tools (D232). Hidden when it's off. */
export function ExtensionShortcut({
  id,
  label,
  icon
}: {
  id: string;
  label: string;
  icon: BoxIcon;
}) {
  const market = useMarketplace();
  const navigate = useNavigate();
  if (!market.isActive(id)) return null;
  return <Button variant="tertiary" leadingIcon={icon} onClick={() => navigate(`/app/extensions?ext=${id}`)}>
      {label}
    </Button>;
}
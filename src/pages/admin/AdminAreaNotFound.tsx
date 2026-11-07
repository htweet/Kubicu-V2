import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';

/** Catch-all for `/admin/<anything unknown>`: every staff area has its own route, so this is a plain "not found". */
export function AdminAreaNotFound() {
  const navigate = useNavigate();
  return (
    <div className="py-16">
      <EmptyState
        icon={CompassIcon}
        title="That staff area doesn’t exist"
        description="The address may be mistyped, or the area may have moved. Use the menu to find it."
        action={<Button onClick={() => navigate('/admin')}>Staff console overview</Button>}
      />
    </div>
  );
}

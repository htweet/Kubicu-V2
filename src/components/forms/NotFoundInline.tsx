import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardXIcon } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';

/** A form address that no longer exists (deleted, or from another workspace). */
export function NotFoundInline() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 md:px-8">
      <div className="rounded-lg border border-line bg-raised">
        <EmptyState
          icon={ClipboardXIcon}
          title="This form doesn’t exist"
          description="It may have been deleted, or it belongs to another workspace."
          action={
            <Link to="/app/forms">
              <Button>All forms</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}

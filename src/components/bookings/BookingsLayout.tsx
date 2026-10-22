import React from 'react';
import { ModuleLayout } from '../shell/ModuleLayout';
import { useOps } from '../../contexts/OpsContext';

export function BookingsLayout() {
  const { data } = useOps();
  const today = new Date().toDateString();
  const todayCount = data.bookings.filter((b) => b.status === 'confirmed' && new Date(b.start).toDateString() === today).length;
  return (
    <ModuleLayout
      label="Bookings"
      items={[
      { to: '/app/bookings', label: 'Schedule', end: true, badge: todayCount },
      { to: '/app/bookings/services', label: 'Services' },
      { to: '/app/bookings/availability', label: 'Availability & policy' }]
      } />);


}
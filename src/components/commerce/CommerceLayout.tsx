import React from 'react';
import { Outlet } from 'react-router-dom';
import { commerceNav } from '../../data/commerceNav';
import { useCommerce } from '../../contexts/CommerceContext';
import { SubNav } from '../shell/SubNav';
import { ordersToActOn } from '../../utils/commerce/orderQueue';

/** Commerce area frame: a quiet sub-navigation above each Commerce screen. */
export function CommerceLayout() {
  const { data } = useCommerce();
  const actionable = ordersToActOn(data.orders);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pt-6 md:px-10 md:pt-8">
      <SubNav label="Commerce" items={commerceNav.map((n) => ({ to: n.to, label: n.label, end: n.end, badge: n.label === 'Orders' ? actionable : undefined }))} />
      <div className="pb-16 pt-6 md:pt-8">
        <Outlet />
      </div>
    </div>);

}
import { OrderPage } from '../../../modules/checkout/pages/Order';
import { useOrderRoute } from './useOrderRoute';
export function OrderRoute() {
  const { id } = useOrderRoute();
  return <OrderPage id={id} />;
}

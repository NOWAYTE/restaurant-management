// frontend/components/OrderSummary.tsx
import { MenuItem, OrderItem } from '../types/restaurant';

interface OrderSummaryProps {
  items: Array<OrderItem & { menuItem: MenuItem }>;
  onRemoveItem: (index: number) => void;
  onSubmitOrder: (customerName: string) => void;
}

export default function OrderSummary({ items, onRemoveItem, onSubmitOrder }: OrderSummaryProps) {
  const [customerName, setCustomerName] = useState('');

  const total = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    onSubmitOrder(customerName);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Your Order</h2>
      
      {items.length === 0 ? (
        <p className="text-gray-500">Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{item.menuItem.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} x ${item.menuItem.price.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-3">
            <p className="font-semibold text-lg text-right">
              Total: ${total.toFixed(2)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-3">
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                Customer Name
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="Enter your name"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Place Order
            </button>
          </form>
        </>
      )}
    </div>
  );
}
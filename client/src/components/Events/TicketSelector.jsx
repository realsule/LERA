import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, AlertCircle, Check } from 'lucide-react';

const TicketSelector = ({ event, onPurchase }) => {
  const [selectedTickets, setSelectedTickets] = useState({});
  const [showCheckout, setShowCheckout] = useState(false);

  const handleQuantityChange = (ticketTypeId, change) => {
    setSelectedTickets(prev => {
      const current = prev[ticketTypeId] || 0;
      const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId);
      const newQuantity = Math.max(0, Math.min(current + change, ticketType?.quantity || 10));
      
      if (newQuantity === 0) {
        const { [ticketTypeId]: removed, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [ticketTypeId]: newQuantity
      };
    });
  };

  const getTotalQuantity = () => {
    return Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((sum, [ticketTypeId, quantity]) => {
      const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId);
      return sum + (ticketType?.price || 0) * quantity;
    }, 0);
  };

  const handlePurchase = () => {
    const tickets = Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => ({
      ticketTypeId,
      quantity,
      ticketType: event.ticketTypes.find(t => t.id === ticketTypeId)
    }));

    onPurchase(tickets);
  };

  const totalQuantity = getTotalQuantity();
  const totalPrice = getTotalPrice();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Select Tickets</h3>
      
      {/* Ticket Types */}
      <div className="space-y-4 mb-6">
        {event.ticketTypes?.map(ticketType => {
          const quantity = selectedTickets[ticketType.id] || 0;
          const isSoldOut = ticketType.quantity <= 0;
          
          return (
            <div
              key={ticketType.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                quantity > 0
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {ticketType.name}
                    </h4>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${ticketType.price}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ticketType.quantity > 0 ? `${ticketType.quantity} left` : 'Sold out'}
                      </div>
                    </div>
                  </div>
                  
                  {ticketType.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {ticketType.description}
                    </p>
                  )}
                  
                  {isSoldOut ? (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Sold Out
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(ticketType.id, -1)}
                          disabled={quantity === 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        
                        <span className="w-12 text-center font-medium text-gray-900">
                          {quantity}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(ticketType.id, 1)}
                          disabled={quantity >= Math.min(ticketType.quantity, 10)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                      
                      {quantity > 0 && (
                        <div className="flex items-center text-green-600 text-sm">
                          <Check className="h-4 w-4 mr-1" />
                          Selected
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {totalQuantity > 0 && (
        <div className="border-t pt-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total Tickets:</span>
              <span className="font-semibold text-gray-900">{totalQuantity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Price:</span>
              <span className="text-xl font-bold text-gray-900">${totalPrice}</span>
            </div>
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Purchase Tickets
          </button>
        </div>
      )}

      {/* No Selection Message */}
      {totalQuantity === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            Select tickets above to continue with purchase
          </p>
        </div>
      )}

      {/* Event Information */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Event Details</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Time:</span> {event.time}
          </div>
          <div>
            <span className="font-medium">Venue:</span> {event.venue?.name}
          </div>
          <div>
            <span className="font-medium">Address:</span> {event.venue?.address}
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p className="mb-2">
            <strong>Important:</strong> All sales are final. No refunds or exchanges.
          </p>
          <p>
            By purchasing tickets, you agree to our{' '}
            <a href="/terms" className="text-indigo-600 hover:text-indigo-500 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-indigo-600 hover:text-indigo-500 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketSelector;

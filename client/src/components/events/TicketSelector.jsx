import React, { useState } from 'react';
import { Plus, Minus, Calendar, MapPin, Users, Clock, AlertCircle, Check } from 'lucide-react';

const TicketSelector = ({ event, onPurchase }) => {
  const [quantities, setQuantities] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (ticketId, change) => {
    setQuantities(prev => {
      const current = prev[ticketId] || 0;
      const ticketType = event.ticketTypes.find(t => t.id === ticketId);
      const maxQuantity = ticketType?.quantity || 0;
      const newQuantity = Math.max(0, Math.min(current + change, maxQuantity));
      
      return {
        ...prev,
        [ticketId]: newQuantity
      };
    });
  };

  const getTotalQuantity = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(quantities).reduce((sum, [ticketId, qty]) => {
      const ticketType = event.ticketTypes.find(t => t.id === ticketId);
      return sum + (ticketType?.price || 0) * qty;
    }, 0);
  };

  const handlePurchase = async () => {
    if (getTotalQuantity() === 0 || !agreeTerms) return;

    setIsProcessing(true);
    
    try {
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const purchaseData = {
        eventId: event.id,
        tickets: Object.entries(quantities)
          .filter(([_, qty]) => qty > 0)
          .map(([ticketId, qty]) => ({
            ticketId,
            quantity: qty,
            ticketType: event.ticketTypes.find(t => t.id === ticketId)
          })),
        totalPrice: getTotalPrice(),
        purchaseDate: new Date().toISOString()
      };

      if (onPurchase) {
        onPurchase(purchaseData);
      }

      // Reset form
      setQuantities({});
      setAgreeTerms(false);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Event Summary */}
      <div className="mb-6">
        <div className="flex items-start space-x-4">
          <img
            src={event.image}
            alt={event.title}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(event.date)} at {formatTime(event.time)}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {event.venue?.name || event.venue}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {event.availableTickets} tickets available
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Types */}
      <div className="space-y-4 mb-6">
        <h4 className="text-md font-semibold text-gray-900">Select Tickets</h4>
        
        {event.ticketTypes.map((ticketType) => {
          const quantity = quantities[ticketType.id] || 0;
          const isSoldOut = ticketType.quantity === 0;
          
          return (
            <div
              key={ticketType.id}
              className={`border rounded-lg p-4 ${
                isSoldOut ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-medium text-gray-900">{ticketType.name}</h5>
                  <p className="text-sm text-gray-600">
                    {ticketType.description || 'Standard admission'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    ${ticketType.price}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isSoldOut ? 'Sold Out' : `${ticketType.quantity} left`}
                  </p>
                </div>
              </div>

              {/* Quantity Selector */}
              {!isSoldOut && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(ticketType.id, -1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(ticketType.id, 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity >= ticketType.quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Subtotal: <span className="font-medium text-gray-900">
                        ${(ticketType.price * quantity).toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium text-gray-900">Total</span>
          <span className="text-lg font-semibold text-gray-900">
            ${getTotalPrice().toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <span>{getTotalQuantity()} ticket(s)</span>
          <span>${(getTotalPrice() / getTotalQuantity()).toFixed(2)} per ticket</span>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-6">
        <label className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-600">
            I agree to the{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 underline">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 underline">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={getTotalQuantity() === 0 || !agreeTerms || isProcessing}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            Purchase Tickets
          </>
        )}
      </button>

      {/* Success Message */}
      {getTotalQuantity() === 0 && (
        <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <p className="text-sm text-yellow-800">
            Please select at least one ticket to proceed
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketSelector;

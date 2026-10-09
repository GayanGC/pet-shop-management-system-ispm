import React from 'react';
import BookingForm from './BookingForm';

const BookingModal = (props) => {
  return <BookingForm {...props} isModal={true} />;
};

export default BookingModal;

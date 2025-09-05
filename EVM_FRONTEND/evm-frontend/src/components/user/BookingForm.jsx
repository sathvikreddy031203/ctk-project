import React, { useState, useEffect,useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { NotificationContext } from '../utilities/NotificationsContext';
import { useAuth } from "../utilities/AuthProvider";
import './BookingForm.css'; 

const BookingForm = () => {
  const { id } = useParams();
  const { refreshNotifications } = useContext(NotificationContext)
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
   const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    eventId: '',
    eventName: '',
    userName: '',
    userPhonenumber: '',
    numberOfTickets: 1,
    eventDate: '',
  });
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
        if (!isAuthenticated) {
          navigate('/login'); }
      }, [isAuthenticated, navigate]);

  // Fetch event details
  useEffect(() => {
    fetch(`http://localhost:5555/api/getevent/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('error');
        }
        return response.json();
      })
      .then((data) => {
        setEvent(data.event);
        setFormData((prevData) => ({
          ...prevData,
          eventName: data.event.eventName,
          eventId: data.event._id,
          // eventDate: moment(data.eventDate).format('YYYY-MM-DD'),
          eventDate: data.event.eventDate,
        }));
      })
      .catch((error) => console.error('Error fetching event:', error));
  }, [id]);

  // Handle input changes in the booking form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  // Handle booking form submission
  const handleSubmit = (e) => {
    console.log("here");
    e.preventDefault();
    const newErrors = {};
    const numberOfTicketsValue = parseInt(formData.numberOfTickets, 10);
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.userName.trim()) {
      newErrors.userName = 'Name is required.';
    }
    if (!formData.userPhonenumber.match(phoneRegex)) {
      newErrors.userPhonenumber = 'Please enter a valid 10-digit phone number.';
    }

    if (isNaN(numberOfTicketsValue) || numberOfTicketsValue < 1 || numberOfTicketsValue > 10) {
      newErrors.numberOfTickets = 'Number of tickets must be between 1 and 10.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log(errors)
      return;
    }
    setShowConfirmation(true);
    console.log(showConfirmation);
  };

  // Handle confirmation
  const handleConfirm = () => {
    console.log("confirm");
    const token = localStorage.getItem('jwt_token');
    fetch(`http://localhost:5555/api/bookevents/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status == 400) {
            console.log("no tickets")
          }
          throw new Error('error');
        }
        refreshNotifications();

      })
      .catch((error) => console.error('Error fetching event:', error));
    setConfirmationMessage('Your ticket has been confirmed! Redirecting to home page...');
    setTimeout(() => {
      navigate('/home');
    }, 3000);
  };

  // Handle cancellation
  const handleCancel = () => {
    setConfirmationMessage('Your ticket has been cancelled! Redirecting to home page...');
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  if (!event && !showConfirmation) {
    return <p className="text-center mt-5">Loading event details or no event found.</p>;
  }

  return (
    <div className="booking">
      <div className="booking-main-container">
        {!showConfirmation ? (
          <div className="booking-form-container">
            <h1>Book Your Ticket Here</h1>
                <form className="booking-form" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="eventName">
                      Event Name
                    </label>
                    <input
                      type="text"
                      id="eventName"
                      name="eventName"
                      value={formData.eventName}
                      readOnly
                    />
                  </div>
                  <div>
                    <label htmlFor="userName">
                      Name
                    </label>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      placeholder="Enter your name..."
                      required
                      onChange={handleChange}
                      value={formData.userName}
                    />
                    {errors.userName && <div className="text-danger">{errors.userName}</div>}
                  </div>
                  <div>
                    <label htmlFor="phoneNumber">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="userPhonenumber"
                      placeholder="Enter your 10-digit number..."
                      required
                      onChange={handleChange}
                      value={formData.userPhonenumber}
                    />
                    {errors.phoneNumber && <div className="text-danger">{errors.phoneNumber}</div>}
                  </div>

                  <div>
                    <label htmlFor="numberOfTickets">
                      Number of Tickets
                    </label>
                    <input
                      type="number"
                      id="numberOfTickets"
                      name="numberOfTickets"
                      value={formData.numberOfTickets}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      required
                    />
                    {errors.numberOfTickets && <div className="text-danger">{errors.numberOfTickets}</div>}
                  </div>
                  <div>
                    <label htmlFor="bookingDate">
                      Event Date
                    </label>
                    <input
                      type="date"
                      id="bookingDate"
                      name="bookingDate"
                      required
                      value={moment(event.eventDate).format('YYYY-MM-DD')}
                      readOnly
                    />
                  </div>
                  <div>
                    <button type="submit"
                    className="booking-formbutton"
                    >
                      Book Ticket
                    </button>
                  </div>
                </form>
              </div>
        ) : (
          // Confirmation Page
          <div className="confirmation-container">
            <h1>
              Confirm Your Booking
            </h1>
            {confirmationMessage ? (
              <div>
                <p>{confirmationMessage}</p>
              </div>
            ) : (
              <div>
                <p><strong>Event:</strong> {formData.eventName}</p>
                <p><strong>User Name:</strong> {formData.userName}</p>
                <p><strong>Phone Number:</strong> {formData.userPhonenumber}</p>
                <p><strong>Event Date:</strong> {moment(formData.eventDate).format('YYYY-MM-DD')}</p>
                <p><strong>Number of Tickets:</strong> {formData.numberOfTickets}</p>
                <div>
                  <button
                    onClick={handleConfirm}
                  >
                    Confirm Ticket
                  </button>
                  <button
                    onClick={handleCancel}
                  >
                    Cancel Ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default BookingForm;
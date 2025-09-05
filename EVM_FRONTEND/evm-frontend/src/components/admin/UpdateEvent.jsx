import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './UpdateEvent.css';

const UpdateEvent = () => {
  const { id } = useParams();
  const [updatedEvent, setUpdatedEvent] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // New state for success message visibility
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://localhost:5555/api/getevent/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
          }
        });
        if (!response.ok) {
          throw new Error("Event not found");
        }
        const data = await response.json();
        setUpdatedEvent(data.event);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // useEffect to handle redirection after successful update
  useEffect(() => {
    let timer;
    if (showSuccessMessage) {
      timer = setTimeout(() => {
        navigate("/home"); // Redirect to home after 3 seconds
      }, 3000);
    }
    // Cleanup function to clear the timeout
    return () => clearTimeout(timer);
  }, [showSuccessMessage, navigate]); // Depend on `showSuccessMessage` and `Maps`

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedEvent({ ...updatedEvent, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5555/api/updateevent/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify(updatedEvent),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update event");
      }

      setShowSuccessMessage(true); // Set state to show the success message
      setError(null); // Clear any previous errors

    } catch (error) {
      console.error("Error updating event:", error);
      setError("Failed to update event: " + error.message);
      setShowSuccessMessage(false); // Ensure message is hidden on error
    }
  };

  // Conditional renders for initial loading and errors outside the main form
  if (loading) {
    return <div className="loading-message">Loading event data...</div>;
  }

  if (error && !showSuccessMessage) { // Show error unless success message is already being shown
    return <div className="error-message-container">Error: {error}</div>;
  }

  // Fallback for when updatedEvent is unexpectedly empty after loading (e.g., event not found)
  if (!updatedEvent || Object.keys(updatedEvent).length === 0) {
    return <div className="error-message-container">Event not found or failed to load.</div>;
  }

  return (
    <div className="update-event-page">
      {/* Conditionally render the success message within the page structure */}
      {showSuccessMessage ? (
        <div className="success-message-container">
          <h2 className="success-message">Event updated successfully! Redirecting...</h2>
        </div>
      ) : (
        <div className="update-event-container">
          <h2 className="update-event-heading">Update Event</h2>
          <form onSubmit={handleSubmit} className="update-event-form">
            <label className="update-event-label">
              Event Name:
              <input
                type="text"
                name="eventName"
                value={updatedEvent.eventName || ''}
                onChange={handleChange}
                required
                className="update-event-input"
              />
            </label>
            <label className="update-event-label">
              Date:
              <input
                type="date"
                name="eventDate"
                value={updatedEvent.eventDate ? new Date(updatedEvent.eventDate).toISOString().split('T')[0] : ''}
                min={new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0]}
                onChange={handleChange}
                required
                className="update-event-input"
              />
            </label>
            <label className="update-event-label">
              Time:
              <input
                type="time"
                name="eventTime"
                value={updatedEvent.eventTime || ''}
                onChange={handleChange}
                required
                className="update-event-input"
              />
            </label>
            <label className="update-event-label">
              Organizer:
              <input
                type="text"
                name="eventOrganizer"
                value={updatedEvent.eventOrganizer || ''}
                onChange={handleChange}
                required
                className="update-event-input"
              />
            </label>
            <label className="update-event-label">
              Phone Number:
              <input
                type="text"
                name="eventPhonenumber"
                value={updatedEvent.eventPhonenumber || ''}
                onChange={handleChange}
                className="update-event-input"
              />
            </label>
            <label className="update-event-label">
              Email:
              <input
                type="email"
                name="eventEmail"
                value={updatedEvent.eventEmail || ''}
                onChange={handleChange}
                required
                className="update-event-input"
              />
            </label>
            <label className="update-event-label">
              Location:
              <input
                type="text"
                name="eventLocation"
                value={updatedEvent.eventLocation || ''}
                onChange={handleChange}
                required
                className="update-event-input"
              />
            </label>
            <label className="update-event-label">
              Category:
              <input
                type="text"
                name="eventCategory"
                value={updatedEvent.eventCategory || ''}
                onChange={handleChange}
                required
                className="update-event-input"
              />
            </label>
            <label className="update-event-label">
              Description:
              <textarea
                name="eventDescription"
                value={updatedEvent.eventDescription || ''}
                onChange={handleChange}
                required
                className="update-event-textarea"
              />
            </label>
            <label className="update-event-label">
              Capacity:
              <input
                type="number"
                name="eventCapacity"
                value={updatedEvent.eventCapacity || ''}
                onChange={handleChange}
                required
                className="update-event-input"
              />
            </label>

            {updatedEvent.eventImage && (
              <img src={updatedEvent.eventImage} className="update-event-image" alt="Event" />
            )}

            <button type="submit" className="update-event-button">
              Update Event
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UpdateEvent;
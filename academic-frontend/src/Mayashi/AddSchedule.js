import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function AddSchedule() {
  const navigate = useNavigate();
  const location = useLocation();

  // Read roomName from query parameter
  const preFilledRoomName = new URLSearchParams(location.search).get('roomName') || '';

  // State for form fields
  const [formData, setFormData] = useState({
    roomName: preFilledRoomName,
    eventType: '',
    customEventType: '',
    eventName: '',
    faculty: '',
    department: '',
    customDepartment: '',
    date: '',
    startTime: '',
    duration: '',
    endTime: '',
    recurrence: 'No',
    recurrenceFrequency: '',
    priorityLevel: '',
    status: '',
    createdBy: '',
    email: '',
  });

  // State for rooms fetched from backend
  const [rooms, setRooms] = useState([]);
  const [alert, setAlert] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch rooms on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/lecture-rooms');
        setRooms(response.data);

        // If roomName is pre-filled, validate it and set the initial status
        if (preFilledRoomName) {
          const selectedRoom = response.data.find((room) => room.roomName === preFilledRoomName);
          if (selectedRoom) {
            setFormData((prev) => ({
              ...prev,
              roomName: preFilledRoomName,
              status: selectedRoom.condition === 'Needs to Repair' ? 'Under Maintenance' : 'Available',
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              roomName: 'Invalid room name provided. Please select a valid room.',
            }));
            setFormData((prev) => ({
              ...prev,
              roomName: '',
              status: '',
            }));
          }
        }
      } catch (error) {
        setAlert({ message: 'Failed to fetch rooms', type: 'error' });
      }
    };
    fetchRooms();
  }, [preFilledRoomName]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent changing roomName if pre-filled
    if (name === 'roomName' && preFilledRoomName) {
      return;
    }

    // Update form data
    let updatedFormData = { ...formData, [name]: value };
    let updatedErrors = { ...errors };

    // Update status when roomName changes (only if not pre-filled)
    if (name === 'roomName') {
      const selectedRoom = rooms.find((room) => room.roomName === value);
      if (selectedRoom) {
        updatedFormData.status = selectedRoom.condition === 'Needs to Repair' ? 'Under Maintenance' : 'Available';
      } else {
        updatedFormData.status = '';
      }
    }

    // Calculate endTime when startTime or duration changes
    if (name === 'startTime' || name === 'duration') {
      const { startTime, duration } = { ...updatedFormData, [name]: value };
      if (startTime && duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);

        const durationInMinutes = parseInt(duration, 10);
        const endDate = new Date(startDate.getTime() + durationInMinutes * 60000);

        const endHours = String(endDate.getHours()).padStart(2, '0');
        const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
        updatedFormData.endTime = `${endHours}:${endMinutes}`;
      } else {
        updatedFormData.endTime = '';
      }
    }

    // Update status when date or startTime changes
    if (name === 'date' || name === 'startTime') {
      const selectedRoom = rooms.find((room) => room.roomName === updatedFormData.roomName);
      if (selectedRoom) {
        updatedFormData.status = selectedRoom.condition === 'Needs to Repair' ? 'Under Maintenance' : 'Available';
      }
    }

    // Clear error for the field being edited
    if (updatedErrors[name]) {
      updatedErrors[name] = '';
    }

    setFormData(updatedFormData);
    setErrors(updatedErrors);
  };

  // Validate individual field on blur
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'roomName':
        if (!value) {
          error = 'Room name is required';
        } else {
          const selectedRoom = rooms.find((room) => room.roomName === value);
          if (!selectedRoom) {
            error = 'Please select a valid room';
          } else if (!/^[A-Z][0-9]{3}$/.test(value)) {
            error = 'Room name must be in the format A000 (e.g., A401)';
          }
        }
        break;

      case 'eventType':
        if (!value) {
          error = 'Event type is required';
        }
        break;

      case 'customEventType':
        if (formData.eventType === 'Other') {
          if (!value || value.trim() === '') {
            error = 'Custom event type is required';
          } else if (value.length > 20) {
            error = 'Must not exceed 20 characters';
          }
        }
        break;

      case 'eventName':
        if (!value) {
          error = 'Event name is required';
        } else if (!/^[a-zA-Z0-9\s]+$/.test(value)) {
          error = 'Only letters, numbers, and spaces allowed';
        } else if (value.length > 50) {
          error = 'Must not exceed 50 characters';
        }
        break;

      case 'faculty':
        if (!value) {
          error = 'Faculty is required';
        }
        break;

      case 'department':
        if (!value) {
          error = 'Department is required';
        }
        break;

      case 'customDepartment':
        if (formData.department === 'Other') {
          if (!value || value.trim() === '') {
            error = 'Custom department is required';
          }
        }
        break;

      case 'date':
        if (!value) {
          error = 'Date is required';
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const selectedDate = new Date(value);
          if (selectedDate < today) {
            error = 'Date cannot be in the past';
          }
        }
        break;

      case 'startTime':
        if (!value) {
          error = 'Start time is required';
        } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          error = 'Must be in HH:MM format (e.g., 09:00)';
        }
        break;

      case 'duration':
        if (!value) {
          error = 'Duration is required';
        } else {
          const durationNum = parseInt(value, 10);
          if (isNaN(durationNum) || durationNum < 1) {
            error = 'Must be a positive number';
          }
        }
        break;

      case 'recurrence':
        if (!value) {
          error = 'Recurrence is required';
        }
        break;

      case 'recurrenceFrequency':
        if (formData.recurrence === 'Yes' && !value) {
          error = 'Recurrence frequency is required';
        }
        break;

      case 'priorityLevel':
        if (!value) {
          error = 'Priority level is required';
        }
        break;

      case 'createdBy':
        if (!value) {
          error = 'Created by is required';
        } else if (value.length > 20) {
          error = 'Must not exceed 20 characters';
        }
        break;

      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(value)) {
          error = 'Please enter a valid email';
        } else if (value.length > 50) {
          error = 'Must not exceed 50 characters';
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const fieldsToValidate = [
      'roomName',
      'eventType',
      'customEventType',
      'eventName',
      'faculty',
      'department',
      'customDepartment',
      'date',
      'startTime',
      'duration',
      'recurrence',
      'recurrenceFrequency',
      'priorityLevel',
      'createdBy',
      'email',
    ];

    let newErrors = {};
    fieldsToValidate.forEach((field) => {
      validateField(field, formData[field]);
      if (errors[field]) {
        newErrors[field] = errors[field];
      }
    });

    // Check if any validation errors exist
    const hasErrors = Object.values({ ...errors, ...newErrors }).some((error) => error);
    if (hasErrors) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    // Check room availability
    if (formData.status === 'Under Maintenance') {
      setErrors((prev) => ({
        ...prev,
        roomName: `This room (${formData.roomName}) is under maintenance. Please select another room.`,
      }));
      return;
    }

    // Prepare confirmation details
    const details = {
      roomName: formData.roomName,
      eventType: formData.eventType === 'Other' ? formData.customEventType : formData.eventType,
      eventName: formData.eventName,
      faculty: formData.faculty,
      department: formData.department === 'Other' ? formData.customDepartment : formData.department,
      date: formData.date,
      startTime: formData.startTime,
      duration: formData.duration,
      endTime: formData.endTime,
      recurrence: formData.recurrence,
      recurrenceFrequency: formData.recurrence === 'Yes' ? formData.recurrenceFrequency : 'N/A',
      priorityLevel: formData.priorityLevel,
      status: 'Occupied',
      createdBy: formData.createdBy,
      email: formData.email,
      createdAt: new Date().toISOString(),
    };

    setConfirmationDetails(details);
    setShowConfirmation(true);
  };

  // Handle confirmation
  const handleConfirm = async () => {
    try {
      const scheduleData = {
        roomName: formData.roomName,
        eventType: formData.eventType,
        customEventType: formData.eventType === 'Other' ? formData.customEventType : undefined,
        eventName: formData.eventName,
        faculty: formData.faculty,
        department: formData.department === 'Other' ? formData.customDepartment : formData.department,
        date: formData.date,
        startTime: formData.startTime,
        duration: parseInt(formData.duration, 10),
        recurrence: formData.recurrence,
        recurrenceFrequency: formData.recurrence === 'Yes' ? formData.recurrenceFrequency : undefined,
        priorityLevel: formData.priorityLevel,
        createdBy: formData.createdBy,
        email: formData.email,
      };

      await axios.post('http://localhost:5000/api/schedules', scheduleData);
      setShowConfirmation(false);
      setAlert({ message: 'Schedule added successfully!', type: 'success' });
      setTimeout(() => navigate('/view-schedules'), 2000);
    } catch (error) {
      setShowConfirmation(false);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to add schedule';
      setAlert({ message: errorMessage, type: 'error' });
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmationDetails(null);
  };

  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'text-green-600';
      case 'Occupied':
        return 'text-red-600';
      case 'Under Maintenance':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{
        backgroundImage: `url('https://img.freepik.com/free-vector/university-people-banner-set_1284-7046.jpg')`,
      }}
    >
      {/* Alert */}
      {alert && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`p-4 rounded-lg shadow-lg text-white ${
              alert.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            <p>{alert.message}</p>
            <button onClick={() => setAlert(null)} className="ml-4 text-white font-bold">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {showConfirmation && confirmationDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Confirm Schedule Details</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Room Name:</strong> {confirmationDetails.roomName}</p>
              <p><strong>Event Type:</strong> {confirmationDetails.eventType}</p>
              <p><strong>Event Name:</strong> {confirmationDetails.eventName}</p>
              <p><strong>Faculty:</strong> {confirmationDetails.faculty}</p>
              <p><strong>Department:</strong> {confirmationDetails.department}</p>
              <p><strong>Date:</strong> {confirmationDetails.date}</p>
              <p><strong>Start Time:</strong> {confirmationDetails.startTime}</p>
              <p><strong>Duration:</strong> {confirmationDetails.duration} minutes</p>
              <p><strong>End Time:</strong> {confirmationDetails.endTime}</p>
              <p><strong>Recurrence:</strong> {confirmationDetails.recurrence}</p>
              <p><strong>Recurrence Frequency:</strong> {confirmationDetails.recurrenceFrequency}</p>
              <p><strong>Priority Level:</strong> {confirmationDetails.priorityLevel}</p>
              <p><strong>Status:</strong> {confirmationDetails.status}</p>
              <p><strong>Created By:</strong> {confirmationDetails.createdBy}</p>
              <p><strong>Email:</strong> {confirmationDetails.email}</p>
              <p><strong>Created At:</strong> {new Date(confirmationDetails.createdAt).toLocaleString()}</p>
            </div>
            <p className="mt-4 font-semibold text-gray-900">Confirm the details?</p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleCancel}
                className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                No
              </button>
              <button
                onClick={handleConfirm}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="container mx-auto max-w-2xl bg-white bg-opacity-90 p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-700">
            Add Schedule
          </span>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Room Name</label>
            {preFilledRoomName ? (
              <input
                type="text"
                name="roomName"
                value={formData.roomName}
                readOnly
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-700"
              />
            ) : (
              <select
                name="roomName"
                value={formData.roomName}
                onChange={handleChange}
                onBlur={(e) => validateField(e.target.name, e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.roomName ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Select Room</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room.roomName}>
                    {room.roomName}
                  </option>
                ))}
              </select>
            )}
            {errors.roomName && (
              <p className="text-red-500 text-sm mt-1">{errors.roomName}</p>
            )}
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Event Type</label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.eventType ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">Select Event Type</option>
              <option value="Lecture">Lecture</option>
              <option value="Exam">Exam</option>
              <option value="Meeting">Meeting</option>
              <option value="Seminar/Workshop">Seminar/Workshop</option>
              <option value="Other">Other</option>
            </select>
            {errors.eventType && (
              <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>
            )}
            {formData.eventType === 'Other' && (
              <div className="mt-2">
                <input
                  type="text"
                  name="customEventType"
                  value={formData.customEventType}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  placeholder="Enter custom event type"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.customEventType ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.customEventType && (
                  <p className="text-red-500 text-sm mt-1">{errors.customEventType}</p>
                )}
              </div>
            )}
          </div>

          {/* Event Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Event Name</label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.eventName ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Enter event name"
            />
            {errors.eventName && (
              <p className="text-red-500 text-sm mt-1">{errors.eventName}</p>
            )}
          </div>

          {/* Faculty */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Faculty</label>
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.faculty ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">Select Faculty</option>
              <option value="Computing">Computing</option>
              <option value="Engineering">Engineering</option>
              <option value="Science">Science</option>
              <option value="Business">Business</option>
              <option value="Arts">Arts</option>
            </select>
            {errors.faculty && (
              <p className="text-red-500 text-sm mt-1">{errors.faculty}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.department ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Cyber Security">Cyber Security</option>
              <option value="Data Science">Data Science</option>
              <option value="Interactive Media">Interactive Media</option>
              <option value="Network Engineering">Network Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Electronic Engineering">Electronic Engineering</option>
              <option value="Chemical Engineering">Chemical Engineering</option>
              <option value="Mechatronics Engineering">Mechatronics Engineering</option>
              <option value="Bio Medical Engineering">Bio Medical Engineering</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Microbiology">Microbiology</option>
              <option value="Statistics">Statistics</option>
              <option value="Accounting">Accounting</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Human Resource Management">Human Resource Management</option>
              <option value="Management / Business Management">Management / Business Management</option>
              <option value="Economics">Economics</option>
              <option value="Creative & Performing Arts">Creative & Performing Arts</option>
              <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
              <option value="Languages & Literature">Languages & Literature</option>
              <option value="Communication & Culture">Communication & Culture</option>
              <option value="Other">Other</option>
            </select>
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department}</p>
            )}
            {formData.department === 'Other' && (
              <div className="mt-2">
                <input
                  type="text"
                  name="customDepartment"
                  value={formData.customDepartment}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  placeholder="Enter custom department"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.customDepartment ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.customDepartment && (
                  <p className="text-red-500 text-sm mt-1">{errors.customDepartment}</p>
                )}
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.date ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-gray-7
00 font-medium mb-2">Start Time (HH:MM)</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.startTime ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Duration (minutes)</label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.duration ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">Select Duration</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="240">4 hours</option>
              <option value="300">5 hours</option>
              <option value="360">6 hours</option>
            </select>
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
            )}
          </div>

          {/* End Time (Read-only) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">End Time</label>
            <input
              type="text"
              value={formData.endTime}
              readOnly
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100"
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Recurrence</label>
            <select
              name="recurrence"
              value={formData.recurrence}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.recurrence ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
            {errors.recurrence && (
              <p className="text-red-500 text-sm mt-1">{errors.recurrence}</p>
            )}
            {formData.recurrence === 'Yes' && (
              <div className="mt-2">
                <select
                  name="recurrenceFrequency"
                  value={formData.recurrenceFrequency}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.recurrenceFrequency ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select Recurrence Frequency</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
                {errors.recurrenceFrequency && (
                  <p className="text-red-500 text-sm mt-1">{errors.recurrenceFrequency}</p>
                )}
              </div>
            )}
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Priority Level</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priorityLevel"
                  value="High"
                  checked={formData.priorityLevel === 'High'}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, formData.priorityLevel)}
                  className="mr-2"
                />
                <span className="text-red-600 font-bold">High</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priorityLevel"
                  value="Medium"
                  checked={formData.priorityLevel === 'Medium'}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, formData.priorityLevel)}
                  className="mr-2"
                />
                <span className="text-yellow-600 font-bold">Medium</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priorityLevel"
                  value="Low"
                  checked={formData.priorityLevel === 'Low'}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, formData.priorityLevel)}
                  className="mr-2"
                />
                <span className="text-blue-600 font-bold">Low</span>
              </label>
            </div>
            {errors.priorityLevel && (
              <p className="text-red-500 text-sm mt-1">{errors.priorityLevel}</p>
            )}
          </div>

          {/* Status (Read-only) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Status</label>
            <input
              type="text"
              value={formData.status}
              readOnly
              className={`w-full p-3 border border-gray-200 rounded-lg bg-gray-100 font-medium ${getStatusColor(
                formData.status
              )}`}
            />
          </div>

          {/* Created By */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Created By</label>
            <input
              type="text"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.createdBy ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Enter your name"
              maxLength="20"
            />
            {errors.createdBy && (
              <p className="text-red-500 text-sm mt-1">{errors.createdBy}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={(e) => validateField(e.target.name, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium"
            >
              Add Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSchedule;
import "./App.css";
import { useState } from "react";
import Axios from "./api/axiox";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    origin: "CPH",
    destination: "BKK",
    selectedDate: new Date().toISOString().split("T")[0],
    adults: 1,
    currency: "EUR",
    max: 10,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    getFlightDetails();
  };

  const getFlightDetails = async () => {
    const body = {
      origin: formData.origin,
      destination: formData.destination,
      selectedDate: formData.selectedDate,
      adults: formData.adults,
    };

    try {
      const response = await Axios.post(`api/fetch-flights`, body);

      const flattened = response.data.flights.flatMap((flight) => {
        if (!flight || flight.length === 0) return [];
        const { departureDate } = flight;
        return {
          "Departure Date": departureDate,
          Price: flight.data.price.total,
          Currency: flight.data.price.currency,
          Duration: flight.data.itineraries?.[0]?.duration,
          Segments: flight.data.itineraries?.[0]?.segments?.length || 0,
          From: flight.data.itineraries?.[0]?.segments?.[0]?.departure
            ?.iataCode,
          To: flight.data.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival
            ?.iataCode,
        };
      });

      if (flattened.length === 0) {
        alert("No flight data found for the given criteria.");
        console.log("No flight data found to export.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(flattened);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Flight Data");

      XLSX.writeFile(workbook, "FlightData.xlsx");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching flight details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    console.log("User logged out");
    navigate("/login");
  };

  return (
    <div className="App">
      <div className="container mt-3 d-flex justify-content-end">
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="container mt-3 p-4 border rounded shadow-sm bg-light"
        style={{ maxWidth: "700px" }}
      >
        <h3 className="mb-4 text-center">Flight Search</h3>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Origin</label>
              <input
                type="text"
                className="form-control"
                name="origin"
                placeholder="e.g. DEL"
                value={formData.origin}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Departure Date</label>
              <input
                type="date"
                className="form-control"
                name="selectedDate"
                value={formData.selectedDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Destination</label>
              <input
                type="text"
                className="form-control"
                name="destination"
                placeholder="e.g. JFK"
                value={formData.destination}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Adults</label>
              <input
                type="number"
                className="form-control"
                name="adults"
                min="1"
                value={formData.adults}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 mt-3"
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Searching...
            </>
          ) : (
            "Search Flights"
          )}
        </button>
      </form>
    </div>
  );
}

export default App;

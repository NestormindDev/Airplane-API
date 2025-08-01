import "./App.css";
import { useState } from "react";
import Axios from "./api/axiox";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [flightsResp, setFlightResp] = useState([]);
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
      setFlightResp(response.data.flights);
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

  const validatePrice = async (flight) => {
    try {
      const response = await Axios.post(`api/flight-pricing`, {
        priceFlightOffersBody: {
          type: "flight-offers-pricing",
          flightOffers: [flight.data],
        },
      });
    } catch (error) {
      console.error("Error validating flight price:", error);
      return false;
    }
  };

  return (
    <div className="App container mt-4">
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <form
            onSubmit={handleSubmit}
            className="p-4 border rounded shadow-sm bg-light"
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

        <div className="col-md-6">
          <div className="border rounded shadow-sm p-3 bg-white h-100 overflow-auto">
            <h4 className="mb-3">Results</h4>
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Departure Date</th>
                  <th>Price</th>
                  <th>Currency</th>
                  <th>Duration</th>
                  <th>Segments</th>
                  <th>From</th>
                  <th>To</th>
                </tr>
              </thead>
              <tbody>
                {flightsResp.map((flight) => {
                  const { departureDate } = flight;
                  return (
                    <tr
                      key={flight._id}
                      onClick={validatePrice.bind(null, flight)}
                    >
                      <td>{departureDate}</td>
                      <td>{flight.data.price.total}</td>
                      <td>{flight.data.price.currency}</td>
                      <td>{flight.data.itineraries?.[0]?.duration}</td>
                      <td>
                        {flight.data.itineraries?.[0]?.segments?.length || 0}
                      </td>
                      <td>
                        {
                          flight.data.itineraries?.[0]?.segments?.[0]?.departure
                            ?.iataCode
                        }
                      </td>
                      <td>
                        {
                          flight.data.itineraries?.[0]?.segments?.slice(-1)[0]
                            ?.arrival?.iataCode
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

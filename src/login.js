import React, { use } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import Axios from "./api/axiox";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = React.useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      (!formState.email && !formState.password) ||
      (!formState.email && formState.password) ||
      (formState.email && !formState.password)
    ) {
      alert("Please fill in all fields.");
      return;
    }
    if (!formState.email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    Axios.post("/api/user/login", formState)
      .then((response) => {
        console.log("Login successful", response.data);
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Login failed", error);
        alert("Login failed. Please check your credentials.");
      });
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex justify-content-center align-items-center bg-light"
    >
      <Row className="w-100">
        <Col xs={12} sm={8} md={6} lg={4} className="mx-auto">
          <Card className="p-4 shadow">
            <h3 className="text-center mb-4">Login</h3>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formState.email}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group controlId="formPassword" className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formState.password}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Login
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;

import React from "react";
import { Container, Form, FormControl, Nav, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();
  return (
    <Navbar
      expand="lg"
      style={{ backgroundColor: "#B388EB", padding: "0.5rem 1rem" }}
    >
      <Container fluid>
        <Nav className="me-auto align-items-center">
          <Nav.Link
            as="button"
            className="text-white fw-bold"
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none" }}
          >
            &lt; Back
          </Nav.Link>
          <Nav.Link href="/admin/users" className="text-white fw-bold">
            User
          </Nav.Link>
          <Nav.Link href="/admin/usersloggedin" className="text-white fw-bold">
            Logged in
          </Nav.Link>
        </Nav>

        {/* Search bar */}
        <Form className="d-flex" style={{ flex: 1, maxWidth: "400px" }}>
          <FormControl
            type="search"
            placeholder="Search"
            className="me-2"
            aria-label="Search"
            style={{
              borderRadius: "999px",
              paddingLeft: "1rem",
              height: "36px",
              border: "none",
              boxShadow: "none",
            }}
          />
          <button
            type="submit"
            style={{
              background: "none",
              border: "none",
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#000",
            }}
          ></button>
        </Form>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;

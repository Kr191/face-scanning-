import React, { useState, useEffect, useRef } from "react";
import { Container, Form, FormControl, Nav, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const dropdownRef = useRef();

  useEffect(() => {
    // Fetch all users once
    axios
      .get(`${API_URL}/api/getusers`)
      .then((res) => setAllUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err));
  }, [API_URL]);

  useEffect(() => {
    if (search.trim() === "") {
      setFiltered([]);
      setShowDropdown(false);
      return;
    }
    const lower = search.toLowerCase();
    const matches = allUsers.filter(
      (u) =>
        u.first_name.toLowerCase().includes(lower) ||
        u.last_name.toLowerCase().includes(lower)
    );
    setFiltered(matches);
    setShowDropdown(matches.length > 0);
  }, [search, allUsers]);

  // Hide dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div
          style={{ position: "relative", flex: 1, maxWidth: "400px" }}
          ref={dropdownRef}
        >
          <Form className="d-flex">
            <FormControl
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                borderRadius: "999px",
                paddingLeft: "1rem",
                height: "36px",
                border: "none",
                boxShadow: "none",
              }}
              onFocus={() => setShowDropdown(filtered.length > 0)}
              autoComplete="off"
            />
          </Form>
          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "44px",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #b388eb",
                borderRadius: "0 0 12px 12px",
                zIndex: 1000,
                boxShadow: "0 4px 12px rgba(179,136,235,0.15)",
                maxHeight: "250px",
                overflowY: "auto",
              }}
            >
              {filtered.map((user) => (
                <div
                  key={user._id}
                  style={{
                    padding: "0.7rem 1rem",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onClick={() => {
                    navigate(`/admin/users/user/${user._id}`);
                    setShowDropdown(false);
                    setSearch("");
                  }}
                >
                  {user.first_name} {user.last_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;

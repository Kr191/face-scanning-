import React, { useState, useEffect, useRef } from "react";
import { Container, Form, FormControl, Nav, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminNavbar.css";

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
      .get(`/api/getusers`)
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
    <Navbar expand="lg" className="admin-navbar">
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
        <div className="admin-navbar-search-container" ref={dropdownRef}>
          <Form className="d-flex">
            <FormControl
              type="search"
              placeholder="Search"
              className="me-2 admin-navbar-search-input"
              aria-label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setShowDropdown(filtered.length > 0)}
              autoComplete="off"
            />
          </Form>
          {showDropdown && (
            <div className="admin-navbar-dropdown">
              {filtered.map((user) => (
                <div
                  key={user._id}
                  className="admin-navbar-dropdown-item"
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

import React from 'react';
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          Quản lý Bất động sản
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          {isAuthenticated && (
            <Nav className="me-auto">
              <Nav.Link
                as={Link}
                to="/properties"
                active={isActive('/properties') || isActive('/')}
              >
                Danh sách BĐS
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/properties/create"
                active={isActive('/properties/create')}
              >
                Thêm mới
              </Nav.Link>
            </Nav>
          )}

          <Nav className="ms-auto">
            {isAuthenticated ? (
              <NavDropdown
                title={`👤 ${user?.name || 'User'}`}
                id="basic-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item onClick={handleLogout}>
                  Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link
                as={Link}
                to="/login"
                active={isActive('/login')}
              >
                Đăng nhập
              </Nav.Link>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;

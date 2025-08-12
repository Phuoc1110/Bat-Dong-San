import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  InputGroup, 
  Badge, 
  Pagination,
  Alert,
  Spinner
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { propertiesApi } from '../../services/api';
import { Property, PropertyFilters } from '../../types';

const PropertyList: React.FC = () => {
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    search: '',
    city: '',
    status: '',
    min_price: undefined,
    max_price: undefined,
    sort: 'created_at',
    order: 'desc'
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertiesApi.getProperties(filters),
  });

  const handleFilterChange = (key: keyof PropertyFilters, value: string | number) => {
    let processedValue: any = value;
    
    // Handle number fields
    if ((key === 'min_price' || key === 'max_price') && typeof value === 'string') {
      processedValue = value === '' ? undefined : parseInt(value);
    }
    
    setFilters(prev => ({ ...prev, [key]: processedValue, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the query automatically when filters change
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      available: 'success',
      sold: 'danger',
      rented: 'warning',
      pending: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <Container className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">
          Có lỗi xảy ra khi tải dữ liệu: {(error as Error).message}
        </Alert>
      </Container>
    );
  }

  const properties = data?.data?.data || [];
  const meta = data?.data?.meta;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Danh sách Bất động sản</h1>
        <Link to="/properties/create">
          <Button variant="primary">Thêm mới</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={4}>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                  <Button variant="outline-secondary" type="submit">
                    Tìm kiếm
                  </Button>
                </InputGroup>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="mb-3"
                >
                  <option value="">Tất cả thành phố</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="mb-3"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="available">Còn trống</option>
                  <option value="sold">Đã bán</option>
                  <option value="rented">Đã cho thuê</option>
                  <option value="pending">Đang chờ</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Control
                  type="number"
                  placeholder="Giá tối thiểu"
                  value={filters.min_price || ''}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  className="mb-3"
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  type="number"
                  placeholder="Giá tối đa"
                  value={filters.max_price || ''}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  className="mb-3"
                />
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Properties List */}
      <Row>
        {properties.length === 0 ? (
          <Col>
            <Alert variant="info">Không có bất động sản nào.</Alert>
          </Col>
        ) : (
          properties.map((property: Property) => (
            <Col md={6} lg={4} key={property.id} className="mb-4">
              <Card className="h-100">
                {property.images && property.images.length > 0 && (
                  <Card.Img
                    variant="top"
                    src={property.images.find(img => img.is_primary)?.image_path || property.images[0].image_path}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{property.title}</Card.Title>
                  <Card.Text>
                    <strong>{formatPrice(property.price)}</strong><br />
                    <small className="text-muted">
                      {property.area} m² • {property.city}, {property.district}
                    </small>
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    {getStatusBadge(property.status)}
                    <div>
                      <Link to={`/properties/${property.id}`}>
                        <Button variant="outline-primary" size="sm" className="me-1">
                          Xem
                        </Button>
                      </Link>
                      <Link to={`/properties/${property.id}/edit`}>
                        <Button variant="outline-secondary" size="sm">
                          Sửa
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First 
              disabled={meta.current_page === 1}
              onClick={() => handleFilterChange('page', 1)}
            />
            <Pagination.Prev 
              disabled={meta.current_page === 1}
              onClick={() => handleFilterChange('page', meta.current_page - 1)}
            />
            
            {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
              const page = i + 1;
              return (
                <Pagination.Item
                  key={page}
                  active={page === meta.current_page}
                  onClick={() => handleFilterChange('page', page)}
                >
                  {page}
                </Pagination.Item>
              );
            })}
            
            <Pagination.Next 
              disabled={meta.current_page === meta.last_page}
              onClick={() => handleFilterChange('page', meta.current_page + 1)}
            />
            <Pagination.Last 
              disabled={meta.current_page === meta.last_page}
              onClick={() => handleFilterChange('page', meta.last_page)}
            />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default PropertyList;

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Carousel, 
  Alert, 
  Spinner,
  Modal
} from 'react-bootstrap';
import { useState } from 'react';
import { propertiesApi } from '../../services/api';
import { Property } from '../../types';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.getProperty(Number(id)),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => propertiesApi.deleteProperty(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate('/properties');
    },
    onError: (error) => {
      console.error('Delete failed:', error);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
    setShowDeleteModal(false);
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
    const labels: Record<string, string> = {
      available: 'Còn trống',
      sold: 'Đã bán',
      rented: 'Đã cho thuê',
      pending: 'Đang chờ'
    };
    return <Badge bg={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      apartment: 'Chung cư',
      house: 'Nhà riêng',
      villa: 'Biệt thự',
      office: 'Văn phòng',
      land: 'Đất nền'
    };
    return labels[type] || type;
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

  if (!property?.data) {
    return (
      <Container>
        <Alert variant="warning">Không tìm thấy bất động sản này.</Alert>
      </Container>
    );
  }

  const propertyData: Property = property.data;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/properties" className="text-decoration-none">
            ← Quay lại danh sách
          </Link>
        </div>
        <div>
          <Link to={`/properties/${id}/edit`}>
            <Button variant="primary" className="me-2">Chỉnh sửa</Button>
          </Link>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteMutation.isPending}
          >
            Xóa
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          {/* Image Gallery */}
          {propertyData.images && propertyData.images.length > 0 && (
            <Card className="mb-4">
              <Carousel>
                {propertyData.images.map((image, index) => (
                  <Carousel.Item key={image.id}>
                    <img
                      className="d-block w-100"
                      src={image.image_path}
                      alt={`${propertyData.title} - ${index + 1}`}
                      style={{ height: '400px', objectFit: 'cover' }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Card>
          )}

          {/* Property Description */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Mô tả</h4>
            </Card.Header>
            <Card.Body>
              <p>{propertyData.description || 'Không có mô tả.'}</p>
            </Card.Body>
          </Card>

          {/* Features */}
          {propertyData.features && propertyData.features.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h4>Tiện ích</h4>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap">
                  {propertyData.features.map((feature, index) => (
                    <Badge key={index} bg="light" text="dark" className="me-2 mb-2">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Property Info */}
          <Card className="mb-4">
            <Card.Header>
              <h3>{propertyData.title}</h3>
              {getStatusBadge(propertyData.status)}
            </Card.Header>
            <Card.Body>
              <h4 className="text-primary">{formatPrice(propertyData.price)}</h4>
              
              <hr />
              
              <div className="mb-3">
                <strong>Loại:</strong> {getPropertyTypeLabel(propertyData.property_type)}
              </div>
              
              <div className="mb-3">
                <strong>Diện tích:</strong> {propertyData.area} m²
              </div>
              
              {propertyData.bedrooms && (
                <div className="mb-3">
                  <strong>Phòng ngủ:</strong> {propertyData.bedrooms}
                </div>
              )}
              
              {propertyData.bathrooms && (
                <div className="mb-3">
                  <strong>Phòng tắm:</strong> {propertyData.bathrooms}
                </div>
              )}
              
              {propertyData.floors && (
                <div className="mb-3">
                  <strong>Số tầng:</strong> {propertyData.floors}
                </div>
              )}
              
              {propertyData.year_built && (
                <div className="mb-3">
                  <strong>Năm xây dựng:</strong> {propertyData.year_built}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Location */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Vị trí</h4>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Địa chỉ:</strong><br />
                {propertyData.address}
              </div>
              <div className="mb-2">
                <strong>Quận/Huyện:</strong> {propertyData.district}
              </div>
              <div className="mb-2">
                <strong>Thành phố:</strong> {propertyData.city}
              </div>
              {propertyData.postal_code && (
                <div className="mb-2">
                  <strong>Mã bưu điện:</strong> {propertyData.postal_code}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Contact Info */}
          <Card>
            <Card.Header>
              <h4>Thông tin liên hệ</h4>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Người liên hệ:</strong> {propertyData.contact_name}
              </div>
              <div className="mb-2">
                <strong>Điện thoại:</strong> 
                <a href={`tel:${propertyData.contact_phone}`} className="ms-1">
                  {propertyData.contact_phone}
                </a>
              </div>
              {propertyData.contact_email && (
                <div className="mb-2">
                  <strong>Email:</strong> 
                  <a href={`mailto:${propertyData.contact_email}`} className="ms-1">
                    {propertyData.contact_email}
                  </a>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa bất động sản "{propertyData.title}" không?
          Thao tác này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PropertyDetail;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner 
} from 'react-bootstrap';
import { propertiesApi } from '../../services/api';
import { PropertyFormData } from '../../types';

const PropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    property_type: 'apartment',
    status: 'available',
    price: 0,
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    floors: 1,
    address: '',
    city: '',
    district: '',
    postal_code: '',
    latitude: undefined,
    longitude: undefined,
    year_built: undefined,
    features: [],
    contact_name: '',
    contact_phone: '',
    contact_email: '',
  });

  const [featuresInput, setFeaturesInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Fetch existing property data for editing
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.getProperty(Number(id)),
    enabled: isEdit,
  });

  // Set form data when property data is loaded
  React.useEffect(() => {
    if (property?.data && isEdit) {
      const propertyData = property.data;
      setFormData({
        title: propertyData.title,
        description: propertyData.description || '',
        property_type: propertyData.property_type,
        status: propertyData.status,
        price: propertyData.price,
        area: propertyData.area,
        bedrooms: propertyData.bedrooms || 0,
        bathrooms: propertyData.bathrooms || 0,
        floors: propertyData.floors || 1,
        address: propertyData.address,
        city: propertyData.city,
        district: propertyData.district,
        postal_code: propertyData.postal_code || '',
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        year_built: propertyData.year_built,
        features: propertyData.features || [],
        contact_name: propertyData.contact_name,
        contact_phone: propertyData.contact_phone,
        contact_email: propertyData.contact_email || '',
      });
      setFeaturesInput((propertyData.features || []).join(', '));
    }
  }, [property, isEdit]);

  const createMutation = useMutation({
    mutationFn: (data: PropertyFormData) => propertiesApi.createProperty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate('/properties');
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PropertyFormData) => propertiesApi.updateProperty(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      navigate(`/properties/${id}`);
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === 'number') {
      processedValue = value === '' ? 0 : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData(prev => ({
        ...prev,
        images: files,
      }));

      // Create preview URLs
      const previews: string[] = [];
      Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file);
        previews.push(url);
      });
      setPreviewImages(previews);
    }
  };

  const handleFeaturesChange = (value: string) => {
    setFeaturesInput(value);
    const featuresArray = value.split(',').map(f => f.trim()).filter(f => f.length > 0);
    setFormData(prev => ({
      ...prev,
      features: featuresArray,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors[fieldName]?.[0];
  };

  if (isEdit && isLoading) {
    return (
      <Container className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  const mutation = isEdit ? updateMutation : createMutation;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEdit ? 'Chỉnh sửa' : 'Thêm mới'} bất động sản</h1>
        <Link to={isEdit ? `/properties/${id}` : '/properties'}>
          <Button variant="secondary">Hủy</Button>
        </Link>
      </div>

      {mutation.error && (
        <Alert variant="danger">
          Có lỗi xảy ra: {(mutation.error as any)?.response?.data?.message || mutation.error.message}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header>
                <h4>Thông tin cơ bản</h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tiêu đề *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        isInvalid={!!getFieldError('title')}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {getFieldError('title')}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Loại bất động sản *</Form.Label>
                      <Form.Select
                        name="property_type"
                        value={formData.property_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="apartment">Chung cư</option>
                        <option value="house">Nhà riêng</option>
                        <option value="villa">Biệt thự</option>
                        <option value="office">Văn phòng</option>
                        <option value="land">Đất nền</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Trạng thái *</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="available">Còn trống</option>
                        <option value="sold">Đã bán</option>
                        <option value="rented">Đã cho thuê</option>
                        <option value="pending">Đang chờ</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Giá (VND) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        isInvalid={!!getFieldError('price')}
                        required
                        min="0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {getFieldError('price')}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Diện tích (m²) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        isInvalid={!!getFieldError('area')}
                        required
                        min="0"
                        step="0.1"
                      />
                      <Form.Control.Feedback type="invalid">
                        {getFieldError('area')}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số phòng ngủ</Form.Label>
                      <Form.Control
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số phòng tắm</Form.Label>
                      <Form.Control
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số tầng</Form.Label>
                      <Form.Control
                        type="number"
                        name="floors"
                        value={formData.floors}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tiện ích</Form.Label>
                  <Form.Control
                    type="text"
                    value={featuresInput}
                    onChange={(e) => handleFeaturesChange(e.target.value)}
                    placeholder="Ví dụ: Hồ bơi, Phòng gym, Sân vườn (phân cách bằng dấu phẩy)"
                  />
                  <Form.Text className="text-muted">
                    Phân cách các tiện ích bằng dấu phẩy
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h4>Hình ảnh</h4>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Chọn hình ảnh</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Form.Text className="text-muted">
                    Có thể chọn nhiều hình ảnh cùng lúc
                  </Form.Text>
                </Form.Group>

                {previewImages.length > 0 && (
                  <div>
                    <h6>Xem trước:</h6>
                    <Row>
                      {previewImages.map((url, index) => (
                        <Col md={3} key={index} className="mb-2">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="img-thumbnail"
                            style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="mb-4">
              <Card.Header>
                <h4>Vị trí</h4>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ *</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    isInvalid={!!getFieldError('address')}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {getFieldError('address')}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Thành phố *</Form.Label>
                  <Form.Select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    isInvalid={!!getFieldError('city')}
                    required
                  >
                    <option value="">Chọn thành phố</option>
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {getFieldError('city')}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Quận/Huyện *</Form.Label>
                  <Form.Control
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    isInvalid={!!getFieldError('district')}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {getFieldError('district')}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mã bưu điện</Form.Label>
                  <Form.Control
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Năm xây dựng</Form.Label>
                  <Form.Control
                    type="number"
                    name="year_built"
                    value={formData.year_built || ''}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h4>Thông tin liên hệ</h4>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Tên người liên hệ *</Form.Label>
                  <Form.Control
                    type="text"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleInputChange}
                    isInvalid={!!getFieldError('contact_name')}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {getFieldError('contact_name')}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    isInvalid={!!getFieldError('contact_phone')}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {getFieldError('contact_phone')}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email liên hệ</Form.Label>
                  <Form.Control
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    isInvalid={!!getFieldError('contact_email')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {getFieldError('contact_email')}
                  </Form.Control.Feedback>
                </Form.Group>
              </Card.Body>
            </Card>

            <div className="d-grid gap-2">
              <Button
                variant="primary"
                type="submit"
                size="lg"
                disabled={mutation.isPending}
              >
                {mutation.isPending 
                  ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo...') 
                  : (isEdit ? 'Cập nhật' : 'Tạo mới')
                }
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default PropertyForm;

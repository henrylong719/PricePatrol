import { useGetWatchesQuery } from '../slices/watchesApiSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Col, Container, Dropdown, Row } from 'react-bootstrap';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaPlus } from 'react-icons/fa';
import Loader from '../components/Loader';
import Message from '../components/Message';
import type { IWatch } from '../interfaces';
import Watch from '../components/Watch';
import Breadcrumbs from '../components/Breadcrumbs';
import Meta from '../components/Meta';

const UserWatchListScreen = () => {
  const navigate = useNavigate();

  const { data: watches = [], isLoading, error } = useGetWatchesQuery();

  const onEditProduct = (id: string) => {
    navigate(`/user/watches/${id}/edit`);
  };

  if (isLoading || !watches)
    return (
      <Container className="mt-4">
        <Loader />;
      </Container>
    );

  if (error)
    return (
      <Container className="mt-4">
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      </Container>
    );

  const renderListings = () => {
    return (
      <>
        {watches?.length > 0 ? (
          <Row>
            {watches.map((watch: IWatch) => (
              <Col key={watch.slug} sm={12} md={6} lg={4} xl={3}>
                <Dropdown className="d-flex justify-content-end">
                  <Dropdown.Toggle
                    variant="transparent"
                    id="dropdown-basic"
                    style={{
                      position: 'relative',
                      top: '3rem',
                      right: '0.5rem',
                      zIndex: 1,
                    }}
                  >
                    <BsThreeDotsVertical size={'1.5rem'} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() => onEditProduct(watch.slug as string)}
                    >
                      Edit
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <Watch watch={watch} />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="mt-2">
            <Message variant="light">
              You currently have no waches available
            </Message>
          </div>
        )}
      </>
    );
  };

  return (
    <Container>
      <Meta />
      <div className="mt-4">
        <Breadcrumbs path="watchlist" />
      </div>
      <Row>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <h3>My Watchlist</h3>
          <div>
            <Button variant="outline-light" style={{ padding: '0.7rem' }}>
              <Link
                to="/watches/create"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FaPlus /> Add New Watch
              </Link>
            </Button>
          </div>
        </div>
      </Row>
      {renderListings()}
    </Container>
  );
};

export default UserWatchListScreen;

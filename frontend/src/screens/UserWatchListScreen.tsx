import { useGetWatchesQuery } from '../slices/watchesApiSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Col, Container, Dropdown, Row } from 'react-bootstrap';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaPlus } from 'react-icons/fa';
import Loader from '../components/Loader';
import Message from '../components/Message';
import type { IWatch } from '../interfaces';
import Watch from '../components/Watch';

const UserWatchListScreen = () => {
  const navigate = useNavigate();

  const { data = [], isLoading, error } = useGetWatchesQuery();

  const onEditProduct = (id: string) => {
    navigate(`/user/watches/${id}/edit`);
  };

  const renderListings = () => {
    return (
      <>
        {data && data.length > 0 ? (
          <Row>
            {data.map((watch: IWatch) => (
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
          <div className="mt-4">
            <Message variant="light">
              You currently have no waches available
            </Message>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <style>
        {`
          .dropdown-toggle::after {
            display: none !important;
        }
        `}
      </style>
      <Container>
        {isLoading && data?.length === 0 ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            <Row></Row>
            {renderListings()}
          </>
        )}
      </Container>
    </>
  );
};

export default UserWatchListScreen;

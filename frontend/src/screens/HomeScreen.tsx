import { Row, Col, Container } from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import type { IWatch } from '../interfaces';
import Watch from '../components/Watch';
import { useGetPublicWatchesQuery } from '../slices/watchesApiSlice';

const HomeScreen: React.FC = () => {
  const { data, isLoading, error } = useGetPublicWatchesQuery();

  return (
    <>
      <Container>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            <Row>
              {data?.map((watch: IWatch) => (
                <Col key={watch.slug} sm={12} md={6} lg={4} xl={3}>
                  <Watch watch={watch} />
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>
    </>
  );
};

export default HomeScreen;

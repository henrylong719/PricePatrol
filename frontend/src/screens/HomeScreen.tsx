import { Row, Col, Container } from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import type { IWatch } from '../interfaces';
import Watch from '../components/Watch';
import { useGetPublicWatchesQuery } from '../slices/watchesApiSlice';

const HomeScreen: React.FC = () => {
  const { data, isLoading, error } = useGetPublicWatchesQuery();

  if (isLoading)
    return (
      <Container>
        <Loader />
      </Container>
    );

  if (error)
    return (
      <Container>
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      </Container>
    );

  return (
    <>
      <Container>
        <Row>
          {data?.map((watch: IWatch) => (
            <Col key={watch.id} sm={12} md={6} lg={4} xl={3}>
              <Watch watch={watch} isLanding={true} />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default HomeScreen;

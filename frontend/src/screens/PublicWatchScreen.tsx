import { type CSSProperties } from 'react';
import { Card, Col, Container, Row, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { useGetPublicWatchBySlugQuery } from '../slices/watchesApiSlice';
import { formatDistanceToNow } from 'date-fns';
import { humanizeAdapterName } from '../helpers';

const PublicWatchScreen = () => {
  const { slug } = useParams();

  const {
    data: watch,
    isLoading,
    error,
  } = useGetPublicWatchBySlugQuery({ slug: slug as string });

  return (
    <Container className="mt-4">
      {isLoading || !watch ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Container>
          <Meta title={watch.name} />
          {/* <div className="mb-4">
            <Breadcrumbs />
          </div> */}

          <Row className="mt-4">
            <Card className="my-2 py-4">
              <Row>
                <Col xs={12} sm={6} md={4}>
                  <Card.Img src={watch.imageUrl} style={styles.cardImgTop} />
                </Col>

                <Col xs={12} sm={6} md={8}>
                  <Row>
                    <div>
                      <span style={{ color: '#777777' }}>
                        Found by {watch.user.name}
                      </span>{' '}
                      <span style={{ color: '#777777' }}>&#x2022;</span>{' '}
                      <span style={{ color: '#777777' }}>
                        {formatDistanceToNow(new Date(watch.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </Row>

                  <Row className="mt-3">
                    <h3 style={{ color: '#111111' }}>{watch.name}</h3>
                  </Row>

                  <Row className="mt-3">
                    <h3>$ {watch.latestPrice}</h3>

                    <div className="mt-3">
                      <Button variant="primary p-2">
                        <a
                          href={watch.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#fff',
                            textDecoration: 'none',
                            display: 'block',
                          }}
                        >
                          Get deal at {humanizeAdapterName(watch.adapter.name)}
                        </a>
                      </Button>
                    </div>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Row>

          <Row>
            <Card className="my-2">statistic</Card>
          </Row>
        </Container>
      )}
    </Container>
  );
};

export default PublicWatchScreen;

const styles = {
  cardImgTop: {
    padding: '10px',
    maxHeight: '320px',
    objectFit: 'contain', // scale the image down (letterbox if needed)
  } as CSSProperties,
};

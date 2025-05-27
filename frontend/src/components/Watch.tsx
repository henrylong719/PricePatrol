import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import type { IWatch } from '../interfaces';
import { formatDistanceToNow } from 'date-fns';
import { Image } from 'react-bootstrap';
import UserIcon from './UserIcon';
import { humanizeAdapterName } from '../helpers';

type WatchProps = {
  watch: IWatch;
  isLanding?: boolean;
};

const Watch = ({ watch, isLanding = false }: WatchProps) => {
  console.log(watch);
  return (
    <>
      <Card className="my-2 rounded watch-card" style={styles.productCard}>
        <style>
          {`
            .watch-card {
              transition: box-shadow 0.3s ease-in-out;
            }
            .watch-card:hover {
              box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
            }
          `}
        </style>
        <Link to={`/watches/${watch._id}`} style={styles.linkStyle}>
          {isLanding && (
            <Card.Header>
              <div className="d-flex gap-2">
                {watch?.user?.profileImage ? (
                  <Image
                    style={{ height: '50px' }}
                    src={watch.user.profileImage}
                    alt="background image"
                    thumbnail
                    roundedCircle
                  />
                ) : (
                  <UserIcon watch={watch} />
                )}
                <div>
                  <div>
                    <span style={{ color: '#999999' }}>found by </span>
                    <span style={{ color: '#555555' }}>
                      {watch.user.name}
                    </span>{' '}
                  </div>
                  <div style={{ color: '#999999' }}>
                    {formatDistanceToNow(new Date(watch.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </Card.Header>
          )}
          <Card.Img
            src={watch.imageUrl}
            variant="top"
            style={styles.cardImgTop}
          />
        </Link>

        <Card.Body>
          <Link to={`/watches/${watch._id}`} style={styles.linkStyle}>
            <Card.Title as="div" className="watch-title">
              <p style={styles.cardTitle}>{watch.name}</p>
            </Card.Title>
          </Link>

          <Card.Text style={styles.cardTextPrice} as="h4">
            ${watch.latestPrice}
          </Card.Text>

          <Card.Text
            as="div"
            className="d-flex justify-content-between"
            style={styles.cardTextLocation}
          >
            <div>{humanizeAdapterName(watch.adapter.name)}</div>
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
};

export default Watch;

const styles = {
  productCard: {
    transition: 'box-shadow 0.3s ease-in-out',
  } as CSSProperties,
  cardImgTop: {
    height: '250px',
    objectFit: 'cover',
    objectPosition: 'center',
    padding: '10px',
  } as CSSProperties,
  cardTitle: {
    fontWeight: 500,
    fontSize: '1.1rem',
    textDecoration: 'none',
    color: '#000',
  } as CSSProperties,
  cardTextPrice: {
    color: '#1049AD',
  } as CSSProperties,
  cardTextLocation: {
    color: '#9A9A9A',
  } as CSSProperties,
  linkStyle: {
    textDecoration: 'none',
  } as CSSProperties,
};

import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import type { IWatch } from '../interfaces';

const Watch = ({ watch }: { watch: IWatch }) => {
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
        <Link to={`/watches/${watch.slug}`} style={styles.linkStyle}>
          <Card.Img
            src={watch.imageUrl}
            variant="top"
            style={styles.cardImgTop}
          />
        </Link>

        <Card.Body>
          <Link to={`/watches/${watch.slug}`} style={styles.linkStyle}>
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
            {/* <div>{watch.location.administrativeAreaLevel1}</div> */}
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

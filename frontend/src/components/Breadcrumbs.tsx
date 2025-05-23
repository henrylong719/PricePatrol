import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

type BreadcrumbsProps = {
  path?: string;
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path }) => {
  const location = useLocation();
  const fullPath = path ?? location.pathname;
  const pathnames = fullPath.split('/').filter((x) => x);

  return (
    <Breadcrumb>
      <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/` }}>
        <span style={{ color: '#000' }}>Home</span>
      </Breadcrumb.Item>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        const isLast = index === pathnames.length - 1;
        const label = decodeURIComponent(value);

        return isLast ? (
          <Breadcrumb.Item active key={to} style={{ color: '#000' }}>
            {label}
          </Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item
            linkAs={Link}
            linkProps={{ to }}
            key={to}
            style={{ color: '#000' }}
          >
            {label}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default Breadcrumbs;

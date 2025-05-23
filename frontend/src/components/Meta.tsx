import { Helmet } from '@dr.pogodin/react-helmet';

const DEFAULT_KEYWORDS = [
  'price tracker',
  'price alert',
  'price monitoring',
  'deal alerts',
  'discount tracker',
  'product tracker',
  'real-time price drop alerts',
  'online price monitoring service',
  'track price changes on any retailer',
  'get notified when price falls',
  'best price tracker for Amazon',
  'multi-retailer price tracking',
  'custom price alerts and notifications',
].join(', ');

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const Meta = ({
  title = 'Welcome To Price Patrol',
  description = 'Always on guard for the best deal.',
  keywords = DEFAULT_KEYWORDS,
}: MetaProps) => {
  return (
    <Helmet>
      {/* Basic tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Viewport for responsive */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />
      {/* You can add a default image URL for social cards */}
      <meta property="og:image" content="/og-default-image.png" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="/twitter-default-image.png" />
    </Helmet>
  );
};

export default Meta;

import type { IWatch } from '../interfaces';

const COLORS = [
  '#FFB6C1', // LightPink
  '#ADD8E6', // LightBlue
  '#90EE90', // LightGreen
  '#FFD700', // Gold
  '#FFA500', // Orange
  '#9370DB', // MediumPurple
  '#FFC0CB', // Pink
  '#20B2AA', // LightSeaGreen
];

const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  // Calculate luminance using YIQ formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  // Return dark text for light backgrounds, white text for dark backgrounds
  return yiq >= 128 ? '#000000' : '#FFFFFF';
};

const UserIcon = ({ watch }: { watch: IWatch }) => {
  const name = watch.user.name || '';
  // Compute a simple hash: sum of character codes
  const charSum = Array.from(name).reduce(
    (sum, ch) => sum + ch.charCodeAt(0),
    0
  );
  // Pick one of the 8 colors based on the hash
  const backgroundColor = COLORS[charSum % COLORS.length];
  // Determine a contrasting text color
  const textColor = getContrastColor(backgroundColor);

  return (
    <div
      style={{
        height: '50px',
        width: '50px',
        borderRadius: '100px',
        backgroundColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <span style={{ fontSize: '20px', color: textColor }}>
        {name.charAt(0).toLowerCase()}
      </span>
    </div>
  );
};

export default UserIcon;

export default function RiskLotIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="RiskLot logo">
      <line x1="13" y1="13" x2="35" y2="35" stroke="#4F6FFF" strokeWidth={8} strokeLinecap="round" />
      <line x1="35" y1="13" x2="13" y2="35" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
    </svg>
  );
}

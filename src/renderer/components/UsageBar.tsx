import React from 'react';
import { t } from '../i18n/translations';

interface UsageBarProps {
  label: string;
  value: number; // 0-100
  showRemaining?: boolean;
  color?: string;
}

function getColor(value: number): string {
  if (value < 50) return '#d98f40';  // Claude orange
  if (value < 75) return '#e8a04e';
  if (value < 90) return '#e07840';
  return '#d45230';
}

export const UsageBar: React.FC<UsageBarProps> = ({ label, value, showRemaining = true, color }) => {
  const safeValue = (value == null || isNaN(value)) ? 0 : Math.max(0, Math.min(100, value));
  const displayValue = showRemaining ? Math.max(0, 100 - safeValue) : safeValue;
  const barColor = color ?? getColor(safeValue);
  const suffix = showRemaining ? t('popover.remaining') : t('popover.used');

  return (
    <div className="usage-bar-container">
      <div className="usage-bar-header">
        <span className="usage-bar-label">{label}</span>
        <span className="usage-bar-value" style={{ color: barColor }}>
          {displayValue}% <span className="usage-bar-suffix">{suffix}</span>
        </span>
      </div>
      <div className="usage-bar-track">
        <div
          className="usage-bar-fill"
          style={{
            width: `${safeValue}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
};

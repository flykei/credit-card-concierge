interface CurrencyInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  unit?: string;
  size?: 'small' | 'large';
}

export default function CurrencyInput({
  id,
  label,
  value,
  onChange,
  required = false,
  placeholder = '0',
  helpText,
  unit = '万円',
  size = 'large',
}: CurrencyInputProps) {
  const formatDisplayNumber = (value: string) => {
    if (!value) return '';
    return parseInt(value).toLocaleString('ja-JP');
  };

  const handleChange = (rawValue: string) => {
    const sanitized = rawValue.replace(/[^\d]/g, '');
    onChange(sanitized);
  };

  const inputClass = size === 'large' ? 'input input--large' : 'input';
  const unitClass = size === 'large' ? 'input__unit input__unit--large' : 'input__unit';

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label form-label--large">
        {label} {required && <span className="form-label__required">*</span>}
      </label>
      <div className="input-wrapper">
        <input
          type="text"
          id={id}
          value={value ? formatDisplayNumber(value) : ''}
          onChange={(e) => handleChange(e.target.value)}
          className={inputClass}
          placeholder={placeholder}
          required={required}
        />
        <span className={unitClass}>{unit}</span>
      </div>
      {helpText && <p className="form-help">{helpText}</p>}
    </div>
  );
}

import React from 'react';
import PropTypes from 'prop-types';

const DateField = ({
  label,
  value,
  onDateChange,
}) => {
  const id = `${label.toLowerCase()}Date`;

  return (
    <label htmlFor={id}>
      {label}
      :
      <input
        type="date"
        id={id}
        name={id}
        value={value}
        onChange={onDateChange}
      />
    </label>
  );
};

DateField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onDateChange: PropTypes.func.isRequired,
};

DateField.defaultProps = {
  value: '',
};

export default DateField;

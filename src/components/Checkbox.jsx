import React from 'react';
import PropTypes from 'prop-types';

const Checkbox = ({
  name,
  id,
  checked,
  onCheckboxChange,
  children,
}) => (
  <label htmlFor={id || name}>
    <input
      type="checkbox"
      id={id || name}
      name={name}
      value={id}
      checked={checked}
      onChange={onCheckboxChange}
    />
    {children}
  </label>
);

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string,
  checked: PropTypes.bool,
  onCheckboxChange: PropTypes.func.isRequired,
  children: PropTypes.node,
};

Checkbox.defaultProps = {
  id: '',
  checked: false,
  children: null,
};

export default Checkbox;

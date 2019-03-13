import React from 'react';
import PropTypes from 'prop-types';
import style from '../styles/Thumb.scss';

const Thumb = ({
  className,
  children,
  count,
}) => (
  <div className={`${style.root} ${style[className]}`}>
    {children}
    <span>{count}</span>
  </div>
);

Thumb.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  count: PropTypes.number.isRequired,
};

Thumb.defaultProps = {
  className: '',
  children: null,
};

export default Thumb;

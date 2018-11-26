import React from 'react';
import DateField from './DateField';
import Checkbox from './Checkbox';

class SettingsForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.domains = {
      lifewire: 'Lifewire',
      thebalance: 'The Balance',
      thespruce: 'The Spruce',
      thoughtco: 'ThoughtCo',
      tripsavvy: 'TripSavvy',
      verywell: 'VeryWell',
    };
  }

  componentDidMount = () => {
    chrome.storage.local.get(null, (data) => { // eslint-disable-line no-undef
      this.setState(data);
    });
  }

  saveSettings = (newSetting) => {
    this.setState((prevState) => {
      const newState = {
        ...prevState,
        ...newSetting,
        domains: {
          ...prevState.domains,
          ...newSetting.domains,
        },
      };

      chrome.storage.local.set(newState); // eslint-disable-line no-undef
      return newState;
    });
  }

  onCheckboxChange = (event) => {
    this.saveSettings({
      [event.target.name]: event.target.value
        ? { [event.target.value]: event.target.checked }
        : event.target.checked,
    });
  }

  onDateChange = (event) => {
    this.saveSettings({ [event.target.name]: event.target.value });
  }

  render() {
    const {
      hideOverlay,
      domains,
      fromDate,
      toDate,
    } = this.state;

    return (
      <form>
        <Checkbox
          name="hideOverlay"
          checked={hideOverlay}
          onCheckboxChange={this.onCheckboxChange}
        >
          Hide Overlay
        </Checkbox>
        <p>Enabled for:</p>
        <ul>
          {Object.keys(this.domains).map(domain => (
            <li key={domain}>
              <Checkbox
                name="domains"
                id={domain}
                checked={domains ? domains[domain] : false}
                onCheckboxChange={this.onCheckboxChange}
              >
                {this.domains[domain]}
              </Checkbox>
            </li>
          ))}
        </ul>
        <DateField
          label="From"
          onDateChange={this.onDateChange}
          value={fromDate}
        />
        <DateField
          label="To"
          onDateChange={this.onDateChange}
          value={toDate}
        />
      </form>
    );
  }
}

export default SettingsForm;

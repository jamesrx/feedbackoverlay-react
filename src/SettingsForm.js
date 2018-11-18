import React from 'react';

class DateField extends React.Component {
	render() {
		return (
			<label>
				{this.props.label}: <input type="date" name={this.props.label.toLowerCase() + "Date"} value={this.props.value} onChange={this.props.onDateChange} />
			</label>
		);
	}
}

class Checkbox extends React.Component {
	render() {
		return (
			<label>
				<input type="checkbox" name={this.props.name} value={this.props.value || ''} checked={this.props.checked || false} onChange={this.props.onCheckboxChange} />
				&nbsp;{this.props.children}
			</label>
		);
	}
}

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
			verywell: 'VeryWell'
		}
	}

	componentDidMount = () => {
		chrome.storage.local.get(null, data => { // eslint-disable-line no-undef
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
					...newSetting.domains
				}
			};

			chrome.storage.local.set(newState); // eslint-disable-line no-undef
			return newState;
		});
	}

	onCheckboxChange = (event) => {
		this.saveSettings({
			[event.target.name]: event.target.value ?
				{[event.target.value] : event.target.checked} :
				event.target.checked
		});
	}

	onDateChange = (event) => {
		this.saveSettings({[event.target.name]: event.target.value});
	}

	render() {
		return (
			<form>
				<Checkbox
					name="hideOverlay"
					checked={this.state.hideOverlay}
					onCheckboxChange={this.onCheckboxChange}>
					Hide Overlay
				</Checkbox>
				<p>Enabled for:</p>
				<ul>
					{Object.keys(this.domains).map(domain => (
						<li key={domain}>
							<Checkbox
								name="domains"
								value={domain}
								checked={this.state.domains ? this.state.domains[domain] : false}
								onCheckboxChange={this.onCheckboxChange}>
								{this.domains[domain]}
							</Checkbox>
						</li>
					))}
				</ul>
				<DateField
					label="From"
					onDateChange={this.onDateChange}
					value={this.state.fromDate}
				/>
				<DateField
					label="To"
					onDateChange={this.onDateChange}
					value={this.state.toDate}
				/>
			</form>
		);
	}
}

export default SettingsForm;

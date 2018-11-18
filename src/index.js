import React from 'react';
import ReactDOM from 'react-dom';
import SettingsForm from './SettingsForm';
import FeedbackOverlay from './FeedbackOverlay';

const settingsForm = document.getElementById('settings-form-root');

if (settingsForm) {
    ReactDOM.render(<SettingsForm />, settingsForm);
} else {
    const bodyContent = document.getElementsByTagName('body')[0];
    const feedbackOverlay = document.createElement('div');

    feedbackOverlay.id = 'feedback-overlay-root';
    bodyContent.append(feedbackOverlay);
    ReactDOM.render(<FeedbackOverlay />, feedbackOverlay);
}